import { motion } from 'framer-motion';
import { BookOpen, Headphones, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Screen } from '@/types/screen';

const resources = [
  { id: '1', title: 'Gentle breathing guide', subtitle: 'A short audio to help you calm quickly.', type: 'audio', category: 'Mindfulness' },
  { id: '2', title: 'Building recovery routines', subtitle: 'A helpful article for consistent progress.', type: 'article', category: 'Routine' },
  { id: '3', title: 'Emotion journal worksheet', subtitle: 'A printable reflection tool.', type: 'worksheet', category: 'Reflection' }
];

type ResourcesPageProps = {
  onNavigate: (screen: Screen) => void;
};

export function ResourcesPage({ onNavigate }: ResourcesPageProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <div className="rounded-[2rem] bg-white/95 p-8 shadow-glow">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Resources</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Support content that helps you feel steady.</h1>
          </div>
          <Button variant="secondary" onClick={() => onNavigate('checkins')}>Quick check-in</Button>
        </div>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-[2rem] bg-gradient-to-br from-sky-500/10 to-violet-500/10 p-8 shadow-glow">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-sky-100 text-sky-700">
            <LayoutDashboard size={20} />
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-slate-950">Curated support for your day.</h2>
          <p className="mt-4 text-slate-600 leading-7">Browse practical guides, calming audio, and growth-focused tools designed for recovery.</p>
        </div>
        {resources.map((resource) => (
          <article key={resource.id} className="rounded-[2rem] bg-white/95 p-6 shadow-glow">
            <div className="flex items-center gap-3 text-slate-500">
              <span className="flex h-11 w-11 items-center justify-center rounded-3xl bg-slate-100 text-slate-900">
                {resource.type === 'audio' ? <Headphones size={18} /> : resource.type === 'article' ? <BookOpen size={18} /> : <BookOpen size={18} />}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">{resource.category}</span>
            </div>
            <h2 className="mt-6 text-xl font-semibold text-slate-950">{resource.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{resource.subtitle}</p>
            <Button variant="ghost" className="mt-6 px-4 py-3 text-sm font-semibold text-slate-950">
              Open resource
            </Button>
          </article>
        ))}
      </div>
    </motion.div>
  );
}
