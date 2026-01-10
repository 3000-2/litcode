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

interface FileTreeProps {
  entries: DirEntry[];
  onFileClick: (entry: DirEntry) => void;
  onFolderOpen: (path: string) => void;
  level?: number;
}

export function FileTree({ entries, onFileClick, onFolderOpen, level = 0 }: FileTreeProps) {
  return (
    <div className="select-none">
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
        <FolderOpen size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-[#dcb67a]" />
      ) : (
        <Folder size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-[#dcb67a]" />
      );
    }

    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return <FileCode size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-[#3178c6]" />;
      case 'js':
      case 'jsx':
      case 'mjs':
        return <FileCode size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-[#f7df1e]" />;
      case 'py':
        return <FileCode size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-[#3776ab]" />;
      case 'go':
        return <FileCode size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-[#00add8]" />;
      case 'rs':
        return <FileCode size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-[#dea584]" />;
      case 'json':
        return <Braces size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-[#cbcb41]" />;
      case 'md':
        return <FileText size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-[#519aba]" />;
      case 'css':
      case 'scss':
      case 'less':
        return <FileType size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-[#563d7c]" />;
      case 'html':
        return <FileCode size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-[#e34c26]" />;
      default:
        return <File size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-fg-secondary" />;
    }
  };

  return (
    <div>
      <div
        className="flex items-center gap-1.5 py-1 px-2 cursor-pointer transition-colors duration-100 hover:bg-hover"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        <span className="flex items-center justify-center shrink-0 w-4 h-4">
          {getFileIcon(entry.name, entry.isDirectory)}
        </span>
        <span className="text-base flex-1 min-w-0 truncate">{entry.name}</span>
        {loading && <span className="text-2xs text-fg-secondary">...</span>}
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
