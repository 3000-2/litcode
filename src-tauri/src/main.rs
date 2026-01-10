#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;
use std::path::PathBuf;

fn main() {
    let args: Vec<String> = env::args().collect();
    
    let initial_path = if args.len() > 1 {
        let path_arg = &args[1];
        let path = if path_arg == "." {
            env::current_dir().unwrap_or_else(|_| PathBuf::from("/"))
        } else {
            let p = PathBuf::from(path_arg);
            if p.is_absolute() {
                p
            } else {
                env::current_dir()
                    .unwrap_or_else(|_| PathBuf::from("/"))
                    .join(p)
            }
        };
        path.canonicalize().unwrap_or(path).to_string_lossy().to_string()
    } else {
        String::new()
    };

    env::set_var("LITCODE_INITIAL_PATH", &initial_path);
    
    litcode_lib::run()
}
