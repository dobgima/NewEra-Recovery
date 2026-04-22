export type AppToast =
  | {
      type: 'success' | 'error' | 'info';
      message: string;
    }
  | null;
