import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { GitBranch } from 'lucide-react';
import { IconButton } from '../../../components';
import { eventBus, Events } from '../../../core';
import { GitDiffTree } from './GitDiffTree';
import type { DiffTabInfo } from '../../../core/types';

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

export function GitDiffPanel() {
  const [repoPath, setRepoPath] = useState<string>('');
  const [status, setStatus] = useState<GitStatus | null>(null);
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
    } catch (err) {
      console.error('Failed to revert file:', err);
    }
  };

  const handleFileClick = async (file: GitFileStatus, isStaged: boolean) => {
    const isUntracked = file.status === 'untracked';
    const fileName = file.path.split('/').pop() || file.path;
    
    try {
      let originalContent = '';
      let modifiedContent = '';

      if (isUntracked) {
        originalContent = '';
        const fullPath = `${repoPath}/${file.path}`;
        modifiedContent = await invoke<string>('read_file', { path: fullPath });
      } else if (isStaged) {
        originalContent = await invoke<string>('git_show_file', { 
          repoPath, 
          filePath: file.path, 
          revision: 'HEAD' 
        }).catch(() => '');
        modifiedContent = await invoke<string>('git_show_staged_file', { 
          repoPath, 
          filePath: file.path 
        });
      } else {
        originalContent = await invoke<string>('git_show_file', { 
          repoPath, 
          filePath: file.path, 
          revision: 'HEAD' 
        }).catch(() => '');
        const fullPath = `${repoPath}/${file.path}`;
        modifiedContent = await invoke<string>('read_file', { path: fullPath });
      }

      const diffTabInfo: DiffTabInfo = {
        id: `diff-${file.path}-${isStaged ? 'staged' : 'unstaged'}`,
        type: 'diff',
        filePath: file.path,
        fileName,
        repoPath,
        originalContent,
        modifiedContent,
        staged: isStaged,
        isUntracked,
      };

      eventBus.emit(Events.DIFF_TAB_OPEN, diffTabInfo);
    } catch (err) {
      console.error('Failed to open diff view:', err);
      setError(`Failed to load diff: ${String(err)}`);
    }
  };

  const stagedFiles = status?.files.filter(f => f.staged) || [];
  const unstagedFiles = status?.files.filter(f => f.workingTree) || [];

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
                    <GitDiffTree
                      files={stagedFiles}
                      isStaged={true}
                      onFileClick={handleFileClick}
                      onStageFile={handleStageFile}
                      onUnstageFile={handleUnstageFile}
                      onRevertFile={handleRevertFile}
                    />
                  </div>
                )}
                
                {unstagedFiles.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-xs font-semibold text-fg-secondary uppercase tracking-wide">
                      Changes ({unstagedFiles.length})
                    </div>
                    <GitDiffTree
                      files={unstagedFiles}
                      isStaged={false}
                      onFileClick={handleFileClick}
                      onStageFile={handleStageFile}
                      onUnstageFile={handleUnstageFile}
                      onRevertFile={handleRevertFile}
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
