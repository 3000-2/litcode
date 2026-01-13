import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { GitBranch } from 'lucide-react';
import { IconButton } from '../../../components';
import { cn } from '../../../lib/utils';
import { eventBus, Events } from '../../../core';
import { DiffViewer } from './DiffViewer';

interface GitFileStatus {
  path: string;
  status: string;
  staged: boolean;
  workingTree: boolean;
}

interface GitStatus {
  branch: string;
  files: GitFileStatus[];
  ahead: number;
  behind: number;
}

interface SelectedFile {
  path: string;
  staged: boolean;
  isUntracked: boolean;
}

export function GitDiffPanel() {
  const [repoPath, setRepoPath] = useState<string>('');
  const [status, setStatus] = useState<GitStatus | null>(null);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async (path: string) => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<GitStatus>('git_status', { repoPath: path });
      setStatus(result);
    } catch (err) {
      setError(String(err));
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    invoke<string>('get_initial_path')
      .then((initialPath) => {
        if (initialPath) {
          setRepoPath(initialPath);
          loadStatus(initialPath);
        }
      })
      .catch(() => {});
  }, [loadStatus]);

  useEffect(() => {
    const unsubRefresh = eventBus.on('git:refresh', () => {
      if (repoPath) loadStatus(repoPath);
    });
    const unsubRootChange = eventBus.on('root-path:change', (data) => {
      const { path } = data as { path: string };
      setRepoPath(path);
      loadStatus(path);
    });
    const unsubFileSave = eventBus.on(Events.FILE_SAVE, () => {
      if (repoPath) loadStatus(repoPath);
    });
    return () => {
      unsubRefresh();
      unsubRootChange();
      unsubFileSave();
    };
  }, [loadStatus, repoPath]);

  const handleStageFile = async (filePath: string) => {
    try {
      await invoke('git_stage_file', { repoPath, filePath });
      loadStatus(repoPath);
    } catch (err) {
      console.error('Failed to stage file:', err);
    }
  };

  const handleUnstageFile = async (filePath: string) => {
    try {
      await invoke('git_unstage_file', { repoPath, filePath });
      loadStatus(repoPath);
    } catch (err) {
      console.error('Failed to unstage file:', err);
    }
  };

  const handleRevertFile = async (filePath: string) => {
    try {
      await invoke('git_revert_file', { repoPath, filePath });
      loadStatus(repoPath);
      if (selectedFile?.path === filePath) {
        setSelectedFile(null);
      }
    } catch (err) {
      console.error('Failed to revert file:', err);
    }
  };

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

  const stagedFiles = status?.files.filter(f => f.staged) || [];
  const unstagedFiles = status?.files.filter(f => f.workingTree) || [];

  const renderFileItem = (file: GitFileStatus, isStaged: boolean) => {
    const isSelected = selectedFile?.path === file.path && selectedFile?.staged === isStaged;
    const isUntracked = file.status === 'untracked';
    
    return (
      <div
        key={`${file.path}-${isStaged ? 'staged' : 'unstaged'}`}
        className={cn(
          'group flex items-center gap-2 py-1 px-3 cursor-pointer transition-colors duration-100 hover:bg-hover',
          isSelected && 'bg-active'
        )}
        onClick={() => setSelectedFile({ path: file.path, staged: isStaged, isUntracked })}
      >
        <span className={cn('font-mono-editor text-xs font-semibold w-4 text-center', getStatusColorClass(file.status))}>
          {getStatusIcon(file.status)}
        </span>
        <span className="flex-1 text-sm truncate">
          {file.path.split('/').pop()}
        </span>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
          {isStaged ? (
            <IconButton
              icon="minus"
              size="sm"
              variant="ghost"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleUnstageFile(file.path);
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
                  handleStageFile(file.path);
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
                    handleRevertFile(file.path);
                  }}
                  title="Discard changes"
                />
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-3 py-2 min-h-header border-b border-default">
        <span className="text-xs font-semibold uppercase tracking-wide text-fg-secondary">SOURCE CONTROL</span>
        <div className="flex gap-1">
          <IconButton icon="refresh" size="sm" onClick={() => loadStatus(repoPath)} title="Refresh" />
        </div>
      </div>

      {status && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-default text-sm">
          <GitBranch size={14} strokeWidth={1.5} />
          <span className="font-medium">{status.branch}</span>
          {status.files.length > 0 && (
            <span className="bg-accent text-white px-1.5 py-0.5 rounded-full text-2xs font-semibold">{status.files.length}</span>
          )}
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {loading && <div className="py-6 px-3 text-center text-sm text-fg-secondary">Loading...</div>}
        {error && <div className="py-6 px-3 text-center text-sm text-diff-removed">{error}</div>}
        
        {!loading && !error && status && (
          <>
            {status.files.length === 0 ? (
              <div className="py-6 px-3 text-center text-sm text-fg-muted">No changes</div>
            ) : (
              <div className="py-1">
                {stagedFiles.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-1.5 text-xs font-semibold text-fg-secondary uppercase tracking-wide">
                      Staged Changes ({stagedFiles.length})
                    </div>
                    {stagedFiles.map((file) => renderFileItem(file, true))}
                  </div>
                )}
                
                {unstagedFiles.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-xs font-semibold text-fg-secondary uppercase tracking-wide">
                      Changes ({unstagedFiles.length})
                    </div>
                    {unstagedFiles.map((file) => renderFileItem(file, false))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {selectedFile && (
        <DiffViewer
          repoPath={repoPath}
          filePath={selectedFile.path}
          staged={selectedFile.staged}
          isUntracked={selectedFile.isUntracked}
          onClose={() => setSelectedFile(null)}
          onRevert={() => {
            loadStatus(repoPath);
            setSelectedFile(null);
          }}
        />
      )}
    </div>
  );
}
