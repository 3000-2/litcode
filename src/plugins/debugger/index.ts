import { createElement } from 'react';
import { Icon } from '../../components';
import type { LitcodePlugin, PluginAPI } from '../../core';
import { DebuggerPanel } from './components/DebuggerPanel';

export const debuggerPlugin: LitcodePlugin = {
  id: 'debugger',
  name: 'Debugger',
  version: '1.0.0',
  description: 'Debug JavaScript, TypeScript, Python, and Go',

  async activate(api: PluginAPI) {
    api.ui.registerSidebar({
      id: 'debugger',
      icon: createElement(Icon, { name: 'bug', size: 20 }),
      title: 'Debug',
      component: DebuggerPanel,
      order: 2,
    });

    api.commands.register({
      id: 'debug.start',
      title: 'Start Debugging',
      handler: () => {
        api.events.emit('debug:start-request');
      },
      keybinding: 'F5',
    });

    api.commands.register({
      id: 'debug.stop',
      title: 'Stop Debugging',
      handler: () => {
        api.events.emit('debug:stop-request');
      },
      keybinding: 'Shift+F5',
    });

    api.commands.register({
      id: 'debug.stepOver',
      title: 'Step Over',
      handler: () => {
        api.events.emit('debug:step-over');
      },
      keybinding: 'F10',
    });

    api.commands.register({
      id: 'debug.stepInto',
      title: 'Step Into',
      handler: () => {
        api.events.emit('debug:step-into');
      },
      keybinding: 'F11',
    });

    api.commands.register({
      id: 'debug.stepOut',
      title: 'Step Out',
      handler: () => {
        api.events.emit('debug:step-out');
      },
      keybinding: 'Shift+F11',
    });

    api.commands.register({
      id: 'debug.continue',
      title: 'Continue',
      handler: () => {
        api.events.emit('debug:continue');
      },
      keybinding: 'F8',
    });

    api.commands.register({
      id: 'debug.toggleBreakpoint',
      title: 'Toggle Breakpoint',
      handler: () => {
        api.events.emit('debug:toggle-breakpoint');
      },
      keybinding: 'F9',
    });
  },

  async deactivate() {
  },
};
