import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/utils';

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  children?: ReactNode;
}

export function Radio({ children, className, ...props }: RadioProps) {
  return (
    <label className={cn('inline-flex items-center gap-2 cursor-pointer text-sm text-fg-primary', className)}>
      <input type="radio" className="peer absolute opacity-0 w-0 h-0" {...props} />
      <span className="flex items-center justify-center w-4 h-4 border border-default rounded-full bg-secondary transition-colors duration-150 peer-checked:border-accent peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-accent peer-focus-visible:outline-offset-1 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed after:content-[''] after:w-2 after:h-2 after:rounded-full after:bg-accent after:scale-0 after:transition-transform after:duration-150 peer-checked:after:scale-100" />
      {children && <span className="select-none peer-disabled:opacity-50 peer-disabled:cursor-not-allowed">{children}</span>}
    </label>
  );
}

interface RadioGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: ReactNode; disabled?: boolean }>;
  direction?: 'horizontal' | 'vertical';
  className?: string;
}

const DIRECTION_CLASSES = {
  vertical: 'flex-col gap-2',
  horizontal: 'flex-row gap-4',
} as const;

export function RadioGroup({
  name,
  value,
  onChange,
  options,
  direction = 'vertical',
  className,
}: RadioGroupProps) {
  return (
    <div className={cn('flex', DIRECTION_CLASSES[direction], className)} role="radiogroup">
      {options.map((option) => (
        <Radio
          key={option.value}
          name={name}
          value={option.value}
          checked={value === option.value}
          onChange={() => onChange(option.value)}
          disabled={option.disabled}
        >
          {option.label}
        </Radio>
      ))}
    </div>
  );
}
