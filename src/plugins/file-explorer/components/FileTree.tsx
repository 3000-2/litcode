import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { createPortal } from 'react-dom';
import { ContextMenu, type ContextMenuItem } from '../../../components';
import { eventBus, type DirEntry } from '../../../core';
import { InlineInput, type InlineInputType } from './InlineInput';
import { getFileIcon } from './file-icons';

interface FileTreeProps {
  entries: DirEntry[];
  onFileClick: (entry: DirEntry) => void;
  level?: number;
  parentPath?: string;
  rootPath?: string;
}

export interface FileTreeRef {
  triggerNewFile: (path: string) => void;
  triggerNewFolder: (path: string) => void;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  entry: DirEntry | null;
}

interface InlineInputState {
  type: InlineInputType;
  parentPath: string;
  initialValue: string;
  targetEntry?: DirEntry;
}

export const FileTree = forwardRef<FileTreeRef, FileTreeProps>(function FileTree(
  { entries, onFileClick, level = 0, parentPath, rootPath },
  ref
) {
  const currentPath = parentPath ?? rootPath;
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    entry: null,
  });
  const [inlineInput, setInlineInput] = useState<InlineInputState | null>(null);

  const showInlineInput = useCallback((type: InlineInputType, targetPath: string, entry?: DirEntry) => {
    setInlineInput({
      type,
      parentPath: type === 'rename' && entry 
        ? entry.path.substring(0, entry.path.lastIndexOf('/'))
        : targetPath,
      initialValue: type === 'rename' && entry ? entry.name : '',
      targetEntry: entry,
    });
  }, []);

  useImperativeHandle(ref, () => ({
    triggerNewFile: (path: string) => showInlineInput('new-file', path),
    triggerNewFolder: (path: string) => showInlineInput('new-folder', path),
  }), [showInlineInput]);

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent, entry: DirEntry) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, entry });
  }, []);

  const handleDelete = useCallback(async (entry: DirEntry) => {
    closeContextMenu();
    const confirmMessage = entry.isDirectory
      ? `Delete folder "${entry.name}" and all its contents?`
      : `Delete file "${entry.name}"?`;

    if (window.confirm(confirmMessage)) {
      try {
        await invoke('remove_path', { path: entry.path });
        eventBus.emit('file-explorer:refresh', {});
      } catch (err) {
        alert(`Failed to delete: ${err}`);
      }
    }
  }, [closeContextMenu]);

  const handleInlineInputSubmit = useCallback(async (value: string) => {
    if (!inlineInput || !value.trim()) {
      setInlineInput(null);
      return;
    }

    const trimmedValue = value.trim();
    const newPath = `${inlineInput.parentPath}/${trimmedValue}`;

    try {
      if (inlineInput.type === 'new-file') {
        await invoke('write_file', { path: newPath, content: '' });
      } else if (inlineInput.type === 'new-folder') {
        await invoke('create_dir', { path: newPath });
      } else if (inlineInput.type === 'rename' && inlineInput.targetEntry) {
        await invoke('rename_path', {
          oldPath: inlineInput.targetEntry.path,
          newPath,
        });
      }
      eventBus.emit('file-explorer:refresh', {});
    } catch (err) {
      alert(`Operation failed: ${err}`);
    }

    setInlineInput(null);
  }, [inlineInput]);

  const handleInlineInputCancel = useCallback(() => {
    setInlineInput(null);
  }, []);

  const getContextMenuItems = useCallback((entry: DirEntry): ContextMenuItem[] => {
    const items: ContextMenuItem[] = [];

    if (entry.isDirectory) {
      items.push(
        { 
          id: 'new-file', 
          label: 'New File', 
          icon: 'file-plus', 
          onClick: () => {
            showInlineInput('new-file', entry.path);
            closeContextMenu();
          }
        },
        { 
          id: 'new-folder', 
          label: 'New Folder', 
          icon: 'folder-plus', 
          onClick: () => {
            showInlineInput('new-folder', entry.path);
            closeContextMenu();
          }
        },
        { id: 'sep1', label: '', separator: true }
      );
    }

    items.push(
      { 
        id: 'rename', 
        label: 'Rename', 
        icon: 'pencil', 
        onClick: () => {
          showInlineInput('rename', '', entry);
          closeContextMenu();
        }
      },
      { 
        id: 'delete', 
        label: 'Delete', 
        icon: 'trash', 
        danger: true, 
        onClick: () => handleDelete(entry) 
      }
    );

    return items;
  }, [showInlineInput, closeContextMenu, handleDelete]);

  const shouldShowInlineInput = inlineInput && 
    inlineInput.parentPath === currentPath && 
    inlineInput.type !== 'rename';

  return (
    <div className="select-none">
      {shouldShowInlineInput && (
        <InlineInput
          type={inlineInput.type}
          initialValue={inlineInput.initialValue}
          level={level}
          onSubmit={handleInlineInputSubmit}
          onCancel={handleInlineInputCancel}
        />
      )}
      {entries.map((entry) => (
        <FileTreeItem
          key={entry.path}
          entry={entry}
          onFileClick={onFileClick}
          level={level}
          onContextMenu={handleContextMenu}
          isRenaming={inlineInput?.targetEntry?.path === entry.path && inlineInput.type === 'rename'}
          onRenameSubmit={handleInlineInputSubmit}
          onRenameCancel={handleInlineInputCancel}
          renameValue={inlineInput?.targetEntry?.path === entry.path ? inlineInput.initialValue : ''}
          pendingInlineInput={inlineInput}
          onInlineInputSubmit={handleInlineInputSubmit}
          onInlineInputCancel={handleInlineInputCancel}
        />
      ))}
      {contextMenu.visible && contextMenu.entry && createPortal(
        <ContextMenu
          items={getContextMenuItems(contextMenu.entry)}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={closeContextMenu}
        />,
        document.body
      )}
    </div>
  );
});

