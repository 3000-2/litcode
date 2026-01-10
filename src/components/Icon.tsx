import {
  LucideIcon,
  Files,
  GitBranch,
  Bug,
  Settings,
  Folder,
  FolderOpen,
  File,
  FileText,
  FileCode,
  FileType,
  Braces,
  Play,
  Square,
  StepForward,
  ArrowDownToLine,
  ArrowUpFromLine,
  Circle,
  RefreshCw,
  Undo2,
  Trash2,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  AlertCircle,
  Info,
  Loader2,
} from 'lucide-react';

const ICONS = {
  files: Files,
  'git-branch': GitBranch,
  bug: Bug,
  settings: Settings,
  folder: Folder,
  'folder-open': FolderOpen,
  file: File,
  'file-text': FileText,
  'file-code': FileCode,
  'file-type': FileType,
  braces: Braces,
  play: Play,
  square: Square,
  'step-forward': StepForward,
  'arrow-down': ArrowDownToLine,
  'arrow-up': ArrowUpFromLine,
  circle: Circle,
  refresh: RefreshCw,
  undo: Undo2,
  trash: Trash2,
  plus: Plus,
  x: X,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  search: Search,
  check: Check,
  alert: AlertCircle,
  info: Info,
  loader: Loader2,
} as const;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
  fill?: string;
}

export function Icon({
  name,
  size = 16,
  strokeWidth = 1.5,
  className,
  fill = 'none',
}: IconProps) {
  const LucideComponent: LucideIcon = ICONS[name];
  return (
    <LucideComponent
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      fill={fill}
    />
  );
}

export function getIconComponent(name: IconName): LucideIcon {
  return ICONS[name];
}
