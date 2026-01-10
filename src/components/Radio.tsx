import type { InputHTMLAttributes, ReactNode } from 'react';
import './components.css';

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  children?: ReactNode;
}

export function Radio({ children, className = '', ...props }: RadioProps) {
  const classes = ['radio', className].filter(Boolean).join(' ');

  return (
    <label className={classes}>
      <input type="radio" className="radio__input" {...props} />
      <span className="radio__circle" />
      {children && <span className="radio__label">{children}</span>}
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

export function RadioGroup({
  name,
  value,
  onChange,
  options,
  direction = 'vertical',
  className = '',
}: RadioGroupProps) {
  const classes = [
    'radio-group',
    `radio-group--${direction}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="radiogroup">
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
