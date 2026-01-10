// IPC wrapper for Tauri commands

import { invoke } from '@tauri-apps/api/core';
import type { DirEntry } from './types';

// File system commands
export const fs = {
  async readFile(path: string): Promise<string> {
    return invoke<string>('read_file', { path });
  },

  async writeFile(path: string, content: string): Promise<void> {
    await invoke('write_file', { path, content });
  },

  async readDir(path: string): Promise<DirEntry[]> {
    return invoke<DirEntry[]>('read_dir', { path });
  },

  async exists(path: string): Promise<boolean> {
    return invoke<boolean>('file_exists', { path });
  },

  async mkdir(path: string): Promise<void> {
    await invoke('create_dir', { path });
  },

  async remove(path: string): Promise<void> {
    await invoke('remove_path', { path });
  },

  async rename(oldPath: string, newPath: string): Promise<void> {
    await invoke('rename_path', { oldPath, newPath });
  },
};

// Git commands
export interface GitStatus {
  branch: string;
  files: GitFileStatus[];
  ahead: number;
  behind: number;
}

export interface GitFileStatus {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked';
  staged: boolean;
}

export interface GitDiff {
  path: string;
  hunks: GitHunk[];
}

export interface GitHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: GitDiffLine[];
}

export interface GitDiffLine {
  type: 'context' | 'add' | 'delete';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export const git = {
  async getStatus(repoPath: string): Promise<GitStatus> {
    return invoke<GitStatus>('git_status', { repoPath });
  },

  async getDiff(repoPath: string, filePath: string): Promise<GitDiff> {
    return invoke<GitDiff>('git_diff', { repoPath, filePath });
  },

  async revertFile(repoPath: string, filePath: string): Promise<void> {
    await invoke('git_revert_file', { repoPath, filePath });
  },

  async revertHunk(
    repoPath: string,
    filePath: string,
    hunkIndex: number
  ): Promise<void> {
    await invoke('git_revert_hunk', { repoPath, filePath, hunkIndex });
  },

  async revertLines(
    repoPath: string,
    filePath: string,
    startLine: number,
    endLine: number
  ): Promise<void> {
    await invoke('git_revert_lines', { repoPath, filePath, startLine, endLine });
  },

  async stageFile(repoPath: string, filePath: string): Promise<void> {
    await invoke('git_stage_file', { repoPath, filePath });
  },

  async unstageFile(repoPath: string, filePath: string): Promise<void> {
    await invoke('git_unstage_file', { repoPath, filePath });
  },
};

// Debug commands (DAP)
export interface DebugConfig {
  type: 'node' | 'python' | 'go';
  program: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
}

export interface Breakpoint {
  id: string;
  path: string;
  line: number;
  enabled: boolean;
}

export interface StackFrame {
  id: number;
  name: string;
  path: string;
  line: number;
  column: number;
}

export interface Variable {
  name: string;
  value: string;
  type: string;
  children?: Variable[];
}

export const debug = {
  async start(config: DebugConfig): Promise<void> {
    await invoke('debug_start', { config });
  },

  async stop(): Promise<void> {
    await invoke('debug_stop');
  },

  async pause(): Promise<void> {
    await invoke('debug_pause');
  },

  async continue(): Promise<void> {
    await invoke('debug_continue');
  },

  async stepOver(): Promise<void> {
    await invoke('debug_step_over');
  },

  async stepInto(): Promise<void> {
    await invoke('debug_step_into');
  },

  async stepOut(): Promise<void> {
    await invoke('debug_step_out');
  },

  async setBreakpoint(path: string, line: number): Promise<Breakpoint> {
    return invoke<Breakpoint>('debug_set_breakpoint', { path, line });
  },

  async removeBreakpoint(id: string): Promise<void> {
    await invoke('debug_remove_breakpoint', { id });
  },

  async getStackTrace(): Promise<StackFrame[]> {
    return invoke<StackFrame[]>('debug_get_stack_trace');
  },

  async getVariables(frameId: number): Promise<Variable[]> {
    return invoke<Variable[]>('debug_get_variables', { frameId });
  },
};

// Settings commands
export const settings = {
  async load(): Promise<Record<string, unknown>> {
    return invoke<Record<string, unknown>>('load_settings');
  },

  async save(settings: Record<string, unknown>): Promise<void> {
    await invoke('save_settings', { settings });
  },

  async getThemes(): Promise<string[]> {
    return invoke<string[]>('get_themes');
  },

  async loadTheme(name: string): Promise<Record<string, unknown>> {
    return invoke<Record<string, unknown>>('load_theme', { name });
  },

  async getFonts(): Promise<string[]> {
    return invoke<string[]>('get_fonts');
  },
};

// Project commands
export const project = {
  async open(path: string): Promise<void> {
    await invoke('open_project', { path });
  },

  async getRecent(): Promise<string[]> {
    return invoke<string[]>('get_recent_projects');
  },

  async getCurrent(): Promise<string | null> {
    return invoke<string | null>('get_current_project');
  },
};
