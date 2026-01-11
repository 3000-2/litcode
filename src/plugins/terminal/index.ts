import { createElement } from 'react';
import type { LitcodePlugin, PluginAPI } from '../../core';
import { Icon } from '../../components';
import { TerminalPanel } from './components/TerminalPanel';

export const terminalPlugin: LitcodePlugin = {
  id: 'terminal',
  name: 'Terminal',
  version: '1.0.0',
  description: 'Integrated terminal',

  async activate(api: PluginAPI) {
    api.ui.registerSidebar({
      id: 'terminal',
      icon: createElement(Icon, { name: 'terminal', size: 20 }),
      title: 'Terminal',
      component: TerminalPanel,
      order: 40,
    });

    api.commands.register({
      id: 'terminal.new',
      title: 'New Terminal',
      handler: () => {
        api.events.emit('terminal:new', {});
      },
      keybinding: 'Cmd+`',
    });

    api.commands.register({
      id: 'terminal.clear',
      title: 'Clear Terminal',
      handler: () => {
        api.events.emit('terminal:clear', {});
      },
      keybinding: 'Cmd+K',
    });
  },

  async deactivate() {},
};
