import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';


type RegisterForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const registerSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password should be at least 6 characters')
});

type RegisterPageProps = {
  onSubmit: (payload: RegisterForm) => void;
  onSwitch: () => void;
  onBack: () => void;
  loading?: boolean;
};

export function RegisterPage({ onSubmit, onSwitch, onBack, loading }: RegisterPageProps) {
  const [form, setForm] = useState<RegisterForm>({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = registerSchema.safeParse(form);
    if (!result.success) {
      setError(result.error.issues[0]?.message || 'Please check your entries.');
      return;
    }

    setError('');
    onSubmit(form);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-xl rounded-[2rem] bg-white/95 p-8 shadow-2xl shadow-slate-900/10"
    >
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Join the community</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">Create your recovery space</h1>
        </div>
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950">
          <ArrowLeft size={18} /> Back
        </button>
      </div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            First name
            <Input
              type="text"
              value={form.firstName}
              onChange={(event) => setForm({ ...form, firstName: event.target.value })}
              placeholder="Ari"
              className="mt-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Last name
            <Input
              type="text"
              value={form.lastName}
              onChange={(event) => setForm({ ...form, lastName: event.target.value })}
              placeholder="Lane"
              className="mt-2"
            />
          </label>
        </div>
        <label className="block text-sm font-medium text-slate-700">
          Email
          <Input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="you@example.com"
            className="mt-2"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <Input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            placeholder="Create a secure password"
            className="mt-2"
          />
        </label>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Get started'}
        </Button>
      </form>
      <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <button onClick={onSwitch} className="font-semibold text-slate-950 hover:text-slate-700">
          Sign in
        </button>
      </div>
    </motion.div>
  );
}
