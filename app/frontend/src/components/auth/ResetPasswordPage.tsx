import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

type ResetPasswordPageProps = {
  token: string;
  onSubmit: (payload: { token: string; password: string }) => void;
  onBack: () => void;
  loading?: boolean;
  message?: string;
};

export function ResetPasswordPage({ token, onSubmit, onBack, loading, message }: ResetPasswordPageProps) {
  const [form, setForm] = useState<ResetPasswordForm>({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = resetPasswordSchema.safeParse(form);
    if (!result.success) {
      setError(result.error.issues[0]?.message || 'Please check your input.');
      return;
    }

    setError('');
    onSubmit({
      token,
      password: form.password,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-xl rounded-[2rem] bg-white/95 p-8 shadow-2xl shadow-slate-900/10"
    >
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Create new password</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">Set your new password</h1>
        </div>
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950">
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      <p className="mb-6 text-sm leading-relaxed text-slate-600">
        Please enter a strong password to secure your account.
      </p>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">New Password</label>
          <div className="relative">
            <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="••••••••"
              className="pl-11"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Confirm Password</label>
          <div className="relative">
            <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
              placeholder="••••••••"
              className="pl-11"
              disabled={loading}
            />
          </div>
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Resetting…' : 'Reset Password'}
        </Button>
      </form>
    </motion.div>
  );
}
