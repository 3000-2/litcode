use git2::{DiffOptions, Repository, Status, StatusOptions};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct GitStatus {
    pub branch: String,
    pub files: Vec<GitFileStatus>,
    pub ahead: u32,
    pub behind: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitFileStatus {
    pub path: String,
    pub status: String,
    pub staged: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitDiff {
    pub path: String,
    pub hunks: Vec<GitHunk>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitHunk {
    #[serde(rename = "oldStart")]
    pub old_start: u32,
    #[serde(rename = "oldLines")]
    pub old_lines: u32,
    #[serde(rename = "newStart")]
    pub new_start: u32,
    #[serde(rename = "newLines")]
    pub new_lines: u32,
    pub lines: Vec<GitDiffLine>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GitDiffLine {
    #[serde(rename = "type")]
    pub line_type: String,
    pub content: String,
    #[serde(rename = "oldLineNumber")]
    pub old_line_number: Option<u32>,
    #[serde(rename = "newLineNumber")]
    pub new_line_number: Option<u32>,
}

fn status_to_string(status: Status) -> String {
    if status.is_index_new() || status.is_wt_new() {
        "added".to_string()
    } else if status.is_index_modified() || status.is_wt_modified() {
        "modified".to_string()
    } else if status.is_index_deleted() || status.is_wt_deleted() {
        "deleted".to_string()
    } else if status.is_index_renamed() || status.is_wt_renamed() {
        "renamed".to_string()
    } else {
        "untracked".to_string()
    }
}

#[tauri::command]
pub fn git_status(repo_path: &str) -> Result<GitStatus, String> {
    let repo = Repository::open(repo_path).map_err(|e| e.to_string())?;

    let head = repo.head().ok();
    let branch = head
        .as_ref()
        .and_then(|h| h.shorthand())
        .unwrap_or("HEAD")
        .to_string();

    let mut opts = StatusOptions::new();
    opts.include_untracked(true)
        .recurse_untracked_dirs(true)
        .include_ignored(false);

    let statuses = repo.statuses(Some(&mut opts)).map_err(|e| e.to_string())?;

    let files: Vec<GitFileStatus> = statuses
        .iter()
        .filter_map(|entry| {
            let path = entry.path()?.to_string();
            let status = entry.status();
            let staged = status.is_index_new()
                || status.is_index_modified()
                || status.is_index_deleted()
                || status.is_index_renamed();

            Some(GitFileStatus {
                path,
                status: status_to_string(status),
                staged,
            })
        })
        .collect();

    Ok(GitStatus {
        branch,
        files,
        ahead: 0,
        behind: 0,
    })
}

#[tauri::command]
pub fn git_diff(repo_path: &str, file_path: &str) -> Result<GitDiff, String> {
    let repo = Repository::open(repo_path).map_err(|e| e.to_string())?;

    let mut diff_opts = DiffOptions::new();
    diff_opts.pathspec(file_path);

    let diff = repo
        .diff_index_to_workdir(None, Some(&mut diff_opts))
        .map_err(|e| e.to_string())?;

    let mut hunks: Vec<GitHunk> = Vec::new();
    let mut current_lines: Vec<GitDiffLine> = Vec::new();
    let mut current_hunk: Option<(u32, u32, u32, u32)> = None;

    diff.print(git2::DiffFormat::Patch, |_delta, hunk, line| {
        if let Some(h) = hunk {
            if let Some((old_start, old_lines, new_start, new_lines)) = current_hunk.take() {
                hunks.push(GitHunk {
                    old_start,
                    old_lines,
                    new_start,
                    new_lines,
                    lines: current_lines.clone(),
                });
                current_lines.clear();
            }
            current_hunk = Some((
                h.old_start(),
                h.old_lines(),
                h.new_start(),
                h.new_lines(),
            ));
        }

        let line_type = match line.origin() {
            '+' => "add",
            '-' => "delete",
            _ => "context",
        };

        let content = String::from_utf8_lossy(line.content()).to_string();

        current_lines.push(GitDiffLine {
            line_type: line_type.to_string(),
            content,
            old_line_number: line.old_lineno(),
            new_line_number: line.new_lineno(),
        });

        true
    })
    .map_err(|e| e.to_string())?;

    if let Some((old_start, old_lines, new_start, new_lines)) = current_hunk {
        hunks.push(GitHunk {
            old_start,
            old_lines,
            new_start,
            new_lines,
            lines: current_lines,
        });
    }

    Ok(GitDiff {
        path: file_path.to_string(),
        hunks,
    })
}

#[tauri::command]
pub fn git_revert_file(repo_path: &str, file_path: &str) -> Result<(), String> {
    let repo = Repository::open(repo_path).map_err(|e| e.to_string())?;
    let head = repo.head().map_err(|e| e.to_string())?;
    let tree = head.peel_to_tree().map_err(|e| e.to_string())?;

    let mut checkout_builder = git2::build::CheckoutBuilder::new();
    checkout_builder.path(file_path);
    checkout_builder.force();

    repo.checkout_tree(tree.as_object(), Some(&mut checkout_builder))
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn git_revert_hunk(repo_path: &str, file_path: &str, hunk_index: usize) -> Result<(), String> {
    let diff = git_diff(repo_path, file_path)?;
    
    if hunk_index >= diff.hunks.len() {
        return Err("Hunk index out of bounds".to_string());
    }

    let full_path = std::path::Path::new(repo_path).join(file_path);
    let original_content = std::fs::read_to_string(&full_path).map_err(|e| e.to_string())?;
    let lines: Vec<&str> = original_content.lines().collect();
    
    let hunk = &diff.hunks[hunk_index];
    let mut result_lines: Vec<String> = Vec::new();
    let mut current_line = 0u32;
    
    for line in &lines {
        current_line += 1;
        
        let in_hunk = current_line >= hunk.new_start && current_line < hunk.new_start + hunk.new_lines;
        
        if !in_hunk {
            result_lines.push(line.to_string());
        }
    }

    for diff_line in &hunk.lines {
        if diff_line.line_type == "delete" || diff_line.line_type == "context" {
            if let Some(old_num) = diff_line.old_line_number {
                let insert_pos = (hunk.new_start as usize - 1).min(result_lines.len());
                result_lines.insert(insert_pos + (old_num as usize - hunk.old_start as usize), diff_line.content.trim_end().to_string());
            }
        }
    }

    let result = result_lines.join("\n");
    std::fs::write(&full_path, result).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn git_revert_lines(
    repo_path: &str,
    file_path: &str,
    start_line: u32,
    end_line: u32,
) -> Result<(), String> {
    let diff = git_diff(repo_path, file_path)?;
    let full_path = std::path::Path::new(repo_path).join(file_path);
    let original_content = std::fs::read_to_string(&full_path).map_err(|e| e.to_string())?;
    let mut lines: Vec<String> = original_content.lines().map(|s| s.to_string()).collect();

    for hunk in &diff.hunks {
        for diff_line in &hunk.lines {
            if let Some(new_num) = diff_line.new_line_number {
                if new_num >= start_line && new_num <= end_line {
                    match diff_line.line_type.as_str() {
                        "add" => {
                            if (new_num as usize) <= lines.len() {
                                lines.remove((new_num - 1) as usize);
                            }
                        }
                        "delete" => {
                            if let Some(old_num) = diff_line.old_line_number {
                                let insert_pos = ((old_num - 1) as usize).min(lines.len());
                                lines.insert(insert_pos, diff_line.content.trim_end().to_string());
                            }
                        }
                        _ => {}
                    }
                }
            }
        }
    }

    let result = lines.join("\n");
    std::fs::write(&full_path, result).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn git_stage_file(repo_path: &str, file_path: &str) -> Result<(), String> {
    let repo = Repository::open(repo_path).map_err(|e| e.to_string())?;
    let mut index = repo.index().map_err(|e| e.to_string())?;
    index.add_path(std::path::Path::new(file_path)).map_err(|e| e.to_string())?;
    index.write().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn git_unstage_file(repo_path: &str, file_path: &str) -> Result<(), String> {
    let repo = Repository::open(repo_path).map_err(|e| e.to_string())?;
    let head = repo.head().map_err(|e| e.to_string())?;
    let head_commit = head.peel_to_commit().map_err(|e| e.to_string())?;
    
    repo.reset_default(Some(&head_commit.into_object()), &[std::path::Path::new(file_path)])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}
