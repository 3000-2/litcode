import type { InputHTMLAttributes } from 'react';
import { Icon, type IconName } from './Icon';
import './components.css';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: IconName;
  error?: boolean;
};

export function Input({
  icon,
  error = false,
  className = '',
  ...props
}: InputProps) {
  const classes = [
    'input',
    icon && 'input--with-icon',
    error && 'input--error',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (icon) {
    return (
      <div className="input-wrapper">
        <Icon name={icon} size={14} className="input__icon" />
        <input className={classes} {...props} />
      </div>
    );
  }

  return <input className={classes} {...props} />;
}
