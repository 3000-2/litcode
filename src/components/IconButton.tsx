import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from './Icon';
import { cn } from '../lib/utils';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: IconName;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'danger';
  active?: boolean;
  children?: ReactNode;
};

const ICON_SIZES = {
  sm: 12,
  md: 14,
  lg: 16,
} as const;

const SIZE_CLASSES = {
  sm: 'p-1 min-w-5 min-h-5',
  md: 'p-1.5 min-w-6 min-h-6',
  lg: 'p-2 min-w-7 min-h-7',
} as const;

const VARIANT_CLASSES = {
  default: '',
  ghost: 'opacity-60 hover:opacity-100 hover:bg-transparent',
  danger: 'hover:bg-diff-removed hover:text-diff-removed',
} as const;

export function IconButton({
  icon,
  size = 'md',
  variant = 'default',
  active = false,
  children,
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1 border-none bg-transparent text-fg-secondary cursor-pointer rounded transition-colors duration-150',
        'hover:bg-hover hover:text-fg-primary',
        'focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent focus-visible:-outline-offset-1',
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        active && 'bg-active text-fg-primary',
        className
      )}
      {...props}
    >
      {icon && <Icon name={icon} size={ICON_SIZES[size]} strokeWidth={1.5} />}
      {children}
    </button>
  );
}
