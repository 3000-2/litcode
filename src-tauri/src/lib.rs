mod commands;

use commands::{
    config_read, config_write,
    create_dir, file_exists, git_diff, git_diff_untracked, git_revert_file, git_revert_hunk,
    git_revert_lines, git_stage_file, git_status, git_unstage_file, read_dir, read_file,
    remove_path, rename_path, write_file,
    terminal_spawn, terminal_write, terminal_resize, terminal_kill, init_terminal_state,
    search_content, search_files,
};
use std::env;

use std::path::Path;
use std::fs;

#[tauri::command]
fn get_initial_path() -> String {
    env::var("LITCODE_INITIAL_PATH").unwrap_or_default()
}

#[tauri::command]
fn install_cli() -> Result<String, String> {
    let app_bundle = "/Applications/Litcode.app";
    let home = env::var("HOME").map_err(|_| "Could not determine home directory")?;
    let cli_dir = format!("{}/.local/bin", home);
    let cli_path = format!("{}/litcode", cli_dir);
    
    if !Path::new(app_bundle).exists() {
        return Err("Litcode.app not found in /Applications. Please move the app there first.".to_string());
    }
    
    let script = r#"#!/bin/bash
if [ -z "$1" ]; then
    open -a Litcode
else
    [[ "$1" = /* ]] && ABS_PATH="$1" || { [ -d "$1" ] && ABS_PATH="$(cd "$1" 2>/dev/null && pwd)" || ABS_PATH="$(cd "$(dirname "$1")" 2>/dev/null && pwd)/$(basename "$1")"; }
    open -a Litcode --args "$ABS_PATH"
fi
"#;
    
    if !Path::new(&cli_dir).exists() {
        fs::create_dir_all(&cli_dir).map_err(|e| format!("Failed to create ~/.local/bin: {}", e))?;
    }
    
    if Path::new(&cli_path).exists() {
        fs::remove_file(&cli_path).map_err(|e| format!("Failed to remove existing file: {}", e))?;
    }
    
    fs::write(&cli_path, script).map_err(|e| format!("Failed to write CLI script: {}", e))?;
    
    use std::os::unix::fs::PermissionsExt;
    let mut perms = fs::metadata(&cli_path).map_err(|e| format!("Failed to read permissions: {}", e))?.permissions();
    perms.set_mode(0o755);
    fs::set_permissions(&cli_path, perms).map_err(|e| format!("Failed to set permissions: {}", e))?;
    
    let path_env = env::var("PATH").unwrap_or_default();
    if !path_env.contains(&cli_dir) {
        return Ok(format!("CLI installed to ~/.local/bin/litcode\n\nAdd to PATH by running:\necho 'export PATH=\"$HOME/.local/bin:$PATH\"' >> ~/.zshrc && source ~/.zshrc"));
    }
    
    Ok("CLI installed successfully! You can now use 'litcode .' to open directories.".to_string())
}

#[tauri::command]
fn uninstall_cli() -> Result<String, String> {
    let home = env::var("HOME").map_err(|_| "Could not determine home directory")?;
    let cli_path = format!("{}/.local/bin/litcode", home);
    let legacy_path = "/usr/local/bin/litcode";
    
    let mut removed = false;
    
    if Path::new(&cli_path).exists() {
        fs::remove_file(&cli_path).map_err(|e| format!("Failed to remove CLI: {}", e))?;
        removed = true;
    }
    
    if Path::new(legacy_path).exists() {
        match fs::remove_file(legacy_path) {
            Ok(_) => removed = true,
            Err(e) if e.kind() == std::io::ErrorKind::PermissionDenied => {
                if removed {
                    return Ok("CLI uninstalled from ~/.local/bin.\nNote: Legacy install at /usr/local/bin/litcode requires: sudo rm /usr/local/bin/litcode".to_string());
                }
                return Err("Permission denied. Run: sudo rm /usr/local/bin/litcode".to_string());
            }
            Err(e) => return Err(format!("Failed to remove legacy CLI: {}", e)),
        }
    }
    
    if !removed {
        return Ok("CLI is not installed.".to_string());
    }
    
    Ok("CLI uninstalled successfully.".to_string())
}

#[tauri::command]
fn is_cli_installed() -> bool {
    let home = env::var("HOME").unwrap_or_default();
    let cli_path = format!("{}/.local/bin/litcode", home);
    Path::new(&cli_path).exists() || Path::new("/usr/local/bin/litcode").exists()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            init_terminal_state(app);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            config_read,
            config_write,
            read_file,
            write_file,
            read_dir,
            file_exists,
            create_dir,
            remove_path,
            rename_path,
            git_status,
            git_diff,
            git_diff_untracked,
            git_revert_file,
            git_revert_hunk,
            git_revert_lines,
            git_stage_file,
            git_unstage_file,
            get_initial_path,
            install_cli,
            uninstall_cli,
            is_cli_installed,
            terminal_spawn,
            terminal_write,
            terminal_resize,
            terminal_kill,
            search_content,
            search_files,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
