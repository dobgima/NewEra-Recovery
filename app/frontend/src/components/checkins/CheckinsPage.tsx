import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

import type { CheckinRecord } from '@/types/checkin';
import type { Screen } from '@/types/screen';

type CheckinsPageProps = {
  data: {
    checkins: CheckinRecord[];
    submitCheckin: (payload: Partial<CheckinRecord>) => Promise<{ checkin: CheckinRecord } | null>;
  };
  onNavigate: (screen: Screen) => void;
  loading?: boolean;
};

export function CheckinsPage({ data, onNavigate, loading = false }: CheckinsPageProps) {
  const [mood, setMood] = useState('Calm');
  const [energy, setEnergy] = useState('Balanced');
  const [stress, setStress] = useState('Low');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const result = await data.submitCheckin({ mood, energy, stress, notes });
      if (!result) {
        throw new Error('Unable to submit check-in.');
      }
      setStatus('Check-in submitted successfully!');
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const recent = useMemo(() => data.checkins.slice(0, 4), [data.checkins]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <div className="rounded-[2rem] bg-white/95 p-8 shadow-glow">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Daily check-in</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Capture your mood in minutes.</h1>
          </div>
          <Button variant="secondary" onClick={() => onNavigate('dashboard')}>
            Dashboard overview
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.75fr]">
        <section className="rounded-[2rem] bg-white/95 p-8 shadow-glow">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Mood', value: mood, setter: setMood },
                { label: 'Energy', value: energy, setter: setEnergy },
                { label: 'Stress', value: stress, setter: setStress }
              ].map((field) => (
                <label key={field.label} className="block text-sm text-slate-700">
                  {field.label}
                  <Input
                    value={field.value}
                    onChange={(event) => field.setter(event.target.value)}
                    className="mt-2"
                  />
                </label>
              ))}
            </div>
            <label className="block text-sm text-slate-700">
              Notes
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="How did today feel? Any support you need?"
                className="mt-2"
              />
            </label>
            {status ? <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">{status}</div> : null}
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            <div className="flex flex-wrap gap-3">
              <Button type="submit" className="min-w-[150px]" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Save check-in'}
              </Button>
              <Button variant="ghost" type="button" onClick={() => onNavigate('resources')}>
                Explore support resources
              </Button>
            </div>
          </form>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[2rem] bg-slate-950/95 p-8 text-white shadow-glow">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-200">Support reminder</p>
            <h2 className="mt-4 text-2xl font-semibold">Safe actions you can take today</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-200">
              <li>- Reach out to a trusted friend or peer.</li>
              <li>- Review your crisis plan for comfort and clarity.</li>
              <li>- Take a short grounding walk or breathing break.</li>
            </ul>
          </div>
          <div className="rounded-[2rem] bg-white/95 p-6 shadow-glow">
            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.24em] text-slate-500">
              <Sparkles size={18} /> Recent check-ins
            </div>
            <div className="mt-5 space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="h-5 w-20 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-6 w-16 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                    <div className="mt-2 h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                ))
              ) : recent.length ? (
                recent.map((checkin) => (
                  <div key={checkin.id} className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-slate-950">{checkin.mood}</p>
                      <Badge>{checkin.riskLevel || 'Calm'}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{new Date(checkin.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">Check in to see a list of your recent reflections.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
