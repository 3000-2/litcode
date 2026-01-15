import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Button, Select, SelectOption, Toggle, Slider, Section } from '../../../components';
import { useSettings, BUILT_IN_THEMES, type DiffViewMode } from '../../../core';

const BUILT_IN_FONTS = [
  'JetBrains Mono',
  'Fira Code',
  'SF Mono',
  'Menlo',
  'Monaco',
];

export function SettingsPanel() {
  const { settings, updateSettings, updateEditorFont } = useSettings();
  const [cliInstalled, setCliInstalled] = useState(false);
  const [cliMessage, setCliMessage] = useState<string | null>(null);
  const [cliLoading, setCliLoading] = useState(false);

  useEffect(() => {
    invoke<boolean>('is_cli_installed').then(setCliInstalled);
  }, []);

  const handleThemeChange = (theme: string) => {
    updateSettings({ theme });
  };

  const handleFontFamilyChange = (family: string) => {
    updateEditorFont({ family });
  };

  const handleEditorFontSizeChange = (size: number) => {
    updateEditorFont({ size });
  };

  const handleUIFontSizeChange = (uiFontSize: number) => {
    updateSettings({ uiFontSize });
  };

  const handleLineHeightChange = (lineHeight: number) => {
    updateEditorFont({ lineHeight });
  };

  const handleLigaturesChange = (ligatures: boolean) => {
    updateEditorFont({ ligatures });
  };

  const handleDiffViewModeChange = (diffViewMode: DiffViewMode) => {
    updateSettings({ diffViewMode });
  };

  const handleDiffCollapseEnabledChange = (enabled: boolean) => {
    updateSettings({ 
      diffCollapse: { ...settings.diffCollapse, enabled } 
    });
  };

  const handleDiffCollapseMarginChange = (margin: number) => {
    updateSettings({ 
      diffCollapse: { ...settings.diffCollapse, margin } 
    });
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

        <Section>
          <Toggle
            checked={settings.diffCollapse.enabled}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDiffCollapseEnabledChange(e.target.checked)}
          >
            Collapse Unchanged Lines in Diff
          </Toggle>
        </Section>

        {settings.diffCollapse.enabled && (
          <Section title="Context Lines Around Changes">
            <Slider
              min={1}
              max={10}
              value={settings.diffCollapse.margin}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDiffCollapseMarginChange(Number(e.target.value))}
              valueSuffix=" lines"
            />
          </Section>
        )}

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
