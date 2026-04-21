import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const verifyTwoFactorSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Enter a 6-digit code'),
});

type VerifyTwoFactorForm = z.infer<typeof verifyTwoFactorSchema>;

type TwoFactorVerifyPageProps = {
  twoFactorToken: string;
  method: string;
  onSubmit: (payload: { token: string; code: string }) => void;
  onBack: () => void;
  loading?: boolean;
};

export function TwoFactorVerifyPage({ twoFactorToken, method, onSubmit, onBack, loading }: TwoFactorVerifyPageProps) {
  const [form, setForm] = useState<VerifyTwoFactorForm>({ code: '' });
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = verifyTwoFactorSchema.safeParse(form);
    if (!result.success) {
      setError(result.error.issues[0]?.message || 'Please check your input.');
      return;
    }

    setError('');
    onSubmit({
      token: twoFactorToken,
      code: form.code,
    });
  };

  const handleCodeChange = (value: string) => {
    // Only allow digits and limit to 6
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setForm({ code: cleaned });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-xl rounded-[2rem] bg-white/95 p-8 shadow-2xl shadow-slate-900/10"
    >
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Verify identity</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">Two-factor authentication</h1>
        </div>
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950">
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      <p className="mb-6 text-sm leading-relaxed text-slate-600">
        We've sent a verification code to your {method}. Enter it below to continue.
      </p>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Verification Code</label>
          <div className="relative">
            <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              value={form.code}
              onChange={(event) => handleCodeChange(event.target.value)}
              placeholder="000000"
              className="pl-11 text-center text-2xl tracking-widest"
              disabled={loading}
              maxLength={6}
              inputMode="numeric"
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">Enter the 6-digit code</p>
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <Button type="submit" className="w-full" disabled={loading || form.code.length !== 6}>
          {loading ? 'Verifying…' : 'Verify'}
        </Button>
      </form>

      <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-medium text-slate-700 mb-2">Didn't receive the code?</p>
        <p>Check your spam folder or request a new code by logging in again.</p>
      </div>
    </motion.div>
  );
}
