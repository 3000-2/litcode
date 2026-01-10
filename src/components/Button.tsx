import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from './Icon';
import { cn } from '../lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  children?: ReactNode;
};

const ICON_SIZES = {
  sm: 12,
  md: 14,
  lg: 16,
} as const;

const SIZE_CLASSES = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
} as const;

const VARIANT_CLASSES = {
  primary: 'bg-accent text-white border-accent hover:bg-accent-hover hover:border-accent-hover',
  secondary: 'bg-tertiary text-fg-primary border-default hover:bg-hover',
  danger: 'bg-diff-removed text-white border-diff-removed hover:bg-[#da3633] hover:border-[#da3633]',
  ghost: 'bg-transparent text-fg-secondary border-transparent hover:bg-hover hover:text-fg-primary',
} as const;

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const iconElement = loading ? (
    <Icon name="loader" size={ICON_SIZES[size]} className="animate-spin" />
  ) : icon ? (
    <Icon name={icon} size={ICON_SIZES[size]} />
  ) : null;

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 border rounded font-medium cursor-pointer transition-all duration-150 whitespace-nowrap',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {iconPosition === 'left' && iconElement}
      {children && <span>{children}</span>}
      {iconPosition === 'right' && iconElement}
    </button>
  );
}
