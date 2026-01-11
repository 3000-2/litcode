# Litcode Development Progress

**English** | [한국어](../ko/PROGRESS.md)

## Completed Work ✅

### Phase 0: Project Initialization
- [x] Tauri + React + TypeScript boilerplate
- [x] Project config (package.json, Cargo.toml, tauri.conf.json)
- [x] Plugin system core implementation
  - `src/core/types.ts` - Type definitions
  - `src/core/event-bus.ts` - Event bus
  - `src/core/plugin-api.ts` - Plugin API and registry
  - `src/core/plugin-loader.ts` - Plugin loader
  - `src/core/ipc.ts` - Tauri IPC wrapper

### Phase 1: Basic Layout
- [x] VS Code style layout
- [x] Sidebar (collapse/expand)
- [x] Tab bar (multi-file)
- [x] Status bar
- [x] Global styles (global.css)

### Phase 2: File Browser Plugin
- [x] `src/plugins/file-explorer/index.ts`
- [x] `src/plugins/file-explorer/components/FileExplorerPanel.tsx`
- [x] `src/plugins/file-explorer/components/FileTree.tsx`
- [x] Rust commands: read_file, write_file, read_dir, file_exists, create_dir, remove_path, rename_path

### Phase 3: Editor Plugin
- [x] CodeMirror 6 setup
- [x] `src/plugins/editor/index.ts`
- [x] `src/plugins/editor/components/Editor.tsx`
- [x] JavaScript/TypeScript syntax highlighting
- [x] Python syntax highlighting
- [x] One Dark theme
- [x] File save (Cmd+S)
- [x] Change tracking (dirty indicator)

### Phase 4: Git Diff Plugin
- [x] `src/plugins/git-diff/index.ts`
- [x] `src/plugins/git-diff/components/GitDiffPanel.tsx`
- [x] `src/plugins/git-diff/components/DiffViewer.tsx`
- [x] Inline diff view
- [x] Side-by-side diff view
- [x] View mode toggle
- [x] Rust commands: git_status, git_diff, git_revert_file, git_revert_hunk, git_revert_lines, git_stage_file, git_unstage_file

### Phase 5: Debugger Plugin (UI Only)
- [x] `src/plugins/debugger/index.ts`
- [x] `src/plugins/debugger/components/DebuggerPanel.tsx`
- [x] `src/plugins/debugger/components/DebuggerPanel.css`
- [x] Debugger panel UI
- [x] Breakpoint management UI
- [x] Variables/call stack panel UI
- [x] Debug control buttons
- [x] **Debugger plugin connected in App.tsx**

### Phase 6: Themes & Fonts
- [x] `src/plugins/settings/index.ts`
- [x] `src/plugins/settings/components/SettingsPanel.tsx`
- [x] Dark/Light theme JSON
- [x] Theme switching
- [x] Font settings UI

### Phase 7: Build & Deploy
- [x] Production build
- [x] DMG generation
- [x] App bundle (.app)

### Phase 8: Bug Fixes & Refactoring
- [x] TabBar: stale closure bug fix (previous tabs state reference in handleTabClose)
- [x] Editor.tsx: First file open currentTabId not set bug fix
- [x] Editor.tsx: useEffect dependency array infinite re-render fix
- [x] Editor.tsx: Duplicate EditorState creation code extracted to createEditorState helper
- [x] DebuggerPanel: useEffect dependency missing fix (useCallback wrapper)
- [x] plugin-api.ts: Dynamic import changed to static import (bundle size optimization)
- [x] SettingsPanel: useEffect dependency warning fix (useCallback for applyTheme/applyFont)

### Phase 9: CLI Support
- [x] main.rs: CLI argument parsing (`litcode .`, `litcode /path`)
- [x] lib.rs: `get_initial_path` command added
- [x] lib.rs: `install_cli`, `uninstall_cli`, `is_cli_installed` commands added
- [x] SettingsPanel: "Install CLI" / "Uninstall CLI" buttons added
- [x] FileExplorerPanel: Initial path loading support

### Phase 10: Lucide Icon Migration
- [x] lucide-react installed
- [x] Sidebar icons changed to Lucide
- [x] FileTree file/folder icons changed to Lucide
- [x] GitDiffPanel icons changed to Lucide
- [x] DebuggerPanel icons changed to Lucide
- [x] TabBar, FileExplorerPanel icons changed to Lucide

