import { Icon } from '../components';
import type { SidebarConfig } from '../core';
import './Sidebar.css';

interface SidebarProps {
  items: SidebarConfig[];
  activeId: string | null;
  collapsed: boolean;
  onItemClick: (id: string) => void;
  onCollapseToggle: () => void;
}

export function Sidebar({ items, activeId, collapsed, onItemClick, onCollapseToggle }: SidebarProps) {
  return (
    <div className="sidebar">
      <div className="sidebar-icons">
        {items.map((item) => (
          <button
            key={item.id}
            className={`sidebar-icon ${activeId === item.id && !collapsed ? 'active' : ''}`}
            onClick={() => onItemClick(item.id)}
            title={item.title}
          >
            {item.icon}
          </button>
        ))}
      </div>

      <div className="sidebar-bottom">
        <button
          className="sidebar-icon"
          onClick={onCollapseToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon name={collapsed ? 'chevron-right' : 'chevron-left'} size={16} />
        </button>
      </div>
    </div>
  );
}
