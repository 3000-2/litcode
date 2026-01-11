# Litcode

**English** | [한국어](docs/ko/README.md)

Minimal IDE for vibe coding

## Features

- **Minimal**: 9.1MB app size (~15x lighter than Electron)
- **Extensible**: Plugin architecture for easy feature additions
- **Core features only**: File browser, editor, Git Diff, debugger

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 19 + TypeScript + Tailwind CSS |
| Editor | CodeMirror 6 |
| Backend | Tauri 2 (Rust) |
| Git | git2-rs |
| Platform | macOS only |

## Installation

### Development

```bash
cd litcode
pnpm install
pnpm run tauri dev
```

### Production Build

```bash
pnpm run tauri build
```

Build outputs:
- `src-tauri/target/release/bundle/macos/Litcode.app`
- `src-tauri/target/release/bundle/dmg/Litcode_0.1.0_aarch64.dmg`

### CLI Installation

1. Move `Litcode.app` to `/Applications`
2. Open app → Settings → **Install CLI**
3. Use from terminal:

```bash
litcode .                    # Open current folder
litcode /path/to/project     # Open specific folder
```

The CLI installs to `~/.local/bin/litcode`. If not in PATH, add it:
```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
```

## Project Structure

```
litcode/
├── src/                       # React frontend
│   ├── components/            # Shared UI components
│   ├── core/                  # Plugin system core
│   ├── lib/                   # Utilities (cn, etc.)
│   ├── plugins/               # Built-in plugins
│   │   ├── file-explorer/
│   │   ├── editor/
│   │   ├── git-diff/
│   │   ├── debugger/
│   │   └── settings/
│   ├── ui/                    # Layout components
│   └── styles/                # Tailwind CSS + themes
│
├── src-tauri/                 # Rust backend
│   ├── src/
│   │   ├── main.rs
│   │   ├── lib.rs
│   │   └── commands/
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── tailwind.config.js
└── package.json
```

## Features

### File Explorer
- Tree navigation
- Open/save files
- Collapse/expand directories

### Editor (CodeMirror)
- 30+ language syntax highlighting
- Multi-tab support
- Cmd+S save

### Git Diff
- Inline / Side-by-side toggle
- Revert entire file
- Revert by hunk
- Revert by line
- Stage/Unstage files

### Settings
- Theme: Dark / Light
- Editor font: JetBrains Mono, Fira Code, SF Mono, Menlo, Monaco
- Separate editor and UI font sizes
- Line height, ligatures
- Custom themes/fonts (~/.litcode/)
- CLI installation

### Debugger (UI only)
- Breakpoint management
- Variables panel
- Call stack panel
- Debug controls (Start, Stop, Step Over/Into/Out)

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd+S | Save |
| Cmd+Shift+E | Refresh file explorer |
| Cmd+Shift+G | Refresh git status |
| Cmd+, | Open settings |
| F5 | Start debug |
| Shift+F5 | Stop debug |
| F8 | Continue |
| F9 | Toggle breakpoint |
| F10 | Step Over |
| F11 | Step Into |
| Shift+F11 | Step Out |

## Documentation

- [PRD](docs/en/PRD.md) - Product Requirements Document
- [Progress](docs/en/PROGRESS.md) - Development Progress

## License

Dual licensed:

| Component | License | Description |
|-----------|---------|-------------|
| **Core** | [ELv2](LICENSE-ELv2) | Free to use/modify. Cannot offer as hosted service. |
| **Plugin SDK** | [MIT](LICENSE-MIT) | `src/core/` - Create plugins under any license. |

See [LICENSE](LICENSE) for details.
