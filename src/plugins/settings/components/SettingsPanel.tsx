import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Button, Select, SelectOption, Toggle, Slider, Section } from '../../../components';
import { eventBus, Events, type Settings, type ThemeConfig } from '../../../core';
import './SettingsPanel.css';

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
  font: {
    family: 'JetBrains Mono',
    size: 13,
    lineHeight: 1.5,
    ligatures: true,
  },
  customFonts: [],
};

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

  const applyFont = useCallback((font: Settings['font']) => {
    const root = document.documentElement;
    root.style.setProperty('--font-family', `'${font.family}', monospace`);
    root.style.setProperty('--font-size', `${font.size}px`);
    root.style.setProperty('--line-height', String(font.lineHeight));

    eventBus.emit(Events.FONT_CHANGE, { font });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('litcode:settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Settings;
        setSettings(parsed);
        applyTheme(parsed.theme);
        applyFont(parsed.font);
      } catch {
        setSettings(DEFAULT_SETTINGS);
        applyTheme(DEFAULT_SETTINGS.theme);
        applyFont(DEFAULT_SETTINGS.font);
      }
    } else {
      applyTheme(DEFAULT_SETTINGS.theme);
      applyFont(DEFAULT_SETTINGS.font);
    }

    invoke<boolean>('is_cli_installed').then(setCliInstalled);
  }, [applyTheme, applyFont]);

  const saveSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem('litcode:settings', JSON.stringify(newSettings));
    applyTheme(newSettings.theme);
    applyFont(newSettings.font);
  }, [applyTheme, applyFont]);

  const handleThemeChange = (theme: string) => {
    saveSettings({ ...settings, theme });
  };

  const handleFontFamilyChange = (family: string) => {
    saveSettings({ ...settings, font: { ...settings.font, family } });
  };

  const handleFontSizeChange = (size: number) => {
    saveSettings({ ...settings, font: { ...settings.font, size } });
  };

  const handleLineHeightChange = (lineHeight: number) => {
    saveSettings({ ...settings, font: { ...settings.font, lineHeight } });
  };

  const handleLigaturesChange = (ligatures: boolean) => {
    saveSettings({ ...settings, font: { ...settings.font, ligatures } });
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
    <div className="settings-panel">
      <div className="settings-header">
        <span className="settings-title">SETTINGS</span>
      </div>

      <div className="settings-content">
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

        <Section title="Font Family">
          <Select
            value={settings.font.family}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFontFamilyChange(e.target.value)}
          >
            {BUILT_IN_FONTS.map((font) => (
              <SelectOption key={font} value={font}>
                {font}
              </SelectOption>
            ))}
          </Select>
        </Section>

        <Section title="Font Size">
          <Slider
            min={10}
            max={24}
            value={settings.font.size}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFontSizeChange(Number(e.target.value))}
            valueSuffix="px"
          />
        </Section>

        <Section title="Line Height">
          <Slider
            min={1}
            max={2.5}
            step={0.1}
            value={settings.font.lineHeight}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLineHeightChange(Number(e.target.value))}
          />
        </Section>

        <Section>
          <Toggle
            checked={settings.font.ligatures}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLigaturesChange(e.target.checked)}
          >
            Enable Ligatures
          </Toggle>
        </Section>

        <Section
          title="Shell Command"
          hint={<>Usage: <code>litcode .</code> or <code>litcode /path/to/folder</code></>}
        >
          <p className="settings-hint">
            Install the 'litcode' command in PATH to open folders from terminal.
          </p>
          <div className="cli-actions">
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
            <pre className="cli-message">{cliMessage}</pre>
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
