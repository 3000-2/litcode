mod commands;

use commands::{
    create_dir, file_exists, git_diff, git_revert_file, git_revert_hunk, git_revert_lines,
    git_stage_file, git_status, git_unstage_file, read_dir, read_file, remove_path, rename_path,
    write_file,
};
use std::env;
use std::os::unix::fs::symlink;
use std::path::Path;
use std::fs;

#[tauri::command]
fn get_initial_path() -> String {
    env::var("LITCODE_INITIAL_PATH").unwrap_or_default()
}

#[tauri::command]
fn install_cli() -> Result<String, String> {
    let app_path = "/Applications/Litcode.app/Contents/MacOS/Litcode";
    let cli_path = "/usr/local/bin/litcode";
    
    if !Path::new(app_path).exists() {
        return Err("Litcode.app not found in /Applications. Please move the app there first.".to_string());
    }
    
    if Path::new(cli_path).exists() {
        fs::remove_file(cli_path).map_err(|e| format!("Failed to remove existing symlink: {}", e))?;
    }
    
    let parent = Path::new(cli_path).parent().unwrap();
    if !parent.exists() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    
    symlink(app_path, cli_path).map_err(|e| {
        if e.kind() == std::io::ErrorKind::PermissionDenied {
            "Permission denied. Run this command in terminal:\nsudo ln -sf /Applications/Litcode.app/Contents/MacOS/Litcode /usr/local/bin/litcode".to_string()
        } else {
            format!("Failed to create symlink: {}", e)
        }
    })?;
    
    Ok("CLI installed successfully! You can now use 'litcode .' to open directories.".to_string())
}

#[tauri::command]
fn uninstall_cli() -> Result<String, String> {
    let cli_path = "/usr/local/bin/litcode";
    
    if !Path::new(cli_path).exists() {
        return Ok("CLI is not installed.".to_string());
    }
    
    fs::remove_file(cli_path).map_err(|e| {
        if e.kind() == std::io::ErrorKind::PermissionDenied {
            "Permission denied. Run this command in terminal:\nsudo rm /usr/local/bin/litcode".to_string()
        } else {
            format!("Failed to remove symlink: {}", e)
        }
    })?;
    
    Ok("CLI uninstalled successfully.".to_string())
}

#[tauri::command]
fn is_cli_installed() -> bool {
    Path::new("/usr/local/bin/litcode").exists()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            read_file,
            write_file,
            read_dir,
            file_exists,
            create_dir,
            remove_path,
            rename_path,
            git_status,
            git_diff,
            git_revert_file,
            git_revert_hunk,
            git_revert_lines,
            git_stage_file,
            git_unstage_file,
            get_initial_path,
            install_cli,
            uninstall_cli,
            is_cli_installed,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
