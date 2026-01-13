use std::env;
use std::fs;
use std::path::Path;

fn get_config_path() -> Result<String, String> {
    let home = env::var("HOME").map_err(|_| "Could not determine home directory")?;
    Ok(format!("{}/.litcode/config.json", home))
}

fn ensure_config_dir() -> Result<(), String> {
    let home = env::var("HOME").map_err(|_| "Could not determine home directory")?;
    let dir = format!("{}/.litcode", home);
    if !Path::new(&dir).exists() {
        fs::create_dir_all(&dir).map_err(|e| format!("Failed to create config directory: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
pub fn config_read() -> Result<String, String> {
    let path = get_config_path()?;
    if !Path::new(&path).exists() {
        return Ok("{}".to_string());
    }
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn config_write(config: &str) -> Result<(), String> {
    ensure_config_dir()?;
    let path = get_config_path()?;
    fs::write(&path, config).map_err(|e| e.to_string())
}
