import type { SelectHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/utils';

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  fullWidth?: boolean;
}

const SIZE_CLASSES = {
  sm: 'px-2 py-1 text-xs pr-6',
  md: 'px-2.5 py-1.5 text-sm pr-7',
  lg: 'px-3 py-2 text-base pr-8',
} as const;

export function Select({
  size = 'md',
  error = false,
  fullWidth = true,
  className,
  children,
  ...props
}: SelectProps) {
  return (
    <select
      className={cn(
        'rounded bg-secondary text-fg-primary cursor-pointer appearance-none bg-no-repeat focus:outline-none focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed',
        fullWidth ? 'w-full' : 'w-auto',
        error ? 'border-diff-removed' : 'border border-default',
        SIZE_CLASSES[size],
        className
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23969696' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundPosition: 'right 8px center',
      }}
      {...props}
    >
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
