import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from './Icon';
import './components.css';

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

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const classes = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    loading && 'button--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconElement = loading ? (
    <Icon name="loader" size={ICON_SIZES[size]} className="button__spinner" />
  ) : icon ? (
    <Icon name={icon} size={ICON_SIZES[size]} />
  ) : null;

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {iconPosition === 'left' && iconElement}
      {children && <span className="button__text">{children}</span>}
      {iconPosition === 'right' && iconElement}
    </button>
  );
}
