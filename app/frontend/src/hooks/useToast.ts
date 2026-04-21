import { useEffect, useState } from 'react';
import type { AppToast } from '@/types/api';

export function useToast() {
  const [toast, setToast] = useState<AppToast>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const clearToast = () => setToast(null);

  return { toast, setToast, clearToast };
}
