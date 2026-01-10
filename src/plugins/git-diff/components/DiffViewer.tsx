import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './DiffViewer.css';

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

interface DiffViewerProps {
  repoPath: string;
  filePath: string;
  onClose: () => void;
  onRevert: () => void;
}

export function DiffViewer({ repoPath, filePath, onClose, onRevert }: DiffViewerProps) {
  const [diff, setDiff] = useState<GitDiff | null>(null);
  const [viewMode, setViewMode] = useState<'inline' | 'side-by-side'>('inline');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDiff = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await invoke<GitDiff>('git_diff', { repoPath, filePath });
        setDiff(result);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    loadDiff();
  }, [repoPath, filePath]);

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
    <div className="diff-viewer-overlay">
      <div className="diff-viewer">
        <div className="diff-viewer-header">
          <div className="diff-viewer-title">
            <span className="diff-file-name">{fileName}</span>
            <span className="diff-file-path">{filePath}</span>
          </div>
          <div className="diff-viewer-actions">
            <button
              className={`view-mode-btn ${viewMode === 'inline' ? 'active' : ''}`}
              onClick={() => setViewMode('inline')}
            >
              Inline
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'side-by-side' ? 'active' : ''}`}
              onClick={() => setViewMode('side-by-side')}
            >
              Side by Side
            </button>
            <button className="revert-all-btn" onClick={handleRevertFile}>
              Discard All
            </button>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="diff-viewer-content">
          {loading && <div className="diff-loading">Loading diff...</div>}
          {error && <div className="diff-error">{error}</div>}

          {!loading && !error && diff && (
            viewMode === 'inline' ? (
              <InlineDiff
                diff={diff}
                onRevertHunk={handleRevertHunk}
                onRevertLine={handleRevertLine}
              />
            ) : (
              <SideBySideDiff
                diff={diff}
                onRevertHunk={handleRevertHunk}
                onRevertLine={handleRevertLine}
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
  onRevertHunk: (index: number) => void;
  onRevertLine: (lineNumber: number) => void;
}

function InlineDiff({ diff, onRevertHunk, onRevertLine }: DiffProps) {
  return (
    <div className="inline-diff">
      {diff.hunks.map((hunk, hunkIndex) => (
        <div key={hunkIndex} className="diff-hunk">
          <div className="hunk-header">
            <span className="hunk-info">
              @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
            </span>
            <button
              className="hunk-revert"
              onClick={() => onRevertHunk(hunkIndex)}
              title="Revert this block"
            >
              ↩ Revert Block
            </button>
          </div>
          <div className="hunk-lines">
            {hunk.lines.map((line, lineIndex) => {
              const lineNum = line.newLineNumber || line.oldLineNumber;
              return (
                <div
                  key={lineIndex}
                  className={`diff-line ${line.type}`}
                >
                  <span className="line-number old">
                    {line.oldLineNumber || ''}
                  </span>
                  <span className="line-number new">
                    {line.newLineNumber || ''}
                  </span>
                  <span className="line-type">
                    {line.type === 'add' ? '+' : line.type === 'delete' ? '-' : ' '}
                  </span>
                  <span className="line-content">{line.content}</span>
                  {(line.type === 'add' || line.type === 'delete') && lineNum && (
                    <button
                      className="line-revert"
                      onClick={() => onRevertLine(lineNum)}
                      title="Revert this line"
                    >
                      ↩
                    </button>
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

function SideBySideDiff({ diff, onRevertHunk, onRevertLine }: DiffProps) {
  return (
    <div className="side-by-side-diff">
      {diff.hunks.map((hunk, hunkIndex) => {
        const oldLines = hunk.lines.filter(l => l.type !== 'add');
        const newLines = hunk.lines.filter(l => l.type !== 'delete');
        const maxLines = Math.max(oldLines.length, newLines.length);

        return (
          <div key={hunkIndex} className="diff-hunk">
            <div className="hunk-header">
              <span className="hunk-info">
                @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
              </span>
              <button
                className="hunk-revert"
                onClick={() => onRevertHunk(hunkIndex)}
                title="Revert this block"
              >
                ↩ Revert Block
              </button>
            </div>
            <div className="hunk-columns">
              <div className="hunk-column old">
                {Array.from({ length: maxLines }).map((_, i) => {
                  const line = oldLines[i];
                  if (!line) {
                    return <div key={i} className="diff-line empty" />;
                  }
                  return (
                    <div key={i} className={`diff-line ${line.type}`}>
                      <span className="line-number">{line.oldLineNumber || ''}</span>
                      <span className="line-content">{line.content}</span>
                    </div>
                  );
                })}
              </div>
              <div className="hunk-column new">
                {Array.from({ length: maxLines }).map((_, i) => {
                  const line = newLines[i];
                  if (!line) {
                    return <div key={i} className="diff-line empty" />;
                  }
                  const lineNum = line.newLineNumber;
                  return (
                    <div key={i} className={`diff-line ${line.type}`}>
                      <span className="line-number">{line.newLineNumber || ''}</span>
                      <span className="line-content">{line.content}</span>
                      {line.type === 'add' && lineNum && (
                        <button
                          className="line-revert"
                          onClick={() => onRevertLine(lineNum)}
                          title="Revert"
                        >
                          ↩
                        </button>
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
