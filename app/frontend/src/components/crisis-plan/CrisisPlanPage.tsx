import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Anchor, Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { CrisisPlan } from '@/types/crisis-plan';
import type { Screen } from '@/types/screen';

const defaultValues: CrisisPlan = {
  warningSigns: '',
  copingStrategies: '',
  contacts: '',
  safePlaces: ''
};

type CrisisPlanProps = {
  plan: CrisisPlan | null;
  onSave: (payload: CrisisPlan) => Promise<CrisisPlan | null>;
  onNavigate: (screen: Screen) => void;
};

export function CrisisPlanPage({ plan, onSave, onNavigate }: CrisisPlanProps) {
  const [values, setValues] = useState<CrisisPlan>(plan ?? defaultValues);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(plan ?? defaultValues);
  }, [plan]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = await onSave(values);
      if (saved) {
        setStatus('Crisis plan updated successfully.');
      }
    } catch {
      setStatus('Unable to save crisis details.');
    } finally {
      setSaving(false);
      window.setTimeout(() => setStatus(''), 5000);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <div className="rounded-[2rem] bg-white/95 p-8 shadow-glow">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Crisis plan</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">A clear path for hard moments.</h1>
          </div>
          <Button variant="secondary" onClick={() => onNavigate('dashboard')}>Return to dashboard</Button>
        </div>
      </div>
      <form className="mt-8 space-y-6 rounded-[2rem] bg-white/95 p-8 shadow-glow" onSubmit={handleSave}>
        <label className="block text-sm font-semibold text-slate-700">
          Warning signs
          <Textarea
            value={values.warningSigns}
            onChange={(event) => setValues({ ...values, warningSigns: event.target.value })}
            placeholder="What changes do you notice before things feel hard?"
            className="mt-3"
          />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Coping strategies
          <Textarea
            value={values.copingStrategies}
            onChange={(event) => setValues({ ...values, copingStrategies: event.target.value })}
            placeholder="What helps you feel steadier?"
            className="mt-3"
          />
        </label>
        <div className="grid gap-6 lg:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700">
            Trusted contacts
            <Input
              value={values.contacts}
              onChange={(event) => setValues({ ...values, contacts: event.target.value })}
              placeholder="Names, numbers, or support resources"
              className="mt-3"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Safe places
            <Input
              value={values.safePlaces}
              onChange={(event) => setValues({ ...values, safePlaces: event.target.value })}
              placeholder="Where you can go for calm and comfort"
              className="mt-3"
            />
          </label>
        </div>
        {status ? <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{status}</div> : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save crisis plan'}</Button>
          <Button variant="ghost" onClick={() => onNavigate('resources')}>View calming resources</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { icon: AlertTriangle, title: 'Notice early', description: 'Identify the first signs you need extra support.' },
            { icon: Anchor, title: 'Stay grounded', description: 'Create simple actions that help you settle.' },
            { icon: Compass, title: 'Keep direction', description: 'Use this plan as a gentle guide when you feel uncertain.' }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-3xl bg-slate-50 p-5 text-slate-700">
                <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
                  <Icon size={18} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6">{item.description}</p>
              </div>
            );
          })}
        </div>
      </form>
    </motion.div>
  );
}
