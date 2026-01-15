import { createElement } from 'react';
import { Icon } from '../../components';
import type { LitcodePlugin, PluginAPI } from '../../core';
import { Events } from '../../core/event-bus';
import { GitDiffPanel } from './components/GitDiffPanel';

export const gitDiffPlugin: LitcodePlugin = {
  id: 'git-diff',
  name: 'Git Diff',
  version: '1.0.0',
  description: 'View and revert git changes with JetBrains-style split diff',

  async activate(api: PluginAPI) {
    api.ui.registerSidebar({
      id: 'git-diff',
      icon: createElement(Icon, { name: 'git-branch', size: 20 }),
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

    api.commands.register({
      id: 'diff.nextChunk',
      title: 'Go to Next Change',
      handler: () => {
        api.events.emit(Events.DIFF_NAVIGATE_NEXT);
      },
      keybinding: 'F7',
    });

    api.commands.register({
      id: 'diff.prevChunk',
      title: 'Go to Previous Change',
      handler: () => {
        api.events.emit(Events.DIFF_NAVIGATE_PREV);
      },
      keybinding: 'Shift+F7',
    });
  },

  async deactivate() {
  },
};
