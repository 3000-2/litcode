import { invoke } from '@tauri-apps/api/core';
import { eventBus, Events } from './event-bus';
import type {
  FileInfo,
  DirEntry,
  SidebarConfig,
  PanelConfig,
  StatusBarItem,
  Command,
  LanguageConfig,
} from './types';

export interface PluginStorage {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

export interface PluginAPI {
  // UI registration
  ui: {
    registerSidebar(config: SidebarConfig): void;
    unregisterSidebar(id: string): void;
    registerPanel(config: PanelConfig): void;
    unregisterPanel(id: string): void;
    registerStatusBar(item: StatusBarItem): void;
    unregisterStatusBar(id: string): void;
  };

  // Commands & Keybindings
  commands: {
    register(command: Command): void;
    unregister(id: string): void;
    execute(id: string): void;
    getAll(): Command[];
  };

  keybindings: {
    register(key: string, commandId: string): void;
    unregister(key: string): void;
  };

  // Editor extensions
  editor: {
    onOpen(callback: (file: FileInfo) => void): () => void;
    onSave(callback: (file: FileInfo) => void): () => void;
    onClose(callback: (file: FileInfo) => void): () => void;
    registerLanguage(config: LanguageConfig): void;
    getCurrentFile(): FileInfo | null;
    openFile(path: string): Promise<void>;
    saveFile(path: string, content: string): Promise<void>;
  };

  // File system
  fs: {
    readFile(path: string): Promise<string>;
    writeFile(path: string, content: string): Promise<void>;
    readDir(path: string): Promise<DirEntry[]>;
    exists(path: string): Promise<boolean>;
    mkdir(path: string): Promise<void>;
    remove(path: string): Promise<void>;
    rename(oldPath: string, newPath: string): Promise<void>;
  };

  // Event bus
  events: {
    emit(event: string, data?: unknown): void;
    on(event: string, callback: (data: unknown) => void): () => void;
    once(event: string, callback: (data: unknown) => void): () => void;
  };

  // Plugin storage
  storage: PluginStorage;
}

// Plugin interface that all plugins must implement
export interface LitcodePlugin {
  id: string;
  name: string;
  version: string;
  description?: string;

  // Lifecycle hooks
  activate(api: PluginAPI): Promise<void>;
  deactivate(): Promise<void>;
}

// Registry to store registered items from plugins
class PluginRegistry {
  private sidebars: Map<string, SidebarConfig> = new Map();
  private panels: Map<string, PanelConfig> = new Map();
  private statusBarItems: Map<string, StatusBarItem> = new Map();
  private commands: Map<string, Command> = new Map();
  private keybindings: Map<string, string> = new Map();
  private languages: Map<string, LanguageConfig> = new Map();
  private currentFile: FileInfo | null = null;

  // Sidebar
  registerSidebar(config: SidebarConfig) {
    this.sidebars.set(config.id, config);
    eventBus.emit('registry:sidebar-change', this.getSidebars());
  }

  unregisterSidebar(id: string) {
    this.sidebars.delete(id);
    eventBus.emit('registry:sidebar-change', this.getSidebars());
  }

  getSidebars(): SidebarConfig[] {
    return Array.from(this.sidebars.values()).sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );
  }

  // Panel
  registerPanel(config: PanelConfig) {
    this.panels.set(config.id, config);
    eventBus.emit('registry:panel-change', this.getPanels());
  }

  unregisterPanel(id: string) {
    this.panels.delete(id);
    eventBus.emit('registry:panel-change', this.getPanels());
  }

  getPanels(): PanelConfig[] {
    return Array.from(this.panels.values());
  }

  // Status bar
  registerStatusBar(item: StatusBarItem) {
    this.statusBarItems.set(item.id, item);
    eventBus.emit('registry:statusbar-change', this.getStatusBarItems());
  }

  unregisterStatusBar(id: string) {
    this.statusBarItems.delete(id);
    eventBus.emit('registry:statusbar-change', this.getStatusBarItems());
  }

