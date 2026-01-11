# Litcode PRD (Product Requirements Document)

[한국어](PRD.ko.md) | **English**

## Overview

**Product**: Litcode  
**Version**: 0.1.0  
**Goal**: Minimal IDE optimized for vibe coding

## Principles

1. **Minimal First** - Core features only, no bloat
2. **Extensible** - Plugin architecture for feature expansion

## Target Users

- Developers working with AI coding assistants
- Developers who find VS Code/Cursor too heavy
- Developers who prefer simple workflows

## Core Feature Requirements

### 1. File Browser ✅ Complete
- [x] Directory tree display
- [x] Click to open files in editor
- [x] Folder expand/collapse
- [x] Direct path input
- [x] Refresh button
- [ ] File create/delete/rename (not implemented)

### 2. Editor ✅ Complete
- [x] CodeMirror 6 based
- [x] JavaScript/TypeScript syntax highlighting
- [x] Python syntax highlighting
- [x] 30+ languages: Go, Rust, Java, C++, SQL, YAML, XML, HTML, CSS, Markdown, JSON, Shell, etc.
- [x] Multi-tab support
- [x] Cmd+S save
- [x] Dirty indicator
- [ ] Autocomplete (not implemented - requires LSP)

### 3. Git Diff ✅ Complete
- [x] Changed file list (staged, unstaged, untracked separated)
- [x] Branch display
- [x] Inline diff viewer
- [x] Side-by-side diff viewer
- [x] Inline ↔ Side-by-side toggle
- [x] Revert entire file
- [x] Revert by hunk
- [x] **Revert by line**
- [x] Stage/Unstage (backend + UI)

### 4. Debugger 🔄 UI Only
- [x] Debugger panel UI
- [x] Breakpoint list
- [x] Variables panel
- [x] Call stack panel
- [x] Debug controls (Start/Stop/Step)
- [x] Language selection (Node.js/Python/Go)
- [ ] **DAP protocol integration** (not implemented)
- [ ] Actual debug sessions (not implemented)
- [ ] Editor breakpoint gutter (not implemented)

### 5. Themes & Fonts ✅ Complete
- [x] Dark theme
- [x] Light theme
- [x] Theme switching
- [x] Font selection (5 fonts)
- [x] Font size adjustment
- [x] Line height adjustment
- [x] Ligatures on/off
- [x] Custom theme path guide (~/.litcode/themes/)
- [x] Custom font path guide (~/.litcode/fonts/)
- [ ] Custom theme loading logic (not implemented)
- [ ] Custom font loading logic (not implemented)

### 6. UI Layout ✅ Complete
- [x] VS Code style layout
- [x] Sidebar collapse/expand
- [x] Tab bar
- [x] Status bar
- [x] Responsive editor area

## Tech Stack

| Component | Choice | Reason |
|-----------|--------|--------|
| Framework | Tauri 2 | ~15x lighter than Electron |
| Frontend | React 19 | Ecosystem, familiarity |
| Editor | CodeMirror 6 | Lighter than Monaco, extensible |
| Backend | Rust | Tauri default, performance |
| Git | git2-rs | Native libgit2 bindings |
| Bundler | Vite | Fast HMR |

## Architecture

### Plugin System

```
┌─────────────────────────────────────┐
│           Litcode Core              │
├─────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐
│  │  File   │ │ Editor  │ │  Git    │
│  │Explorer │ │ Plugin  │ │  Diff   │
│  └────┬────┘ └────┬────┘ └────┬────┘
│  ┌────┴────┐ ┌────┴────┐      │
│  │Debugger │ │Settings │      │
│  └────┬────┘ └────┬────┘      │
│       │           │           │
│  ─────┴───────────┴───────────┴────
│            Plugin API Layer
├─────────────────────────────────────┤
│         Event Bus / IPC Bridge
├─────────────────────────────────────┤
│          Tauri Core (Rust)
└─────────────────────────────────────┘
```

### Rust Commands

| Command | Description | Status |
|---------|-------------|--------|
| read_file | Read file | ✅ |
| write_file | Write file | ✅ |
| read_dir | Read directory | ✅ |
| file_exists | Check file exists | ✅ |
| create_dir | Create directory | ✅ |
| remove_path | Delete file/directory | ✅ |
| rename_path | Rename | ✅ |
| git_status | Git status | ✅ |
| git_diff | Git diff | ✅ |
| git_revert_file | Revert file | ✅ |
| git_revert_hunk | Revert hunk | ✅ |
| git_revert_lines | Revert lines | ✅ |
| git_stage_file | Stage file | ✅ |
| git_unstage_file | Unstage file | ✅ |

## Timeline

| Phase | Content | Estimated | Status |
|-------|---------|-----------|--------|
| 0 | Project setup + Plugin system | 2 days | ✅ Complete |
| 1 | Basic layout | 2 days | ✅ Complete |
| 2 | File browser | 2 days | ✅ Complete |
| 3 | Editor (CodeMirror) | 3 days | ✅ Complete |
| 4 | Git Diff | 5 days | ✅ Complete |
| 5 | Debugger (DAP) | 7 days | 🔄 UI only |
| 6 | Themes & Fonts | 2 days | ✅ Complete |
| 7 | Build & Deploy | 1 day | ✅ Complete |

**Total estimated**: 24 days  
**Actual**: 1 day (MVP)

## Build Output

| File | Size |
|------|------|
| Litcode.app | 9.1 MB |
| Litcode_0.1.0_aarch64.dmg | 3.5 MB |

## License

| Component | License |
|-----------|---------|
| Core | Elastic License 2.0 (ELv2) |
| Plugin SDK (`src/core/`) | MIT |

## Roadmap

### v0.2.0
- [ ] Complete DAP debugger
- [ ] Custom theme/font loading

### v0.3.0
- [ ] LSP support (autocomplete)
- [ ] Terminal plugin
- [ ] Search plugin

### v1.0.0
- [ ] Stabilization
- [ ] Documentation
- [ ] Community plugin support
