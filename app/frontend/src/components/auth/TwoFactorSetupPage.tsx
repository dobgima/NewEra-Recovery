import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Phone, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const setupTwoFactorSchema = z.object({
  method: z.enum(['email', 'sms']),
});

const verifyTwoFactorSetupSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Enter a 6-digit code'),
});

type SetupTwoFactorForm = z.infer<typeof setupTwoFactorSchema>;
type VerifyTwoFactorSetupForm = z.infer<typeof verifyTwoFactorSetupSchema>;

type TwoFactorSetupPageProps = {
  onSetup: (payload: SetupTwoFactorForm) => void;
  onVerify: (payload: { token: string; code: string }) => void;
  onBack: () => void;
  loading?: boolean;
  sessionToken?: string;
  step?: 'select' | 'verify';
};

export function TwoFactorSetupPage({
  onSetup,
  onVerify,
  onBack,
  loading,
  sessionToken,
  step = 'select',
}: TwoFactorSetupPageProps) {
  const [form, setForm] = useState<SetupTwoFactorForm>({ method: 'email' });
  const [verifyForm, setVerifyForm] = useState<VerifyTwoFactorSetupForm>({ code: '' });
  const [error, setError] = useState('');

  const handleSetupSubmit = () => {
    setError('');
    onSetup(form);
  };

  const handleVerifySubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = verifyTwoFactorSetupSchema.safeParse(verifyForm);
    if (!result.success) {
      setError(result.error.issues[0]?.message || 'Please check your input.');
      return;
    }

    if (!sessionToken) {
      setError('Session expired. Please try again.');
      return;
    }

    setError('');
    onVerify({
      token: sessionToken,
      code: verifyForm.code,
    });
  };

  const handleCodeChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setVerifyForm({ code: cleaned });
  };

  if (step === 'verify') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-xl rounded-[2rem] bg-white/95 p-8 shadow-2xl shadow-slate-900/10"
      >
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Verify setup</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Confirm your code</h1>
          </div>
          <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950">
            <ArrowLeft size={18} /> Back
          </button>
        </div>

        <p className="mb-6 text-sm leading-relaxed text-slate-600">
          Enter the code we sent to your {form.method} to confirm your two-factor authentication setup.
        </p>

        <form className="space-y-6" onSubmit={handleVerifySubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Verification Code</label>
            <div className="relative">
              <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                value={verifyForm.code}
                onChange={(event) => handleCodeChange(event.target.value)}
                placeholder="000000"
                className="pl-11 text-center text-2xl tracking-widest"
                disabled={loading}
                maxLength={6}
                inputMode="numeric"
              />
            </div>
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={loading || verifyForm.code.length !== 6}>
            {loading ? 'Verifying…' : 'Enable 2FA'}
          </Button>
        </form>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-xl rounded-[2rem] bg-white/95 p-8 shadow-2xl shadow-slate-900/10"
    >
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Security</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">Enable two-factor authentication</h1>
        </div>
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950">
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      <p className="mb-8 text-sm leading-relaxed text-slate-600">
        Choose how you'd like to receive your verification code when you sign in.
      </p>

      <div className="space-y-4">
        <label className="flex items-center gap-4 rounded-lg border-2 border-slate-200 p-4 cursor-pointer transition hover:border-slate-300 hover:bg-slate-50" style={{ borderColor: form.method === 'email' ? '#0ea5e9' : 'rgb(226, 232, 240)', backgroundColor: form.method === 'email' ? 'rgb(240, 249, 255)' : 'transparent' }}>
          <input
            type="radio"
            name="method"
            value="email"
            checked={form.method === 'email'}
            onChange={(e) => setForm({ method: e.target.value as 'email' | 'sms' })}
            className="h-4 w-4"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Mail size={18} className="text-slate-600" />
              <span className="font-semibold text-slate-900">Email</span>
            </div>
            <p className="mt-1 text-sm text-slate-600">Receive codes via email (recommended)</p>
          </div>
        </label>

        <label className="flex items-center gap-4 rounded-lg border-2 border-slate-200 p-4 cursor-pointer transition hover:border-slate-300 hover:bg-slate-50" style={{ borderColor: form.method === 'sms' ? '#0ea5e9' : 'rgb(226, 232, 240)', backgroundColor: form.method === 'sms' ? 'rgb(240, 249, 255)' : 'transparent' }}>
          <input
            type="radio"
            name="method"
            value="sms"
            checked={form.method === 'sms'}
            onChange={(e) => setForm({ method: e.target.value as 'email' | 'sms' })}
            className="h-4 w-4"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Phone size={18} className="text-slate-600" />
              <span className="font-semibold text-slate-900">SMS</span>
            </div>
            <p className="mt-1 text-sm text-slate-600">Receive codes via text message</p>
          </div>
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      <Button onClick={handleSetupSubmit} className="w-full mt-6" disabled={loading}>
        {loading ? 'Setting up…' : 'Continue'}
      </Button>
    </motion.div>
  );
}
