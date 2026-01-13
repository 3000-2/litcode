import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Button, Select, SelectOption, Toggle, Slider, Section } from '../../../components';
import { eventBus, Events, type Settings, type ThemeConfig, type DiffViewMode } from '../../../core';

import darkTheme from '../../../styles/themes/dark.json';
import lightTheme from '../../../styles/themes/light.json';

const BUILT_IN_THEMES: Record<string, ThemeConfig> = {
  dark: darkTheme as ThemeConfig,
  light: lightTheme as ThemeConfig,
};

const BUILT_IN_FONTS = [
  'JetBrains Mono',
  'Fira Code',
  'SF Mono',
  'Menlo',
  'Monaco',
];

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
  font?: {
    family: string;
    size: number;
    lineHeight: number;
    ligatures: boolean;
  };
  editorFont?: Settings['editorFont'];
  uiFontSize?: number;
  customFonts: string[];
  diffViewMode?: DiffViewMode;
};

function migrateSettings(parsed: LegacySettings): Settings {
  const base: Settings = {
    theme: parsed.theme || DEFAULT_SETTINGS.theme,
    editorFont: parsed.editorFont || parsed.font || DEFAULT_SETTINGS.editorFont,
    uiFontSize: parsed.uiFontSize || DEFAULT_SETTINGS.uiFontSize,
    customFonts: parsed.customFonts || DEFAULT_SETTINGS.customFonts,
    diffViewMode: parsed.diffViewMode || DEFAULT_SETTINGS.diffViewMode,
  };
  return base;
}

