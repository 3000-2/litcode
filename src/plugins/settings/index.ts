import { createElement } from 'react';
import { Icon } from '../../components';
import type { LitcodePlugin, PluginAPI } from '../../core';
import { SettingsPanel } from './components/SettingsPanel';

export const settingsPlugin: LitcodePlugin = {
  id: 'settings',
  name: 'Settings',
  version: '1.0.0',
  description: 'Theme and font settings',

  async activate(api: PluginAPI) {
    api.ui.registerSidebar({
      id: 'settings',
      icon: createElement(Icon, { name: 'settings', size: 20 }),
      title: 'Settings',
      component: SettingsPanel,
      order: 99,
    });

    api.commands.register({
      id: 'settings.open',
      title: 'Open Settings',
      handler: () => {
        api.events.emit('sidebar:change', { id: 'settings' });
      },
      keybinding: 'Cmd+,',
    });
  },

  async deactivate() {
  },
};
