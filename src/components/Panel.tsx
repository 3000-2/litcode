import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface PanelProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Panel({ title, actions, children, className }: PanelProps) {
  return (
    <div className={cn('flex flex-col h-full overflow-hidden', className)}>
      <div className="flex items-center justify-between px-3 py-2 min-h-header border-b border-default bg-secondary shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wide text-fg-secondary">{title}</span>
        {actions && <div className="flex items-center gap-1">{actions}</div>}
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
