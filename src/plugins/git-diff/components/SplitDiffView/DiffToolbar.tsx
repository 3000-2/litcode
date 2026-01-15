import { IconButton, Button } from '../../../../components';
import { cn } from '../../../../lib/utils';

interface DiffToolbarProps {
  fileName: string;
  filePath: string;
  staged: boolean;
  isUntracked: boolean;
  onClose: () => void;
  onPrevChunk: () => void;
  onNextChunk: () => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canRevert: boolean;
  hasUndo: boolean;
  hasRedo: boolean;
}

export function DiffToolbar({
  fileName,
  filePath,
  staged,
  isUntracked,
  onClose,
  onPrevChunk,
  onNextChunk,
  onAcceptAll,
  onRejectAll,
  onUndo,
  onRedo,
  canRevert,
  hasUndo,
  hasRedo,
}: DiffToolbarProps) {
  const getStatusLabel = () => {
    if (isUntracked) return 'Untracked';
    if (staged) return 'Staged';
    return 'Modified';
  };

  const statusClass = cn(
    'px-2 py-0.5 rounded text-2xs font-medium',
    isUntracked && 'bg-diff-added/20 text-diff-added',
    staged && 'bg-accent/20 text-accent',
    !isUntracked && !staged && 'bg-diff-modified/20 text-diff-modified'
  );

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl+';

  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-secondary border-b border-default min-h-[40px]">
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{fileName}</span>
            <span className={statusClass}>{getStatusLabel()}</span>
          </div>
          <span className="text-2xs text-fg-muted truncate max-w-[300px]">{filePath}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <div className="flex items-center border-r border-default pr-2 mr-1">
          <IconButton
            icon="chevron-up"
            size="sm"
            variant="ghost"
            onClick={onPrevChunk}
            title="Previous change (Shift+F7)"
          />
          <IconButton
            icon="chevron-down"
            size="sm"
            variant="ghost"
            onClick={onNextChunk}
            title="Next change (F7)"
          />
        </div>

        <div className="flex items-center border-r border-default pr-2 mr-1">
          <IconButton
            icon="undo"
            size="sm"
            variant="ghost"
            onClick={onUndo}
            disabled={!hasUndo}
            title={`Undo (${modKey}Z)`}
            className={cn(!hasUndo && 'opacity-40')}
          />
          <IconButton
            icon="redo"
            size="sm"
            variant="ghost"
            onClick={onRedo}
            disabled={!hasRedo}
            title={`Redo (${modKey}Shift+Z)`}
            className={cn(!hasRedo && 'opacity-40')}
          />
        </div>

        {canRevert && (
          <div className="flex items-center gap-1 border-r border-default pr-2 mr-1">
            <Button
              variant="ghost"
              size="sm"
              icon="arrow-left-to-line"
              onClick={onRejectAll}
              title="Discard all changes and restore original"
              className="text-diff-removed hover:bg-diff-removed/10"
            >
              Discard
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon="check"
              onClick={onAcceptAll}
              title="Save changes to file"
            >
              Save
            </Button>
          </div>
        )}
        
        <IconButton
          icon="x"
          size="sm"
          variant="ghost"
          onClick={onClose}
          title="Close diff (Escape)"
        />
      </div>
    </div>
  );
}
