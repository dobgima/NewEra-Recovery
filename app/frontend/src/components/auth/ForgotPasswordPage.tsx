import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

type ForgotPasswordPageProps = {
  onSubmit: (payload: ForgotPasswordForm) => void;
  onBack: () => void;
  loading?: boolean;
  message?: string;
};

export function ForgotPasswordPage({ onSubmit, onBack, loading, message }: ForgotPasswordPageProps) {
  const [form, setForm] = useState<ForgotPasswordForm>({ email: '' });
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = forgotPasswordSchema.safeParse(form);
    if (!result.success) {
      setError(result.error.issues[0]?.message || 'Please check your input.');
      return;
    }

    setError('');
    onSubmit(form);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-xl rounded-[2rem] bg-white/95 p-8 shadow-2xl shadow-slate-900/10"
    >
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Recover your account</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">Reset your password</h1>
        </div>
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950">
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      <p className="mb-6 text-sm leading-relaxed text-slate-600">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
          <div className="relative">
            <Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="you@example.com"
              className="pl-11"
              disabled={loading}
            />
          </div>
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Sending…' : 'Send Reset Link'}
        </Button>
      </form>
    </motion.div>
  );
}
