import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password should be at least 6 characters')
});

type LoginForm = z.infer<typeof loginSchema>;

type LoginPageProps = {
  onSubmit: (payload: LoginForm) => void;
  onSwitch: () => void;
  onForgotPassword: () => void;
  onBack: () => void;
  loading?: boolean;
};

export function LoginPage({ onSubmit, onSwitch, onForgotPassword, onBack, loading }: LoginPageProps) {
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = loginSchema.safeParse(form);
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
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Welcome back</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">Sign in to newerarecovery.app</h1>
        </div>
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950">
          <ArrowLeft size={18} /> Back
        </button>
      </div>
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
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
          <div className="relative">
            <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="••••••••"
              className="pl-11"
            />
          </div>
          <button
            type="button"
            onClick={onForgotPassword}
            className="mt-2 text-sm font-medium text-sky-600 transition hover:text-sky-700"
          >
            Forgot password?
          </button>
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Continue'}
        </Button>
      </form>
      <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-600">
        New to newerarecovery.app?{' '}
        <button onClick={onSwitch} className="font-semibold text-slate-950 hover:text-slate-700">
          Create an account
        </button>
      </div>
    </motion.div>
  );
}
