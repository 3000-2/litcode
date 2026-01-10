import { createElement } from 'react';
import { Icon } from '../../components';
import type { LitcodePlugin, PluginAPI } from '../../core';
import { FileExplorerPanel } from './components/FileExplorerPanel';

export const fileExplorerPlugin: LitcodePlugin = {
  id: 'file-explorer',
  name: 'File Explorer',
  version: '1.0.0',
  description: 'Browse and manage project files',

  async activate(api: PluginAPI) {
    api.ui.registerSidebar({
      id: 'file-explorer',
      icon: createElement(Icon, { name: 'files', size: 20 }),
      title: 'Explorer',
      component: FileExplorerPanel,
      order: 0,
    });

    api.commands.register({
      id: 'file-explorer.refresh',
      title: 'Refresh File Explorer',
      handler: () => {
        api.events.emit('file-explorer:refresh');
      },
      keybinding: 'Cmd+Shift+E',
    });

    api.commands.register({
      id: 'file-explorer.newFile',
      title: 'New File',
      handler: () => {
        api.events.emit('file-explorer:new-file');
      },
    });

    api.commands.register({
      id: 'file-explorer.newFolder',
      title: 'New Folder',
      handler: () => {
        api.events.emit('file-explorer:new-folder');
      },
    });
  },

  async deactivate() {
  },
};