### Phase 11: Common Component Library
- [x] `src/components/` folder created
- [x] Icon component (Lucide wrapper)
- [x] IconButton component (sm/md/lg, default/ghost/danger)
- [x] Button component (primary/secondary/danger/ghost, loading state)
- [x] Input component (icon support)
- [x] Select component (sm/md/lg, error, fullWidth)
- [x] SelectOption component
- [x] Radio component (single radio button)
- [x] RadioGroup component (vertical/horizontal)
- [x] Toggle component (sm/md/lg)
- [x] Slider component (valueSuffix support)
- [x] Checkbox component
- [x] Panel component (title + actions + content)
- [x] Section component (title + hint + content)
- [x] EmptyState component
- [x] Common CSS (components.css)
- [x] Existing files refactored to use common components

### Phase 12: Syntax Highlighting Expansion
- [x] 30+ languages: Go, Rust, Java, C++, SQL, YAML, XML, HTML, CSS, Markdown, JSON, Shell, etc.
- [x] Auto language detection by file extension

### Phase 13: Git Diff Improvements
- [x] Staged, Unstaged, Untracked files separated (VS Code style)
- [x] Stage/Unstage UI buttons added
- [x] Untracked file diff display (entire file as additions)
- [x] git_diff_untracked Rust command added

### Phase 14: Bug Fixes (Code Review)
- [x] git_revert_hunk / git_revert_lines file corruption bug fix
- [x] Editor fast tab switch race condition fix (loadRequestIdRef)
- [x] TabBar stale closure bug fix (functional setState)
- [x] DiffViewer hide Discard button for untracked/staged files
- [x] StatusBar layout fix (CSS grid)
- [x] git_unstage_file first commit case handling
- [x] FileTree load failure error display

### Phase 15: License & CLI
- [x] Elastic License 2.0 (ELv2) applied
- [x] Dual license: Core (ELv2), Plugin SDK (MIT)
- [x] CLI terminal detach fix (using open -a)
- [x] CLI install path changed: /usr/local/bin → ~/.local/bin (permission fix)

### Phase 16: File Operations UI
- [x] ContextMenu reusable component
- [x] Right-click context menu on files/folders
- [x] New File action (inline input + write_file)
- [x] New Folder action (inline input + create_dir)
- [x] Rename action (inline edit + rename_path)
- [x] Delete action (confirm dialog + remove_path)
- [x] New File/Folder toolbar buttons in Explorer header
- [x] Icon component extended (file-plus, folder-plus, pencil)

