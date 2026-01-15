import { useState, useMemo, useCallback } from 'react';
import { IconButton } from '../../../components';
import { cn } from '../../../lib/utils';
import { getFileIcon } from '../../file-explorer/components/file-icons';

interface GitFileStatus {
  path: string;
  status: string;
  staged: boolean;
  workingTree: boolean;
}

interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  status?: string;
  children: Map<string, TreeNode>;
  file?: GitFileStatus;
}

interface GitDiffTreeProps {
  files: GitFileStatus[];
  isStaged: boolean;
  onFileClick: (file: GitFileStatus, isStaged: boolean) => void;
  onStageFile: (filePath: string) => void;
  onUnstageFile: (filePath: string) => void;
  onRevertFile: (filePath: string) => void;
}

function buildTree(files: GitFileStatus[]): TreeNode {
  const root: TreeNode = {
    name: '',
    path: '',
    isDirectory: true,
    children: new Map(),
  };

  for (const file of files) {
    const parts = file.path.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join('/');

      if (!current.children.has(part)) {
        current.children.set(part, {
          name: part,
          path: currentPath,
          isDirectory: !isLast,
          status: isLast ? file.status : undefined,
          children: new Map(),
          file: isLast ? file : undefined,
        });
      }

      current = current.children.get(part)!;
    }
  }

  return root;
}

function sortTreeNodes(nodes: TreeNode[]): TreeNode[] {
  return nodes.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) {
      return a.isDirectory ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

export function GitDiffTree({
  files,
  isStaged,
  onFileClick,
  onStageFile,
  onUnstageFile,
  onRevertFile,
}: GitDiffTreeProps) {
  const tree = useMemo(() => buildTree(files), [files]);

  return (
    <div className="select-none">
      {sortTreeNodes(Array.from(tree.children.values())).map((node) => (
        <TreeNodeItem
          key={node.path}
          node={node}
          level={0}
          isStaged={isStaged}
          onFileClick={onFileClick}
          onStageFile={onStageFile}
          onUnstageFile={onUnstageFile}
          onRevertFile={onRevertFile}
        />
      ))}
    </div>
  );
}

interface TreeNodeItemProps {
  node: TreeNode;
  level: number;
  isStaged: boolean;
  onFileClick: (file: GitFileStatus, isStaged: boolean) => void;
  onStageFile: (filePath: string) => void;
  onUnstageFile: (filePath: string) => void;
  onRevertFile: (filePath: string) => void;
}

function TreeNodeItem({
  node,
  level,
  isStaged,
  onFileClick,
  onStageFile,
  onUnstageFile,
  onRevertFile,
}: TreeNodeItemProps) {
  const [expanded, setExpanded] = useState(true);

  const handleClick = useCallback(() => {
    if (node.isDirectory) {
      setExpanded(!expanded);
    } else if (node.file) {
      onFileClick(node.file, isStaged);
    }
  }, [node, expanded, isStaged, onFileClick]);

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'added':
        return 'A';
      case 'modified':
        return 'M';
      case 'deleted':
        return 'D';
      case 'renamed':
        return 'R';
      case 'untracked':
        return 'U';
      default:
        return '?';
    }
  };

  const getStatusColorClass = (status: string): string => {
    switch (status) {
      case 'added':
        return 'text-diff-added';
      case 'deleted':
        return 'text-diff-removed';
      case 'modified':
        return 'text-diff-modified';
      case 'untracked':
        return 'text-diff-added';
      default:
        return 'text-fg-secondary';
    }
  };

  const isUntracked = node.status === 'untracked';
  const children = sortTreeNodes(Array.from(node.children.values()));

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-1.5 py-1 px-2 cursor-pointer transition-colors duration-100 hover:bg-hover'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
      >
        <span className="flex items-center justify-center shrink-0 w-4 h-4">
          {getFileIcon(node.name, node.isDirectory, expanded)}
        </span>
        <span className="text-sm flex-1 min-w-0 truncate">{node.name}</span>
        
        {!node.isDirectory && node.status && (
          <>
            <span className={cn('font-mono-editor text-xs font-semibold w-4 text-center', getStatusColorClass(node.status))}>
              {getStatusIcon(node.status)}
            </span>
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
              {isStaged ? (
                <IconButton
                  icon="minus"
                  size="sm"
                  variant="ghost"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    onUnstageFile(node.path);
                  }}
                  title="Unstage"
                />
              ) : (
                <>
                  <IconButton
                    icon="plus"
                    size="sm"
                    variant="ghost"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onStageFile(node.path);
                    }}
                    title="Stage"
                  />
                  {!isUntracked && (
                    <IconButton
                      icon="undo"
                      size="sm"
                      variant="ghost"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onRevertFile(node.path);
                      }}
                      title="Discard changes"
                    />
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>

      {node.isDirectory && expanded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <TreeNodeItem
              key={child.path}
              node={child}
              level={level + 1}
              isStaged={isStaged}
              onFileClick={onFileClick}
              onStageFile={onStageFile}
              onUnstageFile={onUnstageFile}
              onRevertFile={onRevertFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}
