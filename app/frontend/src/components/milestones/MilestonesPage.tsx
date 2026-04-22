import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { Milestone } from '@/types/milestone';
import type { Screen } from '@/types/screen';

type MilestonesPageProps = {
  milestones: Milestone[];
  createNewMilestone: (payload: Omit<Milestone, 'id' | 'achievedAt'>) => Promise<Milestone | null>;
  onNavigate: (screen: Screen) => void;
  loading?: boolean;
};

export function MilestonesPage({ milestones, createNewMilestone, onNavigate, loading = false }: MilestonesPageProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStatus('');
  }, [milestones]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const milestone = await createNewMilestone({ title, description });
      if (milestone) {
        setStatus('Milestone added. Great work.');
        setTitle('');
        setDescription('');
      }
    } catch {
      setStatus('Unable to add milestone.');
    } finally {
      setSaving(false);
      window.setTimeout(() => setStatus(''), 5000);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <div className="rounded-[2rem] bg-white/95 p-8 shadow-glow">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Milestones</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Celebrate progress with reassuring milestones.</h1>
          </div>
          <Button variant="secondary" onClick={() => onNavigate('dashboard')}>Back to dashboard</Button>
        </div>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] bg-white/95 p-8 shadow-glow">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.24em] text-slate-500">
            <Award size={20} /> Your recent milestones
          </div>
          <div className="mt-6 space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-3xl border border-slate-200/80 bg-slate-50 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="h-5 w-48 bg-slate-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 w-64 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-4 w-20 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))
            ) : milestones.length ? (
              milestones.map((milestone) => (
                <div key={milestone.id} className="rounded-3xl border border-slate-200/80 bg-slate-50 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-950">{milestone.title}</h2>
                      <p className="mt-2 text-sm text-slate-600">{milestone.description}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-600">{new Date(milestone.achievedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200/90 bg-slate-50 p-8 text-slate-600">
                No milestones created yet. Add a meaningful achievement to build momentum.
              </div>
            )}
          </div>
        </section>
        <section className="rounded-[2rem] bg-white/95 p-8 shadow-glow">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.24em] text-slate-500">
            <Sparkles size={20} /> Add a milestone
          </div>
          <form className="mt-6 space-y-5" onSubmit={handleSave}>
            <label className="block text-sm font-semibold text-slate-700">
              Milestone name
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Complete the weekly self-check" className="mt-3" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Notes
              <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Why is this milestone meaningful?" className="mt-3" />
            </label>
            {status ? <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{status}</div> : null}
            <Button type="submit" disabled={saving} className="w-full">{saving ? 'Adding…' : 'Add milestone'}</Button>
          </form>
        </section>
      </div>
    </motion.div>
  );
}
