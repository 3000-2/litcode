import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { eventBus, Events, type DirEntry } from '../../../core';
import { FileTree } from './FileTree';
import './FileExplorerPanel.css';

export function FileExplorerPanel() {
  const [rootPath, setRootPath] = useState<string>('/Users');
  const [entries, setEntries] = useState<DirEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDirectory = useCallback(async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<DirEntry[]>('read_dir', { path });
      setEntries(result);
    } catch (err) {
      setError(String(err));
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDirectory(rootPath);
  }, [rootPath, loadDirectory]);

  useEffect(() => {
    const unsubRefresh = eventBus.on('file-explorer:refresh', () => {
      loadDirectory(rootPath);
    });

    return () => {
      unsubRefresh();
    };
  }, [rootPath, loadDirectory]);

  const handleFileClick = (entry: DirEntry) => {
    if (!entry.isDirectory) {
      const id = `tab-${Date.now()}`;
      eventBus.emit(Events.TAB_OPEN, {
        id,
        path: entry.path,
        name: entry.name,
      });
      eventBus.emit(Events.FILE_OPEN, { path: entry.path, name: entry.name });
    }
  };

  const handleFolderOpen = (path: string) => {
    setRootPath(path);
  };

  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <span className="file-explorer-title">EXPLORER</span>
        <div className="file-explorer-actions">
          <button
            onClick={() => eventBus.emit('file-explorer:new-file')}
            title="New File"
          >
            +
          </button>
          <button
            onClick={() => loadDirectory(rootPath)}
            title="Refresh"
          >
            ↻
          </button>
        </div>
      </div>

      <div className="file-explorer-path">
        <input
          type="text"
          value={rootPath}
          onChange={(e) => setRootPath(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              loadDirectory(rootPath);
            }
          }}
        />
      </div>

      <div className="file-explorer-content">
        {loading && <div className="file-explorer-loading">Loading...</div>}
        {error && <div className="file-explorer-error">{error}</div>}
        {!loading && !error && (
          <FileTree
            entries={entries}
            onFileClick={handleFileClick}
            onFolderOpen={handleFolderOpen}
          />
        )}
      </div>
    </div>
  );
}
