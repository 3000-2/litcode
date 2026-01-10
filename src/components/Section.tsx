import type { ReactNode } from 'react';
import './components.css';

interface SectionProps {
  title?: string;
  hint?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function Section({ title, hint, children, className = '' }: SectionProps) {
  const classes = ['section', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {title && <h3 className="section__title">{title}</h3>}
      <div className="section__content">{children}</div>
      {hint && <p className="section__hint">{hint}</p>}
    </div>
  );
}
