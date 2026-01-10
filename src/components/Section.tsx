import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface SectionProps {
  title?: string;
  hint?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function Section({ title, hint, children, className }: SectionProps) {
  return (
    <div className={cn('py-3 [&+&]:border-t [&+&]:border-default', className)}>
      {title && <h3 className="text-sm font-semibold text-fg-primary mb-2">{title}</h3>}
      <div className="flex flex-col gap-2">{children}</div>
      {hint && <p className="mt-1.5 text-xs text-fg-muted leading-relaxed [&_code]:px-1 [&_code]:bg-tertiary [&_code]:rounded-sm [&_code]:font-mono-editor [&_code]:text-xs">{hint}</p>}
    </div>
  );
}
