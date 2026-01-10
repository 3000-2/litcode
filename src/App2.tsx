import { useEffect, useState } from 'react';
import { Layout } from './ui';
import { pluginLoader } from './core';
import { fileExplorerPlugin } from './plugins/file-explorer';
import { editorPlugin } from './plugins/editor';
import { gitDiffPlugin } from './plugins/git-diff';
import { settingsPlugin } from './plugins/settings';
import { debuggerPlugin } from './plugins/debugger';
import { Editor } from './plugins/editor/components/Editor';
import './styles/global.css';

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initPlugins = async () => {
      pluginLoader.register(fileExplorerPlugin);
      pluginLoader.register(editorPlugin);
      pluginLoader.register(gitDiffPlugin);
      pluginLoader.register(debuggerPlugin);
      pluginLoader.register(settingsPlugin);

      await pluginLoader.activateAll();
      setReady(true);
    };

    initPlugins();

    return () => {
      pluginLoader.deactivateAll();
    };
  }, []);

  if (!ready) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#1e1e1e',
        color: '#ccc'
      }}>
        Loading Litcode...
      </div>
    );
  }

  return (
    <>
      <Layout />
      <div style={{ position: 'absolute', top: 36, left: 298, right: 0, bottom: 24 }}>
        <Editor />
      </div>
    </>
  );
}

export default App;
