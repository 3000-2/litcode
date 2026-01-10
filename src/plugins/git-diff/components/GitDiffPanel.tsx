import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { GitBranch } from 'lucide-react';
import { IconButton, Input } from '../../../components';
import { eventBus } from '../../../core';
import { DiffViewer } from './DiffViewer';
import './GitDiffPanel.css';

interface GitFileStatus {
  path: string;
  status: string;
  staged: boolean;
}

interface GitStatus {
  branch: string;
  files: GitFileStatus[];
  ahead: number;
  behind: number;
}

export function GitDiffPanel() {
  const [repoPath, setRepoPath] = useState<string>('/Users');
  const [status, setStatus] = useState<GitStatus | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<GitStatus>('git_status', { repoPath });
      setStatus(result);
    } catch (err) {
      setError(String(err));
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [repoPath]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    const unsubRefresh = eventBus.on('git:refresh', loadStatus);
    return () => unsubRefresh();
  }, [loadStatus]);

  const handleRevertFile = async (filePath: string) => {
    try {
      await invoke('git_revert_file', { repoPath, filePath });
      loadStatus();
      if (selectedFile === filePath) {
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
      default:
        return '?';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'added':
        return 'var(--diff-added-fg)';
      case 'deleted':
        return 'var(--diff-removed-fg)';
      case 'modified':
        return 'var(--diff-modified-fg)';
      default:
        return 'var(--fg-secondary)';
    }
  };

  return (
    <div className="git-diff-panel">
      <div className="git-diff-header">
        <span className="git-diff-title">SOURCE CONTROL</span>
        <div className="git-diff-actions">
          <IconButton icon="refresh" size="sm" onClick={loadStatus} title="Refresh" />
        </div>
      </div>

      <div className="git-diff-path">
        <Input
          value={repoPath}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRepoPath(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') loadStatus();
          }}
          placeholder="Repository path..."
        />
      </div>

      {status && (
        <div className="git-diff-branch">
          <GitBranch size={14} strokeWidth={1.5} />
          <span className="branch-name">{status.branch}</span>
          {status.files.length > 0 && (
            <span className="changes-count">{status.files.length}</span>
          )}
        </div>
      )}

      <div className="git-diff-content">
        {loading && <div className="git-diff-loading">Loading...</div>}
        {error && <div className="git-diff-error">{error}</div>}
        
        {!loading && !error && status && (
          <>
            {status.files.length === 0 ? (
              <div className="git-diff-empty">No changes</div>
            ) : (
              <div className="git-diff-files">
                {status.files.map((file) => (
                  <div
                    key={file.path}
                    className={`git-diff-file ${selectedFile === file.path ? 'selected' : ''}`}
                    onClick={() => setSelectedFile(file.path)}
                  >
                    <span
                      className="file-status"
                      style={{ color: getStatusColor(file.status) }}
                    >
                      {getStatusIcon(file.status)}
                    </span>
                    <span className="file-name truncate">
                      {file.path.split('/').pop()}
                    </span>
                    <IconButton
                      icon="undo"
                      size="sm"
                      variant="ghost"
                      className="file-revert"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleRevertFile(file.path);
                      }}
                      title="Discard changes"
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {selectedFile && (
        <DiffViewer
          repoPath={repoPath}
          filePath={selectedFile}
          onClose={() => setSelectedFile(null)}
          onRevert={() => {
            loadStatus();
            setSelectedFile(null);
          }}
        />
      )}
    </div>
  );
}
