import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/utils';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  children?: ReactNode;
};

export function Checkbox({
  children,
  className,
  ...props
}: CheckboxProps) {
  return (
    <label className={cn('inline-flex items-center gap-2 cursor-pointer text-sm text-fg-primary', className)}>
      <input type="checkbox" className="peer absolute opacity-0 w-0 h-0" {...props} />
      <span className="flex items-center justify-center w-4 h-4 border border-default rounded-sm bg-secondary transition-all duration-150 peer-checked:bg-accent peer-checked:border-accent peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-accent peer-focus-visible:outline-offset-1 peer-checked:after:content-[''] peer-checked:after:w-[5px] peer-checked:after:h-2 peer-checked:after:border-white peer-checked:after:border-r-2 peer-checked:after:border-b-2 peer-checked:after:rotate-45 peer-checked:after:mb-0.5" />
      {children && <span className="select-none">{children}</span>}
    </label>
  );
}
