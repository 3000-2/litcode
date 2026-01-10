// Core types for Litcode plugin system

export interface FileInfo {
  path: string;
  name: string;
  isDirectory: boolean;
  size?: number;
  modified?: number;
}

export interface DirEntry {
  path: string;
  name: string;
  isDirectory: boolean;
  children?: DirEntry[];
}

export interface TabInfo {
  id: string;
  path: string;
  name: string;
  isDirty: boolean;
  content?: string;
}

export interface SidebarConfig {
  id: string;
  icon: React.ReactNode;
  title: string;
  component: React.ComponentType;
  order?: number;
}

export interface PanelConfig {
  id: string;
  title: string;
  component: React.ComponentType;
  position: 'bottom' | 'right';
}

export interface StatusBarItem {
  id: string;
  content: React.ReactNode;
  position: 'left' | 'center' | 'right';
  order?: number;
}

export interface Command {
  id: string;
  title: string;
  handler: () => void;
  keybinding?: string;
}

export interface LanguageConfig {
  id: string;
  extensions: string[];
  name: string;
}

export interface ThemeConfig {
  name: string;
  type: 'dark' | 'light';
  colors: {
    background: string;
    foreground: string;
    sidebar: string;
    editor: string;
    accent: string;
    border: string;
    selection: string;
    lineNumber: string;
    lineNumberActive: string;
    diff: {
      added: string;
      removed: string;
      modified: string;
    };
  };
  syntax: {
    keyword: string;
    string: string;
    number: string;
    comment: string;
    function: string;
    variable: string;
    type: string;
  };
}

export interface FontConfig {
  family: string;
  size: number;
  lineHeight: number;
  ligatures: boolean;
}

export interface Settings {
  theme: string;
  font: FontConfig;
  customFonts: string[];
}
