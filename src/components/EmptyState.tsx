import { Icon, type IconName } from './Icon';
import { cn } from '../lib/utils';

interface EmptyStateProps {
  icon?: IconName;
  message: string;
  className?: string;
}

export function EmptyState({ icon, message, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 p-6 text-center', className)}>
      {icon && <Icon name={icon} size={24} className="text-fg-muted" />}
      <span className="text-sm text-fg-muted">{message}</span>
    </div>
  );
}
