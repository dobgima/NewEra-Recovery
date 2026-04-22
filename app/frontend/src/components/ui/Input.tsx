import { type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ className, label, ...props }: InputProps) {
  const inputElement = (
    <input
      className={cn(
        'w-full rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100',
        className
      )}
      {...props}
    />
  );

  if (label) {
    return (
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
        {inputElement}
      </div>
    );
  }

  return inputElement;
}
