import type { LitcodePlugin, PluginAPI } from '../../core';

export const editorPlugin: LitcodePlugin = {
  id: 'editor',
  name: 'Editor',
  version: '1.0.0',
  description: 'Code editor powered by CodeMirror',

  async activate(api: PluginAPI) {
    api.editor.registerLanguage({
      id: 'javascript',
      extensions: ['.js', '.jsx', '.mjs'],
      name: 'JavaScript',
    });

    api.editor.registerLanguage({
      id: 'typescript',
      extensions: ['.ts', '.tsx'],
      name: 'TypeScript',
    });

    api.editor.registerLanguage({
      id: 'python',
      extensions: ['.py', '.pyw'],
      name: 'Python',
    });

    api.editor.registerLanguage({
      id: 'go',
      extensions: ['.go'],
      name: 'Go',
    });

    api.commands.register({
      id: 'editor.save',
      title: 'Save File',
      handler: () => {
        api.events.emit('editor:save');
      },
      keybinding: 'Cmd+S',
    });

    api.commands.register({
      id: 'editor.saveAll',
      title: 'Save All Files',
      handler: () => {
        api.events.emit('editor:save-all');
      },
      keybinding: 'Cmd+Shift+S',
    });

    api.ui.registerStatusBar({
      id: 'editor-position',
      content: 'Ln 1, Col 1',
      position: 'right',
      order: 100,
    });
  },

  async deactivate() {
  },
};
