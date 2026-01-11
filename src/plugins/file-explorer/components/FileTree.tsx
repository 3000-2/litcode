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
  level?: number;
}

export function FileTree({ entries, onFileClick, level = 0 }: FileTreeProps) {
  return (
    <div className="select-none">
      {entries.map((entry) => (
        <FileTreeItem
          key={entry.path}
          entry={entry}
          onFileClick={onFileClick}
          level={level}
        />
      ))}
    </div>
  );
}

interface FileTreeItemProps {
  entry: DirEntry;
  onFileClick: (entry: DirEntry) => void;
  level: number;
}

const ICON_SIZE = 16;
const ICON_STROKE = 1.5;

const FILE_ICON_COLORS: Record<string, string> = {
  folder: '#dcb67a',
  ts: '#3178c6',
  tsx: '#3178c6',
  mts: '#3178c6',
  cts: '#3178c6',
  js: '#f7df1e',
  jsx: '#f7df1e',
  mjs: '#f7df1e',
  cjs: '#f7df1e',
  py: '#3776ab',
  go: '#00add8',
  rs: '#dea584',
  json: '#cbcb41',
  jsonc: '#cbcb41',
  md: '#519aba',
  mdx: '#519aba',
  css: '#563d7c',
  scss: '#cf649a',
  less: '#1d365d',
  html: '#e34c26',
  htm: '#e34c26',
  vue: '#41b883',
  svelte: '#ff3e00',
  c: '#555555',
  cpp: '#f34b7d',
  h: '#555555',
  hpp: '#f34b7d',
  java: '#b07219',
  sql: '#e38c00',
  yaml: '#cb171e',
  yml: '#cb171e',
  xml: '#0060ac',
  svg: '#ffb13b',
  sh: '#89e051',
  bash: '#89e051',
  zsh: '#89e051',
  toml: '#9c4221',
  ini: '#d1dbe0',
  env: '#ecd53f',
};

function FileTreeItem({ entry, onFileClick, level }: FileTreeItemProps) {
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

  const getFileIcon = (name: string, isDir: boolean) => {
    if (isDir) {
      const FolderIcon = expanded ? FolderOpen : Folder;
      return <FolderIcon size={ICON_SIZE} strokeWidth={ICON_STROKE} color={FILE_ICON_COLORS.folder} />;
    }

    const ext = name.split('.').pop()?.toLowerCase() || '';
    const color = FILE_ICON_COLORS[ext];
    
    if (['json', 'jsonc'].includes(ext)) {
      return <Braces size={ICON_SIZE} strokeWidth={ICON_STROKE} color={color} />;
    }
    if (['md', 'mdx', 'markdown'].includes(ext)) {
      return <FileText size={ICON_SIZE} strokeWidth={ICON_STROKE} color={color || FILE_ICON_COLORS.md} />;
    }
    if (['css', 'scss', 'less'].includes(ext)) {
      return <FileType size={ICON_SIZE} strokeWidth={ICON_STROKE} color={color || FILE_ICON_COLORS.css} />;
    }
    if (['ts', 'tsx', 'mts', 'cts', 'js', 'jsx', 'mjs', 'cjs', 'py', 'go', 'rs', 'html', 'htm', 'vue', 'svelte', 'c', 'cpp', 'h', 'hpp', 'java', 'sql', 'sh', 'bash', 'zsh'].includes(ext)) {
      return <FileCode size={ICON_SIZE} strokeWidth={ICON_STROKE} color={color} />;
    }
    if (['yaml', 'yml', 'xml', 'svg', 'toml', 'ini', 'env'].includes(ext)) {
      return <FileCode size={ICON_SIZE} strokeWidth={ICON_STROKE} color={color} />;
    }
    
    return <File size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-fg-secondary" />;
  };

  return (
    <div>
      <div
        className="flex items-center gap-1.5 py-1 px-2 cursor-pointer transition-colors duration-100 hover:bg-hover"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
      >
        <span className="flex items-center justify-center shrink-0 w-4 h-4">
          {getFileIcon(entry.name, entry.isDirectory)}
        </span>
        <span className="text-base flex-1 min-w-0 truncate">{entry.name}</span>
        {loading && <span className="text-2xs text-fg-secondary">...</span>}
        {error && <span className="text-2xs text-diff-removed">!</span>}
      </div>

      {expanded && children.length > 0 && (
        <FileTree
          entries={children}
          onFileClick={onFileClick}
          level={level + 1}
        />
      )}
    </div>
  );
}
