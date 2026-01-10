import type { ReactNode } from 'react';
import './components.css';

interface PanelProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Panel({ title, actions, children, className = '' }: PanelProps) {
  const classes = ['panel', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div className="panel__header">
        <span className="panel__title">{title}</span>
        {actions && <div className="panel__actions">{actions}</div>}
      </div>
      <div className="panel__content">{children}</div>
    </div>
  );
}
