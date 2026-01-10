import type { SelectHTMLAttributes, ReactNode } from 'react';
import './components.css';

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  fullWidth?: boolean;
}

export function Select({
  size = 'md',
  error = false,
  fullWidth = true,
  className = '',
  children,
  ...props
}: SelectProps) {
  const classes = [
    'select',
    `select--${size}`,
    error && 'select--error',
    !fullWidth && 'select--auto',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <select className={classes} {...props}>
      {children}
    </select>
  );
}

interface SelectOptionProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
}

export function SelectOption({ value, children, disabled }: SelectOptionProps) {
  return (
    <option value={value} disabled={disabled}>
      {children}
    </option>
  );
}
