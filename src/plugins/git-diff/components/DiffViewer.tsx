import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { IconButton, Button } from '../../../components';
import { cn } from '../../../lib/utils';

interface GitDiffLine {
  type: string;
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

interface GitHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: GitDiffLine[];
}

interface GitDiff {
  path: string;
  hunks: GitHunk[];
}

type ViewMode = 'inline' | 'split';

interface DiffViewerProps {
  repoPath: string;
  filePath: string;
  staged: boolean;
  isUntracked: boolean;
  defaultViewMode?: ViewMode;
  onClose: () => void;
  onRevert: () => void;
}

export function DiffViewer({ repoPath, filePath, staged, isUntracked, defaultViewMode = 'inline', onClose, onRevert }: DiffViewerProps) {
  const canRevert = !isUntracked && !staged;
  const [diff, setDiff] = useState<GitDiff | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDiff = async () => {
      setLoading(true);
      setError(null);
      try {
        let result: GitDiff;
        if (isUntracked) {
          result = await invoke<GitDiff>('git_diff_untracked', { repoPath, filePath });
        } else {
          result = await invoke<GitDiff>('git_diff', { repoPath, filePath, staged });
        }
        setDiff(result);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    loadDiff();
  }, [repoPath, filePath, staged, isUntracked]);

  const handleRevertHunk = async (hunkIndex: number) => {
    try {
      await invoke('git_revert_hunk', { repoPath, filePath, hunkIndex });
      onRevert();
    } catch (err) {
      console.error('Failed to revert hunk:', err);
    }
  };

  const handleRevertLine = async (lineNumber: number) => {
    try {
      await invoke('git_revert_lines', {
        repoPath,
        filePath,
        startLine: lineNumber,
        endLine: lineNumber,
      });
      onRevert();
    } catch (err) {
      console.error('Failed to revert line:', err);
    }
  };

  const handleRevertFile = async () => {
    try {
      await invoke('git_revert_file', { repoPath, filePath });
      onRevert();
    } catch (err) {
      console.error('Failed to revert file:', err);
    }
  };

  const fileName = filePath.split('/').pop() || filePath;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
      <div className="w-[90%] max-w-[1200px] h-[80%] bg-primary rounded-lg border border-default flex flex-col overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-default bg-secondary">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-sm">{fileName}</span>
            <span className="text-xs text-fg-secondary">{filePath}</span>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              variant={viewMode === 'inline' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('inline')}
            >
              Inline
            </Button>
            <Button
              variant={viewMode === 'split' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('split')}
            >
              Split
            </Button>
            {canRevert && (
              <Button
                variant="danger"
                size="sm"
                icon="trash"
                onClick={handleRevertFile}
                title="Discard all changes"
              >
                Discard All
              </Button>
            )}
            <IconButton icon="x" size="lg" onClick={onClose} title="Close" />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {loading && <div className="text-center py-8 text-fg-secondary">Loading diff...</div>}
          {error && <div className="text-center py-8 text-diff-removed">{error}</div>}

          {!loading && !error && diff && (
            viewMode === 'inline' ? (
              <InlineDiff
                diff={diff}
                onRevertHunk={canRevert ? handleRevertHunk : undefined}
                onRevertLine={canRevert ? handleRevertLine : undefined}
              />
            ) : (
              <SplitDiff
                diff={diff}
                onRevertHunk={canRevert ? handleRevertHunk : undefined}
                onRevertLine={canRevert ? handleRevertLine : undefined}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

interface DiffProps {
  diff: GitDiff;
  onRevertHunk?: (index: number) => void;
  onRevertLine?: (lineNumber: number) => void;
}

function InlineDiff({ diff, onRevertHunk, onRevertLine }: DiffProps) {
  return (
    <div>
      {diff.hunks.map((hunk, hunkIndex) => (
        <div key={hunkIndex} className="mb-6 border border-default rounded overflow-hidden">
          <div className="flex justify-between items-center px-3 py-2 bg-tertiary border-b border-default">
            <span className="font-mono-editor text-sm text-fg-secondary">
              @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
            </span>
            {onRevertHunk && (
              <Button
                variant="ghost"
                size="sm"
                icon="undo"
                onClick={() => onRevertHunk(hunkIndex)}
                title="Revert this block"
                className="hover:bg-diff-removed hover:text-diff-removed"
              >
                Revert Block
              </Button>
            )}
          </div>
          <div className="font-mono-editor text-base leading-relaxed">
            {hunk.lines.map((line, lineIndex) => {
              const lineNum = line.newLineNumber || line.oldLineNumber;
              return (
                <div
                  key={lineIndex}
                  className={cn(
                    'group flex items-stretch min-h-[22px]',
                    line.type === 'add' && 'bg-diff-added',
                    line.type === 'delete' && 'bg-diff-removed'
                  )}
                >
                  <span className="w-[50px] min-w-[50px] px-2 text-right text-fg-muted bg-secondary select-none">
                    {line.oldLineNumber || ''}
                  </span>
                  <span className="w-[50px] min-w-[50px] px-2 text-right text-fg-muted bg-secondary border-r border-default select-none">
                    {line.newLineNumber || ''}
                  </span>
                  <span
                    className={cn(
                      'w-5 min-w-5 text-center text-fg-muted select-none',
                      line.type === 'add' && 'text-diff-added',
                      line.type === 'delete' && 'text-diff-removed'
                    )}
                  >
                    {line.type === 'add' ? '+' : line.type === 'delete' ? '-' : ' '}
                  </span>
                  <span className="flex-1 px-2 whitespace-pre-wrap break-all">{line.content}</span>
                  {onRevertLine && (line.type === 'add' || line.type === 'delete') && lineNum && (
                    <IconButton
                      icon="undo"
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 w-7 min-w-7 flex items-center justify-center text-fg-secondary bg-tertiary transition-opacity duration-100 hover:bg-diff-removed hover:text-diff-removed"
                      onClick={() => onRevertLine(lineNum)}
                      title="Revert this line"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function SplitDiff({ diff, onRevertHunk, onRevertLine }: DiffProps) {
  return (
    <div>
      {diff.hunks.map((hunk, hunkIndex) => {
        const oldLines = hunk.lines.filter(l => l.type !== 'add');
        const newLines = hunk.lines.filter(l => l.type !== 'delete');
        const maxLines = Math.max(oldLines.length, newLines.length);

        return (
          <div key={hunkIndex} className="mb-6 border border-default rounded overflow-hidden">
            <div className="flex justify-between items-center px-3 py-2 bg-tertiary border-b border-default">
              <span className="font-mono-editor text-sm text-fg-secondary">
                @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
              </span>
              {onRevertHunk && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon="undo"
                  onClick={() => onRevertHunk(hunkIndex)}
                  title="Revert this block"
                  className="hover:bg-diff-removed hover:text-diff-removed"
                >
                  Revert Block
                </Button>
              )}
            </div>
            <div className="flex">
              <div className="flex-1 min-w-0 border-r border-default">
                {Array.from({ length: maxLines }).map((_, i) => {
                  const line = oldLines[i];
                  if (!line) {
                    return <div key={i} className="min-h-[22px] bg-tertiary" />;
                  }
                  return (
                    <div key={i} className={cn('flex pr-1', line.type === 'delete' && 'bg-diff-removed')}>
                      <span className="w-10 min-w-10 px-2 text-right text-fg-muted select-none">{line.oldLineNumber || ''}</span>
                      <span className="flex-1 px-2 whitespace-pre-wrap break-all font-mono-editor text-base">{line.content}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex-1 min-w-0">
                {Array.from({ length: maxLines }).map((_, i) => {
                  const line = newLines[i];
                  if (!line) {
                    return <div key={i} className="min-h-[22px] bg-tertiary" />;
                  }
                  const lineNum = line.newLineNumber;
                  return (
                    <div key={i} className={cn('group flex pr-1', line.type === 'add' && 'bg-diff-added')}>
                      <span className="w-10 min-w-10 px-2 text-right text-fg-muted select-none">{line.newLineNumber || ''}</span>
                      <span className="flex-1 px-2 whitespace-pre-wrap break-all font-mono-editor text-base">{line.content}</span>
                      {onRevertLine && line.type === 'add' && lineNum && (
                        <IconButton
                          icon="undo"
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                          onClick={() => onRevertLine(lineNum)}
                          title="Revert"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
