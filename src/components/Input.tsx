import type { InputHTMLAttributes } from 'react';
import { Icon, type IconName } from './Icon';
import { cn } from '../lib/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: IconName;
  error?: boolean;
};

export function Input({
  icon,
  error = false,
  className,
  ...props
}: InputProps) {
  const inputClasses = cn(
    'w-full px-2.5 py-1.5 text-sm border rounded bg-secondary text-fg-primary transition-colors duration-150 focus:outline-none focus:border-accent placeholder:text-fg-muted',
    error ? 'border-diff-removed' : 'border-default',
    icon && 'pl-[30px]',
    className
  );

  if (icon) {
    return (
      <div className="relative flex items-center">
        <Icon name={icon} size={14} className="absolute left-2.5 text-fg-muted pointer-events-none" />
        <input className={inputClasses} {...props} />
      </div>
    );
  }

  return <input className={inputClasses} {...props} />;
}
