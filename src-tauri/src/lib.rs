mod commands;

use commands::{
    create_dir, file_exists, git_diff, git_diff_untracked, git_revert_file, git_revert_hunk,
    git_revert_lines, git_stage_file, git_status, git_unstage_file, read_dir, read_file,
    remove_path, rename_path, write_file,
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
    let cli_path = "/usr/local/bin/litcode";
    
    if !Path::new(app_bundle).exists() {
        return Err("Litcode.app not found in /Applications. Please move the app there first.".to_string());
    }
    
    let script = r#"#!/bin/bash
# Litcode CLI - launches app detached from terminal

if [ -z "$1" ]; then
    open -a Litcode
else
    # Resolve to absolute path
    if [[ "$1" = /* ]]; then
        ABS_PATH="$1"
    else
        ABS_PATH="$(cd "$(dirname "$1")" 2>/dev/null && pwd)/$(basename "$1")"
        [ -d "$1" ] && ABS_PATH="$(cd "$1" 2>/dev/null && pwd)"
    fi
    open -a Litcode --args "$ABS_PATH"
fi
"#;
    
    if Path::new(cli_path).exists() {
        fs::remove_file(cli_path).map_err(|e| format!("Failed to remove existing file: {}", e))?;
    }
    
    let parent = Path::new(cli_path).parent().unwrap();
    if !parent.exists() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    
    fs::write(cli_path, script).map_err(|e| {
        if e.kind() == std::io::ErrorKind::PermissionDenied {
            format!("Permission denied. Run these commands in terminal:\nsudo tee {} << 'EOF'\n{}EOF\nsudo chmod +x {}", cli_path, script, cli_path)
        } else {
            format!("Failed to write CLI script: {}", e)
        }
    })?;
    
    use std::os::unix::fs::PermissionsExt;
    let mut perms = fs::metadata(cli_path).map_err(|e| format!("Failed to read permissions: {}", e))?.permissions();
    perms.set_mode(0o755);
    fs::set_permissions(cli_path, perms).map_err(|e| format!("Failed to set permissions: {}", e))?;
    
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
            format!("Failed to remove CLI: {}", e)
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
