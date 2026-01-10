import type { InputHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

type SliderProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string;
  showValue?: boolean;
  valueSuffix?: string;
};

export function Slider({
  label,
  showValue = true,
  valueSuffix = '',
  value,
  className,
  ...props
}: SliderProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && <label className="text-sm text-fg-secondary">{label}</label>}
      <div className="flex items-center gap-3">
        <input
          type="range"
          className="flex-1 appearance-none h-1 bg-tertiary rounded cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb]:hover:scale-110"
          value={value}
          {...props}
        />
        {showValue && (
          <span className="min-w-10 text-sm text-fg-secondary text-right">
            {value}
            {valueSuffix}
          </span>
        )}
      </div>
    </div>
  );
}
