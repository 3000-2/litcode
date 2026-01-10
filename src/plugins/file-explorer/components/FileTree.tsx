import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  Folder,
  FolderOpen,
  File,
  FileText,
  FileCode,
  FileType,
  Braces,
} from 'lucide-react';
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

const ICON_SIZE = 16;
const ICON_STROKE = 1.5;

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

  const getFileIcon = (name: string, isDir: boolean) => {
    if (isDir) {
      return expanded ? (
        <FolderOpen size={ICON_SIZE} strokeWidth={ICON_STROKE} className="icon-folder" />
      ) : (
        <Folder size={ICON_SIZE} strokeWidth={ICON_STROKE} className="icon-folder" />
      );
    }

    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return <FileCode size={ICON_SIZE} strokeWidth={ICON_STROKE} className="icon-ts" />;
      case 'js':
      case 'jsx':
      case 'mjs':
        return <FileCode size={ICON_SIZE} strokeWidth={ICON_STROKE} className="icon-js" />;
      case 'py':
        return <FileCode size={ICON_SIZE} strokeWidth={ICON_STROKE} className="icon-py" />;
      case 'go':
        return <FileCode size={ICON_SIZE} strokeWidth={ICON_STROKE} className="icon-go" />;
      case 'rs':
        return <FileCode size={ICON_SIZE} strokeWidth={ICON_STROKE} className="icon-rs" />;
      case 'json':
        return <Braces size={ICON_SIZE} strokeWidth={ICON_STROKE} className="icon-json" />;
      case 'md':
        return <FileText size={ICON_SIZE} strokeWidth={ICON_STROKE} className="icon-md" />;
      case 'css':
      case 'scss':
      case 'less':
        return <FileType size={ICON_SIZE} strokeWidth={ICON_STROKE} className="icon-css" />;
      case 'html':
        return <FileCode size={ICON_SIZE} strokeWidth={ICON_STROKE} className="icon-html" />;
      default:
        return <File size={ICON_SIZE} strokeWidth={ICON_STROKE} className="icon-file" />;
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
