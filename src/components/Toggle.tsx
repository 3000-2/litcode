import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/utils';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const TRACK_SIZES = {
  sm: 'w-7 h-4',
  md: 'w-9 h-5',
  lg: 'w-11 h-6',
} as const;

const THUMB_SIZES = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
} as const;

const THUMB_TRANSLATE = {
  sm: 'peer-checked:translate-x-3',
  md: 'peer-checked:translate-x-4',
  lg: 'peer-checked:translate-x-5',
} as const;

export function Toggle({
  children,
  size = 'md',
  className,
  ...props
}: ToggleProps) {
  return (
    <label className={cn('inline-flex items-center gap-2.5 cursor-pointer text-sm text-fg-primary', className)}>
      <input type="checkbox" className="peer absolute opacity-0 w-0 h-0" {...props} />
      <span
        className={cn(
          'relative inline-block bg-tertiary rounded-full transition-colors duration-200 peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline peer-focus-visible:outline-accent peer-focus-visible:outline-offset-2 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
          TRACK_SIZES[size]
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 bg-fg-secondary rounded-full transition-all duration-200 peer-checked:bg-white',
            THUMB_SIZES[size],
            THUMB_TRANSLATE[size]
          )}
        />
      </span>
      {children && <span className="select-none peer-disabled:opacity-50 peer-disabled:cursor-not-allowed">{children}</span>}
    </label>
  );
}
