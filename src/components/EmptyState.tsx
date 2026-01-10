import { Icon, type IconName } from './Icon';
import './components.css';

interface EmptyStateProps {
  icon?: IconName;
  message: string;
  className?: string;
}

export function EmptyState({ icon, message, className = '' }: EmptyStateProps) {
  const classes = ['empty-state', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {icon && <Icon name={icon} size={24} className="empty-state__icon" />}
      <span className="empty-state__message">{message}</span>
    </div>
  );
}
