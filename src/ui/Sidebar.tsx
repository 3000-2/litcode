import { Icon } from '../components';
import { cn } from '../lib/utils';
import type { SidebarConfig } from '../core';

interface SidebarProps {
  items: SidebarConfig[];
  activeId: string | null;
  collapsed: boolean;
  onItemClick: (id: string) => void;
  onCollapseToggle: () => void;
}

export function Sidebar({ items, activeId, collapsed, onItemClick, onCollapseToggle }: SidebarProps) {
  return (
    <div className="w-sidebar min-w-sidebar bg-secondary border-r border-default flex flex-col justify-between">
      <div className="flex flex-col py-1">
        {items.map((item) => {
          const isActive = activeId === item.id && !collapsed;
          return (
            <button
              key={item.id}
              className={cn(
                'w-sidebar h-sidebar flex items-center justify-center text-fg-secondary transition-colors duration-150 relative hover:text-fg-primary',
                isActive && 'text-fg-primary before:content-[""] before:absolute before:left-0 before:top-1/4 before:bottom-1/4 before:w-0.5 before:bg-accent'
              )}
              onClick={() => onItemClick(item.id)}
              title={item.title}
            >
              {item.icon}
            </button>
          );
        })}
      </div>

      <div className="py-1">
        <button
          className="w-sidebar h-sidebar flex items-center justify-center text-fg-secondary transition-colors duration-150 hover:text-fg-primary"
          onClick={onCollapseToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon name={collapsed ? 'chevron-right' : 'chevron-left'} size={16} />
        </button>
      </div>
    </div>
  );
}
