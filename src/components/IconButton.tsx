import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from './Icon';
import './components.css';

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

export function IconButton({
  icon,
  size = 'md',
  variant = 'default',
  active = false,
  children,
  className = '',
  ...props
}: IconButtonProps) {
  const classes = [
    'icon-button',
    `icon-button--${size}`,
    `icon-button--${variant}`,
    active && 'icon-button--active',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...props}>
      {icon && <Icon name={icon} size={ICON_SIZES[size]} strokeWidth={1.5} />}
      {children}
    </button>
  );
}
