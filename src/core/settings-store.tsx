import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { Settings, EditorFontConfig, ThemeConfig, DiffViewMode } from './types';
import { eventBus, Events } from './event-bus';

import darkTheme from '../styles/themes/dark.json';
import lightTheme from '../styles/themes/light.json';

const BUILT_IN_THEMES: Record<string, ThemeConfig> = {
  dark: darkTheme as ThemeConfig,
  light: lightTheme as ThemeConfig,
};

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  editorFont: {
    family: 'JetBrains Mono',
    size: 13,
    lineHeight: 1.5,
    ligatures: true,
  },
  uiFontSize: 13,
  customFonts: [],
  diffViewMode: 'inline',
};

type LegacySettings = {
  theme: string;
  font?: EditorFontConfig;
  editorFont?: EditorFontConfig;
  uiFontSize?: number;
  customFonts?: string[];
  diffViewMode?: DiffViewMode;
};

function migrateSettings(parsed: LegacySettings): Settings {
  return {
    theme: parsed.theme || DEFAULT_SETTINGS.theme,
    editorFont: parsed.editorFont || parsed.font || DEFAULT_SETTINGS.editorFont,
    uiFontSize: parsed.uiFontSize ?? DEFAULT_SETTINGS.uiFontSize,
    customFonts: parsed.customFonts || DEFAULT_SETTINGS.customFonts,
    diffViewMode: parsed.diffViewMode || DEFAULT_SETTINGS.diffViewMode,
  };
}

function applyTheme(themeName: string) {
  const theme = BUILT_IN_THEMES[themeName];
  if (!theme) return;

  const root = document.documentElement;
  root.style.setProperty('--bg-primary', theme.colors.background);
  root.style.setProperty('--bg-secondary', theme.colors.sidebar);
  root.style.setProperty('--bg-tertiary', theme.type === 'dark' ? '#2d2d30' : '#e8e8e8');
  root.style.setProperty('--bg-hover', theme.type === 'dark' ? '#3c3c3c' : '#d4d4d4');
  root.style.setProperty('--fg-primary', theme.colors.foreground);
  root.style.setProperty('--fg-secondary', theme.type === 'dark' ? '#969696' : '#666666');
  root.style.setProperty('--border-color', theme.colors.border);
  root.style.setProperty('--accent-color', theme.colors.accent);

  eventBus.emit(Events.THEME_CHANGE, { theme: themeName });
}

function applyEditorFont(editorFont: EditorFontConfig) {
  const root = document.documentElement;
  root.style.setProperty('--editor-font-family', `'${editorFont.family}', monospace`);
  root.style.setProperty('--editor-font-size', `${editorFont.size}px`);
  root.style.setProperty('--editor-line-height', String(editorFont.lineHeight));

  eventBus.emit(Events.FONT_CHANGE, { font: editorFont });
}

function applyUIFontSize(size: number) {
  const root = document.documentElement;
  root.style.setProperty('--ui-font-size', `${size}px`);
}

function applyAllSettings(settings: Settings) {
  applyTheme(settings.theme);
  applyEditorFont(settings.editorFont);
  applyUIFontSize(settings.uiFontSize);
}

interface SettingsContextValue {
  settings: Settings;
  isLoading: boolean;
  updateSettings: (partial: Partial<Settings>) => void;
  updateEditorFont: (partial: Partial<EditorFontConfig>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const configJson = await invoke<string>('config_read');
        const parsed = JSON.parse(configJson) as LegacySettings;
        
        if (Object.keys(parsed).length === 0) {
          applyAllSettings(DEFAULT_SETTINGS);
          setSettings(DEFAULT_SETTINGS);
        } else {
          const migrated = migrateSettings(parsed);
          applyAllSettings(migrated);
          setSettings(migrated);
        }
      } catch {
        applyAllSettings(DEFAULT_SETTINGS);
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

  const persistSettings = useCallback(async (newSettings: Settings) => {
    try {
      await invoke('config_write', { config: JSON.stringify(newSettings, null, 2) });
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  }, []);

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...partial };
      applyAllSettings(newSettings);
      persistSettings(newSettings);
      return newSettings;
    });
  }, [persistSettings]);

  const updateEditorFont = useCallback((partial: Partial<EditorFontConfig>) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        editorFont: { ...prev.editorFont, ...partial },
      };
      applyAllSettings(newSettings);
      persistSettings(newSettings);
      return newSettings;
    });
  }, [persistSettings]);

  return (
    <SettingsContext.Provider value={{ settings, isLoading, updateSettings, updateEditorFont }}>
      {children}
    </SettingsContext.Provider>
  );
}

export { DEFAULT_SETTINGS, BUILT_IN_THEMES };
