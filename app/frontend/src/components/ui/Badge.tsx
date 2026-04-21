import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeProps = {
  children: ReactNode;
  variant?: 'soft' | 'solid';
  className?: string;
};

export function Badge({ children, variant = 'soft', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
        variant === 'soft'
          ? 'bg-slate-100 text-slate-900'
          : 'bg-sky-500 text-white shadow-sm',
        className
      )}
    >
      {children}
    </span>
  );
}
