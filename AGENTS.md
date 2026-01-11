# AGENTS.md - Litcode AI Agent Guidelines

## Project Overview

**Litcode** is a minimal IDE for "vibe coding" - a lightweight, fast code editor built with modern technologies.

| Component | Technology |
|-----------|------------|
| Frontend | React 19 + TypeScript + Tailwind CSS |
| Editor | CodeMirror 6 |
| Backend | Tauri 2 (Rust) |
| Git | git2-rs |
| Platform | macOS (primary) |

**Target**: ~9MB app size (~15x lighter than Electron alternatives)

---

## Core Principles

### 1. Minimal First
- No unnecessary complexity
- Solve the problem with the least code possible
- Avoid premature abstraction - wait for patterns to emerge
- Prefer composition over inheritance
- Every line of code must justify its existence

### 2. Extensible Architecture
- Plugin system is the backbone - all features are plugins
- Core provides infrastructure, plugins provide functionality
- Easy to add new features without modifying core
- Plugins should be self-contained and independently activatable

---

## Project Structure

```
litcode/
├── src/                          # React frontend
│   ├── components/               # Shared UI components (Button, Icon, etc.)
│   ├── core/                     # Plugin system infrastructure
│   │   ├── event-bus.ts          # Pub/sub event system
│   │   ├── plugin-api.ts         # Plugin interface & registry
│   │   ├── plugin-loader.ts      # Plugin lifecycle management
│   │   └── types.ts              # Core type definitions
│   ├── lib/                      # Utilities (cn helper)
│   ├── plugins/                  # Built-in plugins (each is self-contained)
│   │   ├── file-explorer/        # File browser sidebar
│   │   ├── editor/               # CodeMirror editor
│   │   ├── git-diff/             # Git status & diff viewer
│   │   ├── debugger/             # Debug UI (placeholder)
│   │   └── settings/             # Settings panel
│   ├── ui/                       # Layout components (Sidebar, TabBar, etc.)
│   └── styles/                   # Global CSS + Tailwind config
│
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs               # Entry point
│   │   ├── lib.rs                # Tauri command registration
│   │   └── commands/             # Tauri IPC commands
│   │       ├── fs.rs             # File system operations
│   │       └── git.rs            # Git operations via git2
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── tailwind.config.js
└── package.json
```

---

## Plugin Architecture

### Plugin Interface

Every plugin must implement `LitcodePlugin`:

```typescript
interface LitcodePlugin {
  id: string;
  name: string;
  version: string;
  description?: string;
  
  activate(api: PluginAPI): Promise<void>;
  deactivate(): Promise<void>;
}
```

### Plugin API

Plugins receive a `PluginAPI` with access to:

| API | Purpose |
|-----|---------|
| `api.ui.*` | Register sidebar, panels, status bar items |
| `api.commands.*` | Register/execute commands with keybindings |
| `api.editor.*` | File open/save hooks, language registration |
| `api.fs.*` | File system operations (read, write, mkdir, etc.) |
| `api.events.*` | Pub/sub event bus |
| `api.storage.*` | Plugin-scoped localStorage |

### Creating a New Plugin

1. Create folder: `src/plugins/my-plugin/`
2. Create `index.ts` with plugin definition:

```typescript
import type { LitcodePlugin, PluginAPI } from '../../core';

export const myPlugin: LitcodePlugin = {
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',

  async activate(api: PluginAPI) {
    // Register UI, commands, event listeners
    api.ui.registerSidebar({ ... });
    api.commands.register({ ... });
  },

  async deactivate() {
    // Cleanup if needed
  },
};
```

3. Register in `App.tsx`:

```typescript
import { myPlugin } from './plugins/my-plugin';
pluginLoader.register(myPlugin);
```

---

## Event System

Communication between plugins uses the event bus:

```typescript
import { eventBus, Events } from '../core';

// Emit
eventBus.emit(Events.FILE_SAVE, { path: '/path/to/file' });

// Listen (returns unsubscribe function)
const unsub = eventBus.on(Events.FILE_SAVE, (data) => { ... });
```

### Standard Events

