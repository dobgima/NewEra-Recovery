import { type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-[140px] w-full rounded-3xl border border-slate-200 bg-white/90 px-4 py-4 text-sm leading-6 text-slate-950 shadow-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100',
        className
      )}
      {...props}
    />
  );
}
