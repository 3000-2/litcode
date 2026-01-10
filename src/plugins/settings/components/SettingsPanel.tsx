import { useState, useEffect, useCallback } from 'react';
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

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <span className="settings-title">SETTINGS</span>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h3 className="section-title">Theme</h3>
          <select
            className="settings-select"
            value={settings.theme}
            onChange={(e) => handleThemeChange(e.target.value)}
          >
            {Object.keys(BUILT_IN_THEMES).map((name) => (
              <option key={name} value={name}>
                {BUILT_IN_THEMES[name].name}
              </option>
            ))}
          </select>
        </div>

        <div className="settings-section">
          <h3 className="section-title">Font Family</h3>
          <select
            className="settings-select"
            value={settings.font.family}
            onChange={(e) => handleFontFamilyChange(e.target.value)}
          >
            {BUILT_IN_FONTS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>

        <div className="settings-section">
          <h3 className="section-title">Font Size</h3>
          <div className="settings-slider">
            <input
              type="range"
              min="10"
              max="24"
              value={settings.font.size}
              onChange={(e) => handleFontSizeChange(Number(e.target.value))}
            />
            <span className="slider-value">{settings.font.size}px</span>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="section-title">Line Height</h3>
          <div className="settings-slider">
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.1"
              value={settings.font.lineHeight}
              onChange={(e) => handleLineHeightChange(Number(e.target.value))}
            />
            <span className="slider-value">{settings.font.lineHeight}</span>
          </div>
        </div>

        <div className="settings-section">
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={settings.font.ligatures}
              onChange={(e) => handleLigaturesChange(e.target.checked)}
            />
            <span>Enable Ligatures</span>
          </label>
        </div>

        <div className="settings-section">
          <h3 className="section-title">Custom Theme</h3>
          <p className="settings-hint">
            Place custom theme files in:<br />
            <code>~/.litcode/themes/</code>
          </p>
        </div>

        <div className="settings-section">
          <h3 className="section-title">Custom Fonts</h3>
          <p className="settings-hint">
            Place custom font files in:<br />
            <code>~/.litcode/fonts/</code>
          </p>
        </div>
      </div>
    </div>
  );
}
