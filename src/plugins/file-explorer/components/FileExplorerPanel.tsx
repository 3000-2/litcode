import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { IconButton, Input } from '../../../components';
import { eventBus, Events, type DirEntry } from '../../../core';
import { FileTree } from './FileTree';

export function FileExplorerPanel() {
  const [rootPath, setRootPath] = useState<string>('/Users');
  const [entries, setEntries] = useState<DirEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

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
    invoke<string>('get_initial_path')
      .then((initialPath) => {
        if (initialPath) setRootPath(initialPath);
      })
      .catch(() => {})
      .finally(() => setInitialized(true));
  }, []);

  useEffect(() => {
    if (initialized) {
      loadDirectory(rootPath);
    }
  }, [rootPath, loadDirectory, initialized]);

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
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-3 py-2 min-h-header border-b border-default">
        <span className="text-xs font-semibold uppercase tracking-wide text-fg-secondary">EXPLORER</span>
        <div className="flex gap-1">
          <IconButton
            icon="plus"
            size="sm"
            onClick={() => eventBus.emit('file-explorer:new-file')}
            title="New File"
          />
          <IconButton
            icon="refresh"
            size="sm"
            onClick={() => loadDirectory(rootPath)}
            title="Refresh"
          />
        </div>
      </div>

      <div className="px-3 py-2 border-b border-default">
        <Input
          value={rootPath}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRootPath(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              loadDirectory(rootPath);
            }
          }}
        />
      </div>

      <div className="flex-1 overflow-auto py-1">
        {loading && <div className="py-6 px-3 text-center text-sm text-fg-secondary">Loading...</div>}
        {error && <div className="py-6 px-3 text-center text-sm text-diff-removed">{error}</div>}
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