export function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [cliInstalled, setCliInstalled] = useState(false);
  const [cliMessage, setCliMessage] = useState<string | null>(null);
  const [cliLoading, setCliLoading] = useState(false);

  const applyTheme = useCallback((themeName: string) => {
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
  }, []);

  const applyEditorFont = useCallback((editorFont: Settings['editorFont']) => {
    const root = document.documentElement;
    root.style.setProperty('--editor-font-family', `'${editorFont.family}', monospace`);
    root.style.setProperty('--editor-font-size', `${editorFont.size}px`);
    root.style.setProperty('--editor-line-height', String(editorFont.lineHeight));

    eventBus.emit(Events.FONT_CHANGE, { font: editorFont });
  }, []);

  const applyUIFontSize = useCallback((size: number) => {
    const root = document.documentElement;
    root.style.setProperty('--ui-font-size', `${size}px`);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('litcode:settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as LegacySettings;
        const migrated = migrateSettings(parsed);
        setSettings(migrated);
        applyTheme(migrated.theme);
        applyEditorFont(migrated.editorFont);
        applyUIFontSize(migrated.uiFontSize);
      } catch {
        setSettings(DEFAULT_SETTINGS);
        applyTheme(DEFAULT_SETTINGS.theme);
        applyEditorFont(DEFAULT_SETTINGS.editorFont);
        applyUIFontSize(DEFAULT_SETTINGS.uiFontSize);
      }
    } else {
      applyTheme(DEFAULT_SETTINGS.theme);
      applyEditorFont(DEFAULT_SETTINGS.editorFont);
      applyUIFontSize(DEFAULT_SETTINGS.uiFontSize);
    }

    invoke<boolean>('is_cli_installed').then(setCliInstalled);
  }, [applyTheme, applyEditorFont, applyUIFontSize]);

  const saveSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem('litcode:settings', JSON.stringify(newSettings));
    applyTheme(newSettings.theme);
    applyEditorFont(newSettings.editorFont);
    applyUIFontSize(newSettings.uiFontSize);
  }, [applyTheme, applyEditorFont, applyUIFontSize]);

  const handleThemeChange = (theme: string) => {
    saveSettings({ ...settings, theme });
  };

  const handleFontFamilyChange = (family: string) => {
    saveSettings({ ...settings, editorFont: { ...settings.editorFont, family } });
  };

  const handleEditorFontSizeChange = (size: number) => {
    saveSettings({ ...settings, editorFont: { ...settings.editorFont, size } });
  };

  const handleUIFontSizeChange = (size: number) => {
    saveSettings({ ...settings, uiFontSize: size });
  };

  const handleLineHeightChange = (lineHeight: number) => {
    saveSettings({ ...settings, editorFont: { ...settings.editorFont, lineHeight } });
  };

  const handleLigaturesChange = (ligatures: boolean) => {
    saveSettings({ ...settings, editorFont: { ...settings.editorFont, ligatures } });
  };

  const handleDiffViewModeChange = (mode: DiffViewMode) => {
    saveSettings({ ...settings, diffViewMode: mode });
    eventBus.emit('settings:diffViewMode', { mode });
  };

  const handleInstallCli = async () => {
    setCliLoading(true);
    setCliMessage(null);
    try {
      const result = await invoke<string>('install_cli');
      setCliMessage(result);
      setCliInstalled(true);
    } catch (err) {
      setCliMessage(String(err));
    } finally {
      setCliLoading(false);
    }
  };

  const handleUninstallCli = async () => {
    setCliLoading(true);
    setCliMessage(null);
    try {
      const result = await invoke<string>('uninstall_cli');
      setCliMessage(result);
      setCliInstalled(false);
    } catch (err) {
      setCliMessage(String(err));
    } finally {
      setCliLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-3 py-2 min-h-header border-b border-default">
        <span className="text-xs font-semibold uppercase tracking-wide text-fg-secondary">SETTINGS</span>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <Section title="Theme">
          <Select
            value={settings.theme}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleThemeChange(e.target.value)}
          >
            {Object.keys(BUILT_IN_THEMES).map((name) => (
              <SelectOption key={name} value={name}>
                {BUILT_IN_THEMES[name].name}
              </SelectOption>
            ))}
          </Select>
        </Section>

        <Section title="Editor Font">
          <Select
            value={settings.editorFont.family}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFontFamilyChange(e.target.value)}
          >
            {BUILT_IN_FONTS.map((font) => (
              <SelectOption key={font} value={font}>
                {font}
              </SelectOption>
            ))}
          </Select>
        </Section>

        <Section title="Editor Font Size">
          <Slider
            min={10}
            max={24}
            value={settings.editorFont.size}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleEditorFontSizeChange(Number(e.target.value))}
            valueSuffix="px"
          />
        </Section>

        <Section title="UI Font Size">
          <Slider
            min={11}
            max={16}
            value={settings.uiFontSize}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUIFontSizeChange(Number(e.target.value))}
            valueSuffix="px"
          />
        </Section>

        <Section title="Line Height">
          <Slider
            min={1}
            max={2.5}
            step={0.1}
            value={settings.editorFont.lineHeight}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLineHeightChange(Number(e.target.value))}
          />
        </Section>

        <Section>
          <Toggle
            checked={settings.editorFont.ligatures}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLigaturesChange(e.target.checked)}
          >
            Enable Ligatures
          </Toggle>
        </Section>

        <Section title="Diff View Mode">
          <Select
            value={settings.diffViewMode}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleDiffViewModeChange(e.target.value as DiffViewMode)}
          >
            <SelectOption value="inline">Inline (VS Code style)</SelectOption>
            <SelectOption value="split">Split (JetBrains style)</SelectOption>
          </Select>
        </Section>

        <Section
          title="Shell Command"
          hint={<>Usage: <code>litcode .</code> or <code>litcode /path/to/folder</code></>}
        >
          <p className="text-xs text-fg-secondary leading-relaxed mb-2">
            Install the 'litcode' command in PATH to open folders from terminal.
          </p>
          <div className="my-2">
            {cliInstalled ? (
              <Button
                variant="danger"
                onClick={handleUninstallCli}
                loading={cliLoading}
              >
                {cliLoading ? 'Uninstalling...' : 'Uninstall CLI'}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleInstallCli}
                loading={cliLoading}
              >
                {cliLoading ? 'Installing...' : 'Install CLI'}
              </Button>
            )}
          </div>
          {cliMessage && (
            <pre className="my-2 px-3 py-2 bg-tertiary rounded text-xs text-fg-secondary whitespace-pre-wrap break-all">{cliMessage}</pre>
          )}
        </Section>

        <Section
          title="Custom Theme"
          hint={<>Place custom theme files in:<br /><code>~/.litcode/themes/</code></>}
        />

        <Section
          title="Custom Fonts"
          hint={<>Place custom font files in:<br /><code>~/.litcode/fonts/</code></>}
        />
      </div>
    </div>
  );
}
