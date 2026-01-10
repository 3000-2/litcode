import type { InputHTMLAttributes } from 'react';
import './components.css';

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
  className = '',
  ...props
}: SliderProps) {
  const classes = ['slider', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {label && <label className="slider__label">{label}</label>}
      <div className="slider__track">
        <input type="range" className="slider__input" value={value} {...props} />
        {showValue && (
          <span className="slider__value">
            {value}
            {valueSuffix}
          </span>
        )}
      </div>
    </div>
  );
}
