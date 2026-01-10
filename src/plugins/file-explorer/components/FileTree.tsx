import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { DirEntry } from '../../../core';
import './FileTree.css';

interface FileTreeProps {
  entries: DirEntry[];
  onFileClick: (entry: DirEntry) => void;
  onFolderOpen: (path: string) => void;
  level?: number;
}

export function FileTree({ entries, onFileClick, onFolderOpen, level = 0 }: FileTreeProps) {
  return (
    <div className="file-tree">
      {entries.map((entry) => (
        <FileTreeItem
          key={entry.path}
          entry={entry}
          onFileClick={onFileClick}
          onFolderOpen={onFolderOpen}
          level={level}
        />
      ))}
    </div>
  );
}

interface FileTreeItemProps {
  entry: DirEntry;
  onFileClick: (entry: DirEntry) => void;
  onFolderOpen: (path: string) => void;
  level: number;
}

function FileTreeItem({ entry, onFileClick, onFolderOpen, level }: FileTreeItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<DirEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (entry.isDirectory) {
      if (!expanded && children.length === 0) {
        setLoading(true);
        try {
          const result = await invoke<DirEntry[]>('read_dir', { path: entry.path });
          setChildren(result);
        } catch (err) {
          console.error('Failed to load directory:', err);
        } finally {
          setLoading(false);
        }
      }
      setExpanded(!expanded);
    } else {
      onFileClick(entry);
    }
  };

  const handleDoubleClick = () => {
    if (entry.isDirectory) {
      onFolderOpen(entry.path);
    }
  };

  const getFileIcon = (name: string, isDir: boolean): string => {
    if (isDir) return expanded ? '📂' : '📁';
    
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return '🔷';
      case 'js':
      case 'jsx':
        return '🟨';
      case 'py':
        return '🐍';
      case 'go':
        return '🔵';
      case 'rs':
        return '🦀';
      case 'json':
        return '📋';
      case 'md':
        return '📝';
      case 'css':
        return '🎨';
      case 'html':
        return '🌐';
      default:
        return '📄';
    }
  };

  return (
    <div className="file-tree-item">
      <div
        className="file-tree-row"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        <span className="file-tree-icon">
          {getFileIcon(entry.name, entry.isDirectory)}
        </span>
        <span className="file-tree-name truncate">{entry.name}</span>
        {loading && <span className="file-tree-loading">...</span>}
      </div>

      {expanded && children.length > 0 && (
        <FileTree
          entries={children}
          onFileClick={onFileClick}
          onFolderOpen={onFolderOpen}
          level={level + 1}
        />
      )}
    </div>
  );
}