| Event | Payload |
|-------|---------|
| `file:open` | `{ id, path, name }` |
| `file:save` | `{ path }` |
| `tab:open/close/change` | `{ id, path, name }` |
| `tab:dirty` | `{ id, isDirty }` |
| `root-path:change` | `{ path }` |

---

## Coding Conventions

### TypeScript

- Strict mode enabled
- Prefer `interface` over `type` for object shapes
- Export types alongside implementations
- Use explicit return types for public functions

### React

- Functional components only
- Prefer `useState`/`useEffect`/`useCallback` hooks
- No class components
- Co-locate component styles (Tailwind classes in JSX)

### Tailwind CSS

- Use CSS variables for theming (defined in `global.css`)
- Tailwind config maps semantic names to CSS variables
- Use `cn()` utility from `lib/utils.ts` for conditional classes

```typescript
import { cn } from '../lib/utils';
<div className={cn('base-classes', condition && 'conditional-class')} />
```

### Component Patterns

```typescript
// Good - Props interface, clean defaults
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({ 
  variant = 'secondary', 
  size = 'md',
  children 
}: ButtonProps) {
  return <button className={cn(SIZE_CLASSES[size], VARIANT_CLASSES[variant])}>{children}</button>;
}
```

### Rust (Backend)

- Use `#[tauri::command]` for IPC functions
- Return `Result<T, String>` for error handling
- Keep commands thin - delegate to helper functions
- Use serde for JSON serialization with `#[serde(rename = "camelCase")]`

---

## File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `FileTree.tsx` |
| Utilities | camelCase | `utils.ts` |
| Types | camelCase | `types.ts` |
| Plugins | kebab-case folders | `plugins/git-diff/` |
| Rust modules | snake_case | `commands/git.rs` |

---

## Adding New Features

### Sidebar Panel

1. Create component in `plugins/my-feature/components/MyPanel.tsx`
2. In plugin `activate()`:

```typescript
api.ui.registerSidebar({
  id: 'my-feature',
  icon: createElement(Icon, { name: 'my-icon', size: 20 }),
  title: 'My Feature',
  component: MyPanel,
  order: 10, // Ordering in sidebar
});
```

### Tauri Command

1. Add function in `src-tauri/src/commands/`:

```rust
#[tauri::command]
pub fn my_command(arg: &str) -> Result<String, String> {
    Ok(format!("Hello {}", arg))
}
```

2. Export in `commands/mod.rs`
3. Register in `lib.rs` invoke_handler

4. Call from frontend:

```typescript
import { invoke } from '@tauri-apps/api/core';
const result = await invoke<string>('my_command', { arg: 'world' });
```

---

## Theming

CSS variables in `:root` (see `global.css`):

| Variable | Purpose |
|----------|---------|
| `--bg-primary/secondary/tertiary` | Background colors |
| `--fg-primary/secondary/muted` | Text colors |
| `--accent-color` | Accent/selection |
| `--border-color` | Borders |
| `--diff-added/removed/modified-*` | Git diff colors |
| `--editor-font-*` | Editor typography |

Tailwind maps these in `tailwind.config.js` to semantic names like `bg-primary`, `text-fg-secondary`.

---

## Do's and Don'ts

### Do

- Keep plugins independent and self-contained
- Use the event bus for cross-plugin communication
- Follow existing patterns in the codebase
- Add new features as plugins, not core modifications
- Use Tailwind utility classes, not custom CSS
- Test with `pnpm run build` before committing

### Don't

- Add dependencies without strong justification
- Modify core unless absolutely necessary
- Use `any` type - find the correct type
- Create god components - split into focused pieces
- Ignore TypeScript errors - fix them
- Add comments for obvious code - make code self-documenting

---

## Commands

```bash
# Development
pnpm run tauri dev

# Build check (frontend)
pnpm run build

# Rust check
cd src-tauri && cargo check

# Full production build
pnpm run tauri build
```

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Tauri over Electron | 15x smaller binary, native performance |
| Plugin architecture | Extensibility without core bloat |
| Event bus over prop drilling | Decoupled plugin communication |
| CodeMirror 6 | Modern, extensible, tree-shakeable |
| Tailwind + CSS variables | Theming flexibility with utility-first CSS |
| Rust for backend | Type safety, performance, git2 library |
