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
  canRevert: boolean;
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
  canRevert,
}: DiffToolbarProps) {
  const getStatusLabel = () => {
    if (isUntracked) return 'Untracked';
    if (staged) return 'Staged';
    return 'Modified';
  };

  const statusClass = cn(
    'px-2 py-0.5 rounded text-2xs font-medium',
    isUntracked && 'bg-diff-added text-diff-added',
    staged && 'bg-accent/20 text-accent',
    !isUntracked && !staged && 'bg-diff-modified text-diff-modified'
  );

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-secondary border-b border-default min-h-[44px]">
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{fileName}</span>
            <span className={statusClass}>{getStatusLabel()}</span>
          </div>
          <span className="text-xs text-fg-muted">{filePath}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 mr-2">
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

        {canRevert && (
          <>
            <Button
              variant="ghost"
              size="sm"
              icon="chevrons-left"
              onClick={onRejectAll}
              title="Reject all changes (restore original)"
            >
              Reject All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon="chevrons-right"
              onClick={onAcceptAll}
              title="Accept all changes"
            >
              Accept All
            </Button>
          </>
        )}

        <div className="w-px h-5 bg-border-default mx-1" />
        
        <IconButton
          icon="x"
          size="md"
          variant="ghost"
          onClick={onClose}
          title="Close diff (Escape)"
        />
      </div>
    </div>
  );
}
