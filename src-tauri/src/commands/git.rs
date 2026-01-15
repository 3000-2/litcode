use git2::{DiffOptions, Repository, StatusOptions};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct GitStatus {
    pub branch: String,
    pub files: Vec<GitFileStatus>,
    pub ahead: u32,
    pub behind: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GitFileStatus {
    pub path: String,
    pub status: String,
    pub staged: bool,
    #[serde(rename = "workingTree")]
    pub working_tree: bool,
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

    let mut files: Vec<GitFileStatus> = Vec::new();
    
    for entry in statuses.iter() {
        let path = match entry.path() {
            Some(p) => p.to_string(),
            None => continue,
        };
        let status = entry.status();
        
        let has_staged = status.is_index_new()
            || status.is_index_modified()
            || status.is_index_deleted()
            || status.is_index_renamed();
        
        let has_unstaged = status.is_wt_new()
            || status.is_wt_modified()
            || status.is_wt_deleted()
            || status.is_wt_renamed();
        
        if has_staged {
            let staged_status = if status.is_index_new() {
                "added"
            } else if status.is_index_modified() {
                "modified"
            } else if status.is_index_deleted() {
                "deleted"
            } else if status.is_index_renamed() {
                "renamed"
            } else {
                "modified"
            };
            files.push(GitFileStatus {
                path: path.clone(),
                status: staged_status.to_string(),
                staged: true,
                working_tree: false,
            });
        }
        
        if has_unstaged {
            let unstaged_status = if status.is_wt_new() {
                "untracked"
            } else if status.is_wt_modified() {
                "modified"
            } else if status.is_wt_deleted() {
                "deleted"
            } else if status.is_wt_renamed() {
                "renamed"
            } else {
                "modified"
            };
            files.push(GitFileStatus {
                path: path.clone(),
                status: unstaged_status.to_string(),
                staged: false,
                working_tree: true,
            });
        }
    }

    Ok(GitStatus {
        branch,
        files,
        ahead: 0,
        behind: 0,
    })
}

#[tauri::command]
pub fn git_diff(repo_path: &str, file_path: &str, staged: bool) -> Result<GitDiff, String> {
    let repo = Repository::open(repo_path).map_err(|e| e.to_string())?;

    let mut diff_opts = DiffOptions::new();
    diff_opts.pathspec(file_path);

    let diff = if staged {
        let head = repo.head().ok();
        let tree = head.as_ref().and_then(|h| h.peel_to_tree().ok());
        repo.diff_tree_to_index(tree.as_ref(), None, Some(&mut diff_opts))
            .map_err(|e| e.to_string())?
    } else {
        repo.diff_index_to_workdir(None, Some(&mut diff_opts))
            .map_err(|e| e.to_string())?
    };

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
    let diff = git_diff(repo_path, file_path, false)?;
    
    if hunk_index >= diff.hunks.len() {
        return Err("Hunk index out of bounds".to_string());
    }

    let full_path = std::path::Path::new(repo_path).join(file_path);
    let current_content = std::fs::read_to_string(&full_path).map_err(|e| e.to_string())?;
    let current_lines: Vec<&str> = current_content.lines().collect();
    
    let hunk = &diff.hunks[hunk_index];
    let mut result_lines: Vec<String> = Vec::new();
    
    let hunk_start = (hunk.new_start as usize).saturating_sub(1);
    let hunk_end = hunk_start + hunk.new_lines as usize;
    
    for (i, line) in current_lines.iter().enumerate() {
        if i < hunk_start || i >= hunk_end {
            result_lines.push(line.to_string());
        } else if i == hunk_start {
            for diff_line in &hunk.lines {
                if diff_line.line_type == "delete" || diff_line.line_type == "context" {
                    result_lines.push(diff_line.content.trim_end().to_string());
                }
            }
        }
    }

    let result = result_lines.join("\n");
    if current_content.ends_with('\n') && !result.is_empty() {
        std::fs::write(&full_path, format!("{}\n", result)).map_err(|e| e.to_string())?;
    } else {
        std::fs::write(&full_path, result).map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub fn git_revert_lines(
    repo_path: &str,
    file_path: &str,
    start_line: u32,
    end_line: u32,
) -> Result<(), String> {
    let diff = git_diff(repo_path, file_path, false)?;
    let full_path = std::path::Path::new(repo_path).join(file_path);
    let current_content = std::fs::read_to_string(&full_path).map_err(|e| e.to_string())?;
    let current_lines: Vec<&str> = current_content.lines().collect();
    
    let mut lines_to_remove: std::collections::HashSet<usize> = std::collections::HashSet::new();
    let mut lines_to_restore: Vec<(usize, String)> = Vec::new();
    
    for hunk in &diff.hunks {
        for diff_line in &hunk.lines {
            if let Some(new_num) = diff_line.new_line_number {
                if new_num >= start_line && new_num <= end_line && diff_line.line_type == "add" {
                    lines_to_remove.insert((new_num - 1) as usize);
                }
            }
            if let (Some(_old_num), Some(new_num)) = (diff_line.old_line_number, diff_line.new_line_number) {
                if new_num >= start_line && new_num <= end_line && diff_line.line_type == "delete" {
                    lines_to_restore.push(((new_num - 1) as usize, diff_line.content.trim_end().to_string()));
                }
            }
            if diff_line.line_type == "delete" && diff_line.new_line_number.is_none() {
                if let Some(old_num) = diff_line.old_line_number {
                    if old_num >= start_line && old_num <= end_line {
                        let insert_at = (old_num - 1) as usize;
                        lines_to_restore.push((insert_at, diff_line.content.trim_end().to_string()));
                    }
                }
            }
        }
    }
    
    let mut result_lines: Vec<String> = Vec::new();
    
    lines_to_restore.sort_by_key(|(pos, _)| *pos);
    
    let mut restore_idx = 0;
    for (i, line) in current_lines.iter().enumerate() {
        while restore_idx < lines_to_restore.len() && lines_to_restore[restore_idx].0 == i {
            result_lines.push(lines_to_restore[restore_idx].1.clone());
            restore_idx += 1;
        }
        
        if !lines_to_remove.contains(&i) {
            result_lines.push(line.to_string());
        }
    }
    
    while restore_idx < lines_to_restore.len() {
        result_lines.push(lines_to_restore[restore_idx].1.clone());
        restore_idx += 1;
    }

    let result = result_lines.join("\n");
    if current_content.ends_with('\n') && !result.is_empty() {
        std::fs::write(&full_path, format!("{}\n", result)).map_err(|e| e.to_string())?;
    } else {
        std::fs::write(&full_path, result).map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub fn git_diff_untracked(repo_path: &str, file_path: &str) -> Result<GitDiff, String> {
    let full_path = std::path::Path::new(repo_path).join(file_path);
    let content = std::fs::read_to_string(&full_path).map_err(|e| e.to_string())?;
    let file_lines: Vec<&str> = content.lines().collect();
    let line_count = file_lines.len() as u32;
    
    let lines: Vec<GitDiffLine> = file_lines
        .iter()
        .enumerate()
        .map(|(i, line)| GitDiffLine {
            line_type: "add".to_string(),
            content: line.to_string(),
            old_line_number: None,
            new_line_number: Some((i + 1) as u32),
        })
        .collect();
    
    let hunks = if lines.is_empty() {
        vec![]
    } else {
        vec![GitHunk {
            old_start: 0,
            old_lines: 0,
            new_start: 1,
            new_lines: line_count,
            lines,
        }]
    };
    
    Ok(GitDiff {
        path: file_path.to_string(),
        hunks,
    })
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
    
    match repo.head() {
        Ok(head) => {
            let head_commit = head.peel_to_commit().map_err(|e| e.to_string())?;
            repo.reset_default(Some(&head_commit.into_object()), &[std::path::Path::new(file_path)])
                .map_err(|e| e.to_string())?;
        }
        Err(_) => {
            let mut index = repo.index().map_err(|e| e.to_string())?;
            index.remove_path(std::path::Path::new(file_path)).map_err(|e| e.to_string())?;
            index.write().map_err(|e| e.to_string())?;
        }
    }
    
    Ok(())
}

#[tauri::command]
pub fn git_show_file(repo_path: &str, file_path: &str, revision: &str) -> Result<String, String> {
    let repo = Repository::open(repo_path).map_err(|e| e.to_string())?;
    
    let obj = repo.revparse_single(revision).map_err(|e| e.to_string())?;
    let commit = obj.peel_to_commit().map_err(|e| e.to_string())?;
    let tree = commit.tree().map_err(|e| e.to_string())?;
    
    let entry = tree.get_path(std::path::Path::new(file_path))
        .map_err(|_| format!("File '{}' not found in {}", file_path, revision))?;
    
    let blob = repo.find_blob(entry.id()).map_err(|e| e.to_string())?;
    
    String::from_utf8(blob.content().to_vec())
        .map_err(|_| "File contains non-UTF8 content".to_string())
}

#[tauri::command]
pub fn git_show_staged_file(repo_path: &str, file_path: &str) -> Result<String, String> {
    let repo = Repository::open(repo_path).map_err(|e| e.to_string())?;
    let index = repo.index().map_err(|e| e.to_string())?;
    
    let entry = index.get_path(std::path::Path::new(file_path), 0)
        .ok_or_else(|| format!("File '{}' not found in staging area", file_path))?;
    
    let blob = repo.find_blob(entry.id).map_err(|e| e.to_string())?;
    
    String::from_utf8(blob.content().to_vec())
        .map_err(|_| "File contains non-UTF8 content".to_string())
}
