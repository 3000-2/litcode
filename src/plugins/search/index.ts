import { createElement } from 'react';
import type { LitcodePlugin, PluginAPI } from '../../core';
import { Icon } from '../../components';
import { SearchPanel } from './components/SearchPanel';

export const searchPlugin: LitcodePlugin = {
  id: 'search',
  name: 'Search',
  version: '1.0.0',
  description: 'Search files and content',

  async activate(api: PluginAPI) {
    api.ui.registerSidebar({
      id: 'search',
      icon: createElement(Icon, { name: 'search', size: 20 }),
      title: 'Search',
      component: SearchPanel,
      order: 15,
    });

    api.commands.register({
      id: 'search.focus',
      title: 'Focus Search',
      handler: () => {
        api.events.emit('search:focus', {});
      },
      keybinding: 'Cmd+Shift+F',
    });
  },

  async deactivate() {},
};
