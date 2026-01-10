mod commands;

use commands::{
    create_dir, file_exists, git_diff, git_revert_file, git_revert_hunk, git_revert_lines,
    git_stage_file, git_status, git_unstage_file, read_dir, read_file, remove_path, rename_path,
    write_file,
};

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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