  getStatusBarItems(): StatusBarItem[] {
    return Array.from(this.statusBarItems.values()).sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );
  }

  // Commands
  registerCommand(command: Command) {
    this.commands.set(command.id, command);
    if (command.keybinding) {
      this.keybindings.set(command.keybinding, command.id);
    }
  }

  unregisterCommand(id: string) {
    const command = this.commands.get(id);
    if (command?.keybinding) {
      this.keybindings.delete(command.keybinding);
    }
    this.commands.delete(id);
  }

  executeCommand(id: string) {
    const command = this.commands.get(id);
    if (command) {
      command.handler();
    }
  }

  getCommands(): Command[] {
    return Array.from(this.commands.values());
  }

  // Keybindings
  registerKeybinding(key: string, commandId: string) {
    this.keybindings.set(key, commandId);
  }

  unregisterKeybinding(key: string) {
    this.keybindings.delete(key);
  }

  getCommandForKeybinding(key: string): string | undefined {
    return this.keybindings.get(key);
  }

  // Languages
  registerLanguage(config: LanguageConfig) {
    this.languages.set(config.id, config);
  }

  getLanguageForExtension(ext: string): LanguageConfig | undefined {
    for (const lang of this.languages.values()) {
      if (lang.extensions.includes(ext)) {
        return lang;
      }
    }
    return undefined;
  }

  // Current file
  setCurrentFile(file: FileInfo | null) {
    this.currentFile = file;
  }

  getCurrentFile(): FileInfo | null {
    return this.currentFile;
  }
}

// Singleton registry instance
export const pluginRegistry = new PluginRegistry();

// Create plugin API instance for a plugin
export function createPluginAPI(pluginId: string): PluginAPI {
  // Create plugin-scoped storage
  const storagePrefix = `litcode:plugin:${pluginId}:`;

  const storage: PluginStorage = {
    get<T>(key: string): T | null {
      const value = localStorage.getItem(storagePrefix + key);
      if (value === null) return null;
      try {
        return JSON.parse(value) as T;
      } catch {
        return null;
      }
    },
    set<T>(key: string, value: T): void {
      localStorage.setItem(storagePrefix + key, JSON.stringify(value));
    },
    remove(key: string): void {
      localStorage.removeItem(storagePrefix + key);
    },
    clear(): void {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(storagePrefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    },
  };

  return {
    ui: {
      registerSidebar: (config) => pluginRegistry.registerSidebar(config),
      unregisterSidebar: (id) => pluginRegistry.unregisterSidebar(id),
      registerPanel: (config) => pluginRegistry.registerPanel(config),
      unregisterPanel: (id) => pluginRegistry.unregisterPanel(id),
      registerStatusBar: (item) => pluginRegistry.registerStatusBar(item),
      unregisterStatusBar: (id) => pluginRegistry.unregisterStatusBar(id),
    },

    commands: {
      register: (command) => pluginRegistry.registerCommand(command),
      unregister: (id) => pluginRegistry.unregisterCommand(id),
      execute: (id) => pluginRegistry.executeCommand(id),
      getAll: () => pluginRegistry.getCommands(),
    },

    keybindings: {
      register: (key, commandId) =>
        pluginRegistry.registerKeybinding(key, commandId),
      unregister: (key) => pluginRegistry.unregisterKeybinding(key),
    },

    editor: {
      onOpen: (callback) => eventBus.on(Events.FILE_OPEN, callback as (data: unknown) => void),
      onSave: (callback) => eventBus.on(Events.FILE_SAVE, callback as (data: unknown) => void),
      onClose: (callback) => eventBus.on(Events.FILE_CLOSE, callback as (data: unknown) => void),
      registerLanguage: (config) => pluginRegistry.registerLanguage(config),
      getCurrentFile: () => pluginRegistry.getCurrentFile(),
      openFile: async (path) => {
        eventBus.emit(Events.FILE_OPEN, { path });
      },
      saveFile: async (path, content) => {
        eventBus.emit(Events.FILE_SAVE, { path, content });
      },
    },

    fs: {
      readFile: (path) => invoke<string>('read_file', { path }),
      writeFile: (path, content) => invoke('write_file', { path, content }),
      readDir: (path) => invoke<DirEntry[]>('read_dir', { path }),
      exists: (path) => invoke<boolean>('file_exists', { path }),
      mkdir: (path) => invoke('create_dir', { path }),
      remove: (path) => invoke('remove_path', { path }),
      rename: (oldPath, newPath) => invoke('rename_path', { oldPath, newPath }),
    },

    events: {
      emit: (event, data) => eventBus.emit(event, data),
      on: (event, callback) => eventBus.on(event, callback),
      once: (event, callback) => eventBus.once(event, callback),
    },

    storage,
  };
}
