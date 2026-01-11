import { useEffect, useRef } from 'react';
import { Icon, type IconName } from './Icon';
import { cn } from '../lib/utils';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: IconName;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  separator?: boolean;
  onClick?: () => void;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  x: number;
  y: number;
  onClose: () => void;
}

export function ContextMenu({ items, x, y, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position if menu would go off screen
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (rect.right > viewportWidth) {
        menuRef.current.style.left = `${x - rect.width}px`;
      }
      if (rect.bottom > viewportHeight) {
        menuRef.current.style.top = `${y - rect.height}px`;
      }
    }
  }, [x, y]);

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled) return;
    item.onClick?.();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[160px] py-1 bg-secondary border border-default rounded shadow-lg"
      style={{ left: x, top: y }}
    >
      {items.map((item) =>
        item.separator ? (
          <div key={item.id} className="my-1 border-t border-default" />
        ) : (
          <button
            key={item.id}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left transition-colors',
              item.disabled
                ? 'text-fg-muted cursor-not-allowed'
                : item.danger
                  ? 'text-diff-removed hover:bg-diff-removed-bg'
                  : 'text-fg-primary hover:bg-hover'
            )}
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
          >
            {item.icon && (
              <Icon
                name={item.icon}
                size={14}
                className={cn(
                  item.disabled ? 'text-fg-muted' : item.danger ? 'text-diff-removed' : 'text-fg-secondary'
                )}
              />
            )}
            <span className="flex-1">{item.label}</span>
            {item.shortcut && (
              <span className="text-xs text-fg-muted">{item.shortcut}</span>
            )}
          </button>
        )
      )}
    </div>
  );
}
