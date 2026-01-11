import { useState, useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { IconButton } from '../../../components';
import { eventBus, Events, type DirEntry } from '../../../core';
import { FileTree, type FileTreeRef } from './FileTree';

export function FileExplorerPanel() {
  const [rootPath, setRootPath] = useState<string>('');
  const [entries, setEntries] = useState<DirEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileTreeRef = useRef<FileTreeRef>(null);

  const loadDirectory = useCallback(async (path: string) => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<DirEntry[]>('read_dir', { path });
      setEntries(result);
      setTimeout(() => eventBus.emit('root-path:change', { path }), 0);
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
        if (initialPath) {
          setRootPath(initialPath);
          loadDirectory(initialPath);
        }
      })
      .catch(() => {});
  }, [loadDirectory]);

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
      eventBus.emit(Events.FILE_OPEN, { id, path: entry.path, name: entry.name });
    }
  };

  const handleNewFile = () => {
    if (rootPath) {
      fileTreeRef.current?.triggerNewFile(rootPath);
    }
  };

  const handleNewFolder = () => {
    if (rootPath) {
      fileTreeRef.current?.triggerNewFolder(rootPath);
    }
  };

  const folderName = rootPath.split('/').pop() || rootPath;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-3 py-2 min-h-header border-b border-default">
        <span className="text-xs font-semibold uppercase tracking-wide text-fg-secondary">EXPLORER</span>
        <div className="flex gap-1">
          <IconButton
            icon="file-plus"
            size="sm"
            onClick={handleNewFile}
            title="New File"
            disabled={!rootPath}
          />
          <IconButton
            icon="folder-plus"
            size="sm"
            onClick={handleNewFolder}
            title="New Folder"
            disabled={!rootPath}
          />
          <IconButton
            icon="refresh"
            size="sm"
            onClick={() => loadDirectory(rootPath)}
            title="Refresh"
          />
        </div>
      </div>

      {rootPath && (
        <div className="px-3 py-1.5 border-b border-default">
          <span className="text-xs font-semibold text-fg-primary truncate block" title={rootPath}>
            {folderName}
          </span>
        </div>
      )}

      <div className="flex-1 overflow-auto py-1">
        {loading && <div className="py-6 px-3 text-center text-sm text-fg-secondary">Loading...</div>}
        {error && <div className="py-6 px-3 text-center text-sm text-diff-removed">{error}</div>}
        {!loading && !error && (
          <FileTree
            ref={fileTreeRef}
            entries={entries}
            onFileClick={handleFileClick}
            rootPath={rootPath}
          />
        )}
      </div>
    </div>
  );
}
