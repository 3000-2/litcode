use portable_pty::{native_pty_system, CommandBuilder, MasterPty, PtySize};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::{AppHandle, Emitter, Manager};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TerminalSpawnResult {
    pub id: String,
}

struct TerminalInstance {
    writer: Box<dyn Write + Send>,
    master: Box<dyn MasterPty + Send>,
}

type TerminalMap = Arc<Mutex<HashMap<String, TerminalInstance>>>;

fn get_terminal_map(app: &AppHandle) -> TerminalMap {
    app.state::<TerminalMap>().inner().clone()
}

pub fn init_terminal_state<R: tauri::Runtime>(app: &tauri::App<R>) {
    app.manage(Arc::new(Mutex::new(HashMap::<String, TerminalInstance>::new())) as TerminalMap);
}

fn get_default_shell() -> String {
    if cfg!(target_os = "windows") {
        std::env::var("COMSPEC").unwrap_or_else(|_| "cmd.exe".to_string())
    } else {
        std::env::var("SHELL").unwrap_or_else(|_| {
            let shells = ["/bin/zsh", "/usr/bin/zsh", "/bin/bash", "/usr/bin/bash"];
            for shell in &shells {
                if std::path::Path::new(shell).exists() {
                    return shell.to_string();
                }
            }
            "/bin/sh".to_string()
        })
    }
}

#[tauri::command]
pub async fn terminal_spawn(
    app: AppHandle,
    cwd: Option<String>,
    rows: Option<u16>,
    cols: Option<u16>,
) -> Result<TerminalSpawnResult, String> {
    let id = generate_terminal_id();
    let rows = rows.unwrap_or(24);
    let cols = cols.unwrap_or(80);

    let pty_system = native_pty_system();
    let pty_pair = pty_system
        .openpty(PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| format!("Failed to open PTY: {}", e))?;

    let shell = get_default_shell();
    let mut cmd = CommandBuilder::new(&shell);

    if !cfg!(target_os = "windows") {
        cmd.arg("-l");
    }

    if let Some(ref dir) = cwd {
        if !dir.is_empty() && std::path::Path::new(dir).exists() {
            cmd.cwd(dir);
        }
    }

    cmd.env("TERM", "xterm-256color");
    cmd.env("COLORTERM", "truecolor");

    for (key, value) in std::env::vars() {
        if key != "TERM" && key != "COLORTERM" {
            cmd.env(&key, &value);
        }
    }

    let _child = pty_pair
        .slave
        .spawn_command(cmd)
        .map_err(|e| format!("Failed to spawn shell: {}", e))?;

    let writer = pty_pair
        .master
        .take_writer()
        .map_err(|e| format!("Failed to get PTY writer: {}", e))?;

    let reader = pty_pair
        .master
        .try_clone_reader()
        .map_err(|e| format!("Failed to get PTY reader: {}", e))?;

    let terminal_map = get_terminal_map(&app);
    {
        let mut map = terminal_map.lock().unwrap();
        map.insert(
            id.clone(),
            TerminalInstance {
                writer,
                master: pty_pair.master,
            },
        );
    }

    let read_id = id.clone();
    let read_app = app.clone();
    thread::spawn(move || {
        read_terminal_output(read_app, read_id, reader);
    });

    Ok(TerminalSpawnResult { id })
}

fn read_terminal_output(app: AppHandle, id: String, mut reader: Box<dyn Read + Send>) {
    let mut buffer = [0u8; 4096];
    loop {
        match reader.read(&mut buffer) {
            Ok(0) => {
                let _ = app.emit(&format!("terminal:exit:{}", id), ());
                break;
            }
            Ok(n) => {
                let data = buffer[..n].to_vec();
                let _ = app.emit(&format!("terminal:data:{}", id), data);
            }
            Err(e) => {
                eprintln!("Terminal read error: {}", e);
                let _ = app.emit(&format!("terminal:exit:{}", id), ());
                break;
            }
        }
    }

    let terminal_map: TerminalMap = app.state::<TerminalMap>().inner().clone();
    let mut map = terminal_map.lock().unwrap();
    map.remove(&id);
}

#[tauri::command]
pub async fn terminal_write(app: AppHandle, id: String, data: Vec<u8>) -> Result<(), String> {
    let terminal_map = get_terminal_map(&app);
    let mut map = terminal_map.lock().unwrap();

    if let Some(terminal) = map.get_mut(&id) {
        terminal
            .writer
            .write_all(&data)
            .map_err(|e| format!("Write failed: {}", e))?;
        terminal
            .writer
            .flush()
            .map_err(|e| format!("Flush failed: {}", e))?;
        Ok(())
    } else {
        Err(format!("Terminal {} not found", id))
    }
}

#[tauri::command]
pub async fn terminal_resize(
    app: AppHandle,
    id: String,
    rows: u16,
    cols: u16,
) -> Result<(), String> {
    let terminal_map = get_terminal_map(&app);
    let map = terminal_map.lock().unwrap();

    if let Some(terminal) = map.get(&id) {
        terminal
            .master
            .resize(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| format!("Resize failed: {}", e))?;
        Ok(())
    } else {
        Err(format!("Terminal {} not found", id))
    }
}

#[tauri::command]
pub async fn terminal_kill(app: AppHandle, id: String) -> Result<(), String> {
    let terminal_map = get_terminal_map(&app);
    let mut map = terminal_map.lock().unwrap();
    map.remove(&id);
    Ok(())
}

fn generate_terminal_id() -> String {
    use std::sync::atomic::{AtomicU64, Ordering};
    use std::time::{SystemTime, UNIX_EPOCH};

    static COUNTER: AtomicU64 = AtomicU64::new(0);

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos() as u64;
    let count = COUNTER.fetch_add(1, Ordering::Relaxed);

    format!("term-{:x}-{:x}", timestamp, count)
}