### Phase 17: Terminal Plugin
- [x] portable-pty Rust crate for PTY handling
- [x] Rust terminal commands (spawn, write, resize, kill)
- [x] Tauri event streaming for terminal output
- [x] xterm.js frontend with FitAddon
- [x] Multiple terminal tabs support
- [x] Terminal icon in sidebar
- [x] Keyboard shortcuts (Cmd+` for new, Cmd+K for clear)

### Phase 18: Search Plugin
- [x] Rust search commands (search_content, search_files)
- [x] Regex support with case sensitivity options
- [x] Smart file/directory filtering (skips node_modules, .git, binary files)
- [x] Search results grouped by file
- [x] Click to open file at specific line
- [x] Match highlighting in results
- [x] Debounced search (300ms)
- [x] Keyboard shortcut (Cmd+Shift+F)

---

## Remaining Work 📋

### Future Implementation

#### Debugger Completion (DAP)
- [ ] DAP client implementation (Rust)
- [ ] vscode-js-debug adapter integration (Node.js)
- [ ] debugpy adapter integration (Python)
- [ ] delve adapter integration (Go)
- [ ] Editor gutter breakpoint display
- [ ] Debug line highlight

#### Editor Improvements
- [ ] Search/Replace
- [ ] Multiple cursors
- [ ] Code folding

#### Theme & Font Completion
- [ ] Custom theme loading from ~/.litcode/themes/
- [ ] Custom font loading from ~/.litcode/fonts/
- [ ] Additional built-in themes (Dracula, Nord, Monokai)

#### Other
- [ ] LSP support

---

## File Locations

### All Created Files

```
litcode/
├── src/
│   ├── components/
│   │   ├── index.ts
│   │   ├── Icon.tsx
│   │   ├── IconButton.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Radio.tsx
│   │   ├── Toggle.tsx
│   │   ├── Slider.tsx
│   │   ├── Checkbox.tsx
│   │   ├── Panel.tsx
│   │   ├── Section.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ContextMenu.tsx
│   │   └── components.css
│   │
│   ├── core/
│   │   ├── types.ts
│   │   ├── event-bus.ts
│   │   ├── plugin-api.ts
│   │   ├── plugin-loader.ts
│   │   ├── ipc.ts
│   │   └── index.ts
│   │
│   ├── plugins/
│   │   ├── file-explorer/
│   │   │   ├── index.ts
│   │   │   └── components/
│   │   │       ├── FileExplorerPanel.tsx
│   │   │       ├── FileExplorerPanel.css
│   │   │       ├── FileTree.tsx
│   │   │       └── FileTree.css
│   │   │
│   │   ├── editor/
│   │   │   ├── index.ts
│   │   │   └── components/
│   │   │       ├── Editor.tsx
│   │   │       └── Editor.css
│   │   │
│   │   ├── git-diff/
│   │   │   ├── index.ts
│   │   │   └── components/
│   │   │       ├── GitDiffPanel.tsx
│   │   │       ├── GitDiffPanel.css
│   │   │       ├── DiffViewer.tsx
│   │   │       └── DiffViewer.css
│   │   │
│   │   ├── debugger/
│   │   │   ├── index.ts
│   │   │   └── components/
│   │   │       ├── DebuggerPanel.tsx
│   │   │       └── DebuggerPanel.css
│   │   │
│   │   └── settings/
│   │       ├── index.ts
│   │       └── components/
│   │           ├── SettingsPanel.tsx
│   │           └── SettingsPanel.css
│   │
│   ├── ui/
│   │   ├── Layout.tsx
│   │   ├── Layout.css
│   │   ├── Sidebar.tsx
│   │   ├── Sidebar.css
│   │   ├── TabBar.tsx
│   │   ├── TabBar.css
│   │   ├── StatusBar.tsx
│   │   ├── StatusBar.css
│   │   └── index.ts
│   │
│   ├── styles/
│   │   ├── global.css
│   │   └── themes/
│   │       ├── dark.json
│   │       └── light.json
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── src-tauri/
│   ├── src/
│   │   ├── main.rs
│   │   ├── lib.rs
│   │   └── commands/
│   │       ├── mod.rs
│   │       ├── fs.rs
│   │       └── git.rs
│   │
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Build Output

```
src-tauri/target/release/bundle/
├── macos/
│   └── Litcode.app (9.1 MB)
└── dmg/
    └── Litcode_0.1.0_aarch64.dmg (3.5 MB)
```

---

## How to Resume

1. **Open terminal**
   ```bash
   cd /path/to/litcode
   ```

2. **Build & Test**
   ```bash
   pnpm run tauri build
   open src-tauri/target/release/bundle/macos/Litcode.app
   ```

3. **Development mode**
   ```bash
   pnpm run tauri dev
   ```

---

## Changelog

### 2026-01-11
- Search plugin complete
  - Rust backend with regex support
  - Case-sensitive and regex search options
  - Smart filtering (skips node_modules, binary files)
  - Results grouped by file with match highlighting
  - Click to open at specific line
  - Cmd+Shift+F shortcut
- Terminal plugin complete
  - Rust backend with portable-pty for cross-platform PTY
  - xterm.js frontend with proper theming
  - Multiple terminal tabs support
  - Tauri event streaming for real-time output
  - Auto-resize with FitAddon
  - Cmd+` to open new terminal, Cmd+K to clear
- File operations UI complete
  - ContextMenu component for right-click menus
  - New File / New Folder via context menu and toolbar buttons
  - Rename files/folders with inline editing
  - Delete files/folders with confirmation dialog
  - Icon component extended with file-plus, folder-plus, pencil icons
- Dual license setup: Core (ELv2), Plugin SDK (MIT)
- CLI permission fix: Install path changed to ~/.local/bin
- CLI terminal detach fix: Using open -a for immediate terminal release

### 2026-01-10
- Code review bug fixes
  - git_revert_hunk / git_revert_lines file corruption bug fix
  - Editor fast tab switch race condition fix
  - TabBar stale closure bug fix
  - DiffViewer hide Discard button for untracked/staged files
  - StatusBar layout fix (CSS grid)
  - git_unstage_file first commit case handling
  - FileTree load failure error display
- AGENTS.md project guidelines document added
- Git diff improvement: staged, unstaged, untracked files separated
- 30+ language syntax highlighting support added

### 2026-01-09
- Debugger plugin connected in App.tsx
- Bug fixes and code quality improvements
  - TabBar stale closure bug fix
  - Editor.tsx refactoring (duplicate code removal, bug fixes)
  - DebuggerPanel useCallback applied
  - plugin-api.ts static import change
  - SettingsPanel useCallback applied
- CLI support added
  - `litcode .` or `litcode /path/to/folder` command support
  - CLI install/remove from Settings
- Lucide icon migration
  - emoji icons to Lucide React icons
  - Consistent icons across all UI components
- Common component library added
  - Reusable UI components in `src/components/`
  - Icon, IconButton, Button, Input, Select, Slider, Checkbox, Panel, Section, EmptyState
  - Existing files refactored to use common components
