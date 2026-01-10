import type { InputHTMLAttributes, ReactNode } from 'react';
import './components.css';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Toggle({
  children,
  size = 'md',
  className = '',
  ...props
}: ToggleProps) {
  const classes = [
    'toggle',
    `toggle--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={classes}>
      <input type="checkbox" className="toggle__input" {...props} />
      <span className="toggle__track">
        <span className="toggle__thumb" />
      </span>
      {children && <span className="toggle__label">{children}</span>}
    </label>
  );
}
