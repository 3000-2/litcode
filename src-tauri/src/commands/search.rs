use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SearchMatch {
    pub path: String,
    pub line: usize,
    pub column: usize,
    pub content: String,
    #[serde(rename = "matchStart")]
    pub match_start: usize,
    #[serde(rename = "matchEnd")]
    pub match_end: usize,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SearchResult {
    pub matches: Vec<SearchMatch>,
    #[serde(rename = "totalMatches")]
    pub total_matches: usize,
    pub truncated: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileSearchResult {
    pub path: String,
    pub name: String,
    #[serde(rename = "isDirectory")]
    pub is_directory: bool,
}

const MAX_MATCHES: usize = 1000;
const MAX_FILE_SIZE: u64 = 1024 * 1024; // 1MB max file size to search

fn should_skip_path(path: &Path) -> bool {
    let name = path.file_name().and_then(|n| n.to_str()).unwrap_or("");
    
    if name.starts_with('.') {
        return true;
    }

    let skip_dirs = [
        "node_modules", "target", "dist", "build", ".git", 
        "__pycache__", ".venv", "venv", ".next", ".nuxt",
        "vendor", "coverage", ".cache", ".parcel-cache"
    ];

    if path.is_dir() && skip_dirs.contains(&name) {
        return true;
    }

    let skip_extensions = [
        "png", "jpg", "jpeg", "gif", "ico", "svg", "webp",
        "woff", "woff2", "ttf", "eot", "otf",
        "mp3", "mp4", "wav", "avi", "mov", "webm",
        "zip", "tar", "gz", "rar", "7z",
        "pdf", "doc", "docx", "xls", "xlsx",
        "exe", "dll", "so", "dylib", "bin",
        "lock", "map"
    ];

    if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
        if skip_extensions.contains(&ext.to_lowercase().as_str()) {
            return true;
        }
    }

    false
}

fn search_in_file(
    path: &Path,
    query: &str,
    case_sensitive: bool,
    use_regex: bool,
) -> Vec<SearchMatch> {
    let mut matches = Vec::new();

    let metadata = match fs::metadata(path) {
        Ok(m) => m,
        Err(_) => return matches,
    };

    if metadata.len() > MAX_FILE_SIZE {
        return matches;
    }

    let content = match fs::read_to_string(path) {
        Ok(c) => c,
        Err(_) => return matches,
    };

    let path_str = path.to_string_lossy().to_string();

    if use_regex {
        let pattern = if case_sensitive {
            regex::Regex::new(query)
        } else {
            regex::RegexBuilder::new(query)
                .case_insensitive(true)
                .build()
        };

        if let Ok(re) = pattern {
            for (line_idx, line) in content.lines().enumerate() {
                for mat in re.find_iter(line) {
                    matches.push(SearchMatch {
                        path: path_str.clone(),
                        line: line_idx + 1,
                        column: mat.start() + 1,
                        content: line.to_string(),
                        match_start: mat.start(),
                        match_end: mat.end(),
                    });

                    if matches.len() >= MAX_MATCHES {
                        return matches;
                    }
                }
            }
        }
    } else {
        let search_query = if case_sensitive {
            query.to_string()
        } else {
            query.to_lowercase()
        };

        for (line_idx, line) in content.lines().enumerate() {
            let search_line = if case_sensitive {
                line.to_string()
            } else {
                line.to_lowercase()
            };

            let mut start = 0;
            while let Some(pos) = search_line[start..].find(&search_query) {
                let actual_pos = start + pos;
                matches.push(SearchMatch {
                    path: path_str.clone(),
                    line: line_idx + 1,
                    column: actual_pos + 1,
                    content: line.to_string(),
                    match_start: actual_pos,
                    match_end: actual_pos + query.len(),
                });

                start = actual_pos + 1;

                if matches.len() >= MAX_MATCHES {
                    return matches;
                }
            }
        }
    }

    matches
}

fn search_directory(
    dir: &Path,
    query: &str,
    case_sensitive: bool,
    use_regex: bool,
    matches: &mut Vec<SearchMatch>,
) {
    if matches.len() >= MAX_MATCHES {
        return;
    }

    let entries = match fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return,
    };

    for entry in entries.flatten() {
        let path = entry.path();

        if should_skip_path(&path) {
            continue;
        }

        if path.is_dir() {
            search_directory(&path, query, case_sensitive, use_regex, matches);
        } else if path.is_file() {
            let file_matches = search_in_file(&path, query, case_sensitive, use_regex);
            matches.extend(file_matches);

            if matches.len() >= MAX_MATCHES {
                return;
            }
        }
    }
}

#[tauri::command]
pub fn search_content(
    root_path: &str,
    query: &str,
    case_sensitive: Option<bool>,
    use_regex: Option<bool>,
) -> Result<SearchResult, String> {
    if query.is_empty() {
        return Ok(SearchResult {
            matches: vec![],
            total_matches: 0,
            truncated: false,
        });
    }

    let root = Path::new(root_path);
    if !root.exists() {
        return Err("Root path does not exist".to_string());
    }

    let case_sensitive = case_sensitive.unwrap_or(false);
    let use_regex = use_regex.unwrap_or(false);

    if use_regex {
        let test_regex = if case_sensitive {
            regex::Regex::new(query)
        } else {
            regex::RegexBuilder::new(query)
                .case_insensitive(true)
                .build()
        };
        if test_regex.is_err() {
            return Err("Invalid regex pattern".to_string());
        }
    }

    let mut matches = Vec::new();
    search_directory(root, query, case_sensitive, use_regex, &mut matches);

    let truncated = matches.len() >= MAX_MATCHES;
    let total_matches = matches.len();

    Ok(SearchResult {
        matches,
        total_matches,
        truncated,
    })
}

fn search_files_recursive(
    dir: &Path,
    query: &str,
    case_sensitive: bool,
    results: &mut Vec<FileSearchResult>,
    max_results: usize,
) {
    if results.len() >= max_results {
        return;
    }

    let entries = match fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return,
    };

    for entry in entries.flatten() {
        let path = entry.path();
        let name = path.file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("")
            .to_string();

        if should_skip_path(&path) {
            continue;
        }

        let matches = if case_sensitive {
            name.contains(query)
        } else {
            name.to_lowercase().contains(&query.to_lowercase())
        };

        if matches {
            results.push(FileSearchResult {
                path: path.to_string_lossy().to_string(),
                name,
                is_directory: path.is_dir(),
            });

            if results.len() >= max_results {
                return;
            }
        }

        if path.is_dir() {
            search_files_recursive(&path, query, case_sensitive, results, max_results);
        }
    }
}

#[tauri::command]
pub fn search_files(
    root_path: &str,
    query: &str,
    case_sensitive: Option<bool>,
) -> Result<Vec<FileSearchResult>, String> {
    if query.is_empty() {
        return Ok(vec![]);
    }

    let root = Path::new(root_path);
    if !root.exists() {
        return Err("Root path does not exist".to_string());
    }

    let case_sensitive = case_sensitive.unwrap_or(false);
    let mut results = Vec::new();
    search_files_recursive(root, query, case_sensitive, &mut results, 100);

    results.sort_by(|a, b| {
        match (a.is_directory, b.is_directory) {
            (true, false) => std::cmp::Ordering::Greater,
            (false, true) => std::cmp::Ordering::Less,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });

    Ok(results)
}
