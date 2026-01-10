import type { InputHTMLAttributes, ReactNode } from 'react';
import './components.css';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  children?: ReactNode;
};

export function Checkbox({
  children,
  className = '',
  ...props
}: CheckboxProps) {
  const classes = ['checkbox', className].filter(Boolean).join(' ');

  return (
    <label className={classes}>
      <input type="checkbox" className="checkbox__input" {...props} />
      <span className="checkbox__box" />
      {children && <span className="checkbox__label">{children}</span>}
    </label>
  );
}
