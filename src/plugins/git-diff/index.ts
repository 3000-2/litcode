import type { LitcodePlugin, PluginAPI } from '../../core';
import { GitDiffPanel } from './components/GitDiffPanel';

export const gitDiffPlugin: LitcodePlugin = {
  id: 'git-diff',
  name: 'Git Diff',
  version: '1.0.0',
  description: 'View and revert git changes',

  async activate(api: PluginAPI) {
    api.ui.registerSidebar({
      id: 'git-diff',
      icon: '🔀',
      title: 'Source Control',
      component: GitDiffPanel,
      order: 1,
    });

    api.commands.register({
      id: 'git.refresh',
      title: 'Refresh Git Status',
      handler: () => {
        api.events.emit('git:refresh');
      },
      keybinding: 'Cmd+Shift+G',
    });

    api.commands.register({
      id: 'git.revertAll',
      title: 'Discard All Changes',
      handler: () => {
        api.events.emit('git:revert-all');
      },
    });
  },

  async deactivate() {
  },
};
