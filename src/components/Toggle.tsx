import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/utils';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { track: 'w-7 h-4', thumb: 'w-3 h-3', translate: 10 },
  md: { track: 'w-9 h-5', thumb: 'w-4 h-4', translate: 14 },
  lg: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 18 },
} as const;

export function Toggle({
  children,
  size = 'md',
  className,
  checked,
  ...props
}: ToggleProps) {
  const sizeConfig = SIZES[size];
  
  return (
    <label className={cn('inline-flex items-center gap-2.5 cursor-pointer text-sm text-fg-primary', className)}>
      <input type="checkbox" className="sr-only peer" checked={checked} {...props} />
      <span
        className={cn(
          'relative inline-block rounded-full transition-colors duration-200',
          'bg-tertiary peer-checked:bg-accent',
          'peer-focus-visible:outline-2 peer-focus-visible:outline peer-focus-visible:outline-accent peer-focus-visible:outline-offset-2',
          'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
          sizeConfig.track
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 rounded-full transition-transform duration-200 bg-white',
            sizeConfig.thumb
          )}
          style={{ transform: checked ? `translateX(${sizeConfig.translate}px)` : 'translateX(0)' }}
        />
      </span>
      {children && <span className="select-none">{children}</span>}
    </label>
  );
}