interface FileTreeItemProps {
  entry: DirEntry;
  onFileClick: (entry: DirEntry) => void;
  level: number;
  onContextMenu: (e: React.MouseEvent, entry: DirEntry) => void;
  isRenaming: boolean;
  onRenameSubmit: (value: string) => void;
  onRenameCancel: () => void;
  renameValue: string;
  pendingInlineInput: InlineInputState | null;
  onInlineInputSubmit: (value: string) => void;
  onInlineInputCancel: () => void;
}

function FileTreeItem({
  entry,
  onFileClick,
  level,
  onContextMenu,
  isRenaming,
  onRenameSubmit,
  onRenameCancel,
  renameValue,
  pendingInlineInput,
  onInlineInputSubmit,
  onInlineInputCancel,
}: FileTreeItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<DirEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleClick = async () => {
    if (entry.isDirectory) {
      if (!expanded && children.length === 0) {
        setLoading(true);
        setError(false);
        try {
          const result = await invoke<DirEntry[]>('read_dir', { path: entry.path });
          setChildren(result);
        } catch (err) {
          console.error('Failed to load directory:', err);
          setError(true);
        } finally {
          setLoading(false);
        }
      }
      setExpanded(!expanded);
    } else {
      onFileClick(entry);
    }
  };

  useEffect(() => {
    const unsub = eventBus.on('file-explorer:refresh', async () => {
      if (expanded && entry.isDirectory) {
        try {
          const result = await invoke<DirEntry[]>('read_dir', { path: entry.path });
          setChildren(result);
        } catch {
          setError(true);
        }
      }
    });
    return unsub;
  }, [expanded, entry.isDirectory, entry.path]);

  if (isRenaming) {
    return (
      <InlineInput
        type="rename"
        initialValue={renameValue}
        level={level}
        onSubmit={onRenameSubmit}
        onCancel={onRenameCancel}
      />
    );
  }

  const showChildInlineInput = pendingInlineInput &&
    pendingInlineInput.parentPath === entry.path &&
    pendingInlineInput.type !== 'rename';

  return (
    <div>
      <div
        className="flex items-center gap-1.5 py-1 px-2 cursor-pointer transition-colors duration-100 hover:bg-hover"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        onContextMenu={(e) => onContextMenu(e, entry)}
      >
        <span className="flex items-center justify-center shrink-0 w-4 h-4">
          {getFileIcon(entry.name, entry.isDirectory, expanded)}
        </span>
        <span className="text-base flex-1 min-w-0 truncate">{entry.name}</span>
        {loading && <span className="text-2xs text-fg-secondary">...</span>}
        {error && <span className="text-2xs text-diff-removed">!</span>}
      </div>

      {expanded && entry.isDirectory && (
        <>
          {showChildInlineInput && (
            <InlineInput
              type={pendingInlineInput.type}
              initialValue={pendingInlineInput.initialValue}
              level={level + 1}
              onSubmit={onInlineInputSubmit}
              onCancel={onInlineInputCancel}
            />
          )}
          {children.length > 0 && (
            <FileTree
              entries={children}
              onFileClick={onFileClick}
              level={level + 1}
              parentPath={entry.path}
            />
          )}
        </>
      )}
    </div>
  );
}
