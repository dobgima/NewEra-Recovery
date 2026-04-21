import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, Flame } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { RecoveryPlan } from '@/types/recovery-plan';
import type { Screen } from '@/types/screen';

const defaultValues: RecoveryPlan = {
  focus: '',
  goals: '',
  habits: '',
  support: ''
};

type RecoveryPlanProps = {
  plan: RecoveryPlan | null;
  onSave: (payload: RecoveryPlan) => Promise<RecoveryPlan | null>;
  onNavigate: (screen: Screen) => void;
};

export function RecoveryPlanPage({ plan, onSave, onNavigate }: RecoveryPlanProps) {
  const [values, setValues] = useState<RecoveryPlan>(plan ?? defaultValues);
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
        setStatus('Recovery plan saved successfully.');
      }
    } catch {
      setStatus('Unable to save your recovery plan.');
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
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Recovery plan</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">A calm plan for grounded progress.</h1>
          </div>
          <Button variant="secondary" onClick={() => onNavigate('dashboard')}>
            Return to dashboard
          </Button>
        </div>
      </div>
      <form className="mt-8 space-y-6 rounded-[2rem] bg-white/95 p-8 shadow-glow" onSubmit={handleSave}>
        <div className="space-y-5">
          <label className="block text-sm font-semibold text-slate-700">Recovery focus</label>
          <Input
            value={values.focus}
            onChange={(event) => setValues({ ...values, focus: event.target.value })}
            placeholder="What matters most for your recovery right now"
          />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700">
            Goals
            <Textarea
              value={values.goals}
              onChange={(event) => setValues({ ...values, goals: event.target.value })}
              placeholder="Describe 2–3 meaningful goals"
              className="mt-3"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Healthy habits
            <Textarea
              value={values.habits}
              onChange={(event) => setValues({ ...values, habits: event.target.value })}
              placeholder="What habits help you stay steady?"
              className="mt-3"
            />
          </label>
        </div>
        <label className="block text-sm font-semibold text-slate-700">
          Support plan
          <Textarea
            value={values.support}
            onChange={(event) => setValues({ ...values, support: event.target.value })}
            placeholder="Who or what you can turn to when you need grounding"
            className="mt-3"
          />
        </label>
        {status ? <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{status}</div> : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save plan'}</Button>
          <Button variant="ghost" onClick={() => onNavigate('crisis-plan')}>
            Edit crisis plan
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { icon: BookOpen, title: 'Focused outcomes', description: 'Keep the most important goals visible.' },
            { icon: Flame, title: 'Daily momentum', description: 'Create simple habits that feel sustainable.' },
            { icon: CheckCircle2, title: 'Support clarity', description: 'Know who you can call when you need help.' }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-3xl bg-slate-50 p-5 text-slate-700">
                <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-sky-100 text-sky-700">
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
