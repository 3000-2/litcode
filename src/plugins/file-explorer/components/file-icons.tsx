import {
  Folder,
  FolderOpen,
  File,
  FileText,
  FileCode,
  FileType,
  Braces,
} from 'lucide-react';

const ICON_SIZE = 16;
const ICON_STROKE = 1.5;

export const FILE_ICON_COLORS: Record<string, string> = {
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

const JSON_EXTENSIONS = ['json', 'jsonc'];
const MARKDOWN_EXTENSIONS = ['md', 'mdx', 'markdown'];
const STYLE_EXTENSIONS = ['css', 'scss', 'less'];
const CODE_EXTENSIONS = [
  'ts', 'tsx', 'mts', 'cts', 'js', 'jsx', 'mjs', 'cjs',
  'py', 'go', 'rs', 'html', 'htm', 'vue', 'svelte',
  'c', 'cpp', 'h', 'hpp', 'java', 'sql', 'sh', 'bash', 'zsh',
];
const CONFIG_EXTENSIONS = ['yaml', 'yml', 'xml', 'svg', 'toml', 'ini', 'env'];

export function getFileIcon(name: string, isDir: boolean, isExpanded = false) {
  if (isDir) {
    const FolderIcon = isExpanded ? FolderOpen : Folder;
    return <FolderIcon size={ICON_SIZE} strokeWidth={ICON_STROKE} color={FILE_ICON_COLORS.folder} />;
  }

  const ext = name.split('.').pop()?.toLowerCase() || '';
  const color = FILE_ICON_COLORS[ext];

  if (JSON_EXTENSIONS.includes(ext)) {
    return <Braces size={ICON_SIZE} strokeWidth={ICON_STROKE} color={color} />;
  }
  if (MARKDOWN_EXTENSIONS.includes(ext)) {
    return <FileText size={ICON_SIZE} strokeWidth={ICON_STROKE} color={color || FILE_ICON_COLORS.md} />;
  }
  if (STYLE_EXTENSIONS.includes(ext)) {
    return <FileType size={ICON_SIZE} strokeWidth={ICON_STROKE} color={color || FILE_ICON_COLORS.css} />;
  }
  if (CODE_EXTENSIONS.includes(ext)) {
    return <FileCode size={ICON_SIZE} strokeWidth={ICON_STROKE} color={color} />;
  }
  if (CONFIG_EXTENSIONS.includes(ext)) {
    return <FileCode size={ICON_SIZE} strokeWidth={ICON_STROKE} color={color} />;
  }

  return <File size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-fg-secondary" />;
}
