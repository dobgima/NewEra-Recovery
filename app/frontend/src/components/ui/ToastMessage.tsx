import { X } from 'lucide-react';
import type { AppToast } from '@/types/api';
import { cn } from '@/lib/utils';

type ToastMessageProps = {
  toast: AppToast;
  onClose: () => void;
};

export function ToastMessage({ toast, onClose }: ToastMessageProps) {
  if (!toast) {
    return null;
  }

  const styles = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    info: 'bg-sky-500'
  } as const;

  return (
    <div className={cn('fixed bottom-6 right-6 z-50 w-[min(360px,calc(100%-2rem)))] rounded-3xl px-5 py-4 text-white shadow-2xl shadow-slate-950/15', styles[toast.type])}>
      <div className="flex items-start gap-4">
        <div className="flex-1 text-sm leading-6">{toast.message}</div>
        <button onClick={onClose} className="rounded-full p-2 text-white/80 transition hover:text-white">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
