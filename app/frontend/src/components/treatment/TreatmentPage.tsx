import { motion } from 'framer-motion';
import { MapPin, Search, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { TreatmentProvider } from '@/types/provider';
import type { Screen } from '@/types/screen';

const providers: TreatmentProvider[] = [
  { id: '1', name: 'Beacon Wellness Center', specialization: 'Recovery coaching', distance: '2.1 mi', rating: 4.9, location: 'Oakland, CA' },
  { id: '2', name: 'Harbor Counseling', specialization: 'Trauma-informed care', distance: '4.7 mi', rating: 4.8, location: 'Berkeley, CA' },
  { id: '3', name: 'Lumen Health', specialization: 'Emotional support therapy', distance: '5.9 mi', rating: 4.7, location: 'Richmond, CA' }
];

type TreatmentPageProps = {
  onNavigate: (screen: Screen) => void;
};

export function TreatmentPage({ onNavigate }: TreatmentPageProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <div className="rounded-[2rem] bg-white/95 p-8 shadow-glow">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Treatment locator</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Find caring support near you.</h1>
          </div>
          <Button variant="secondary" onClick={() => onNavigate('resources')}>Browse resources</Button>
        </div>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[2rem] bg-white/95 p-8 shadow-glow">
          <form className="flex flex-col gap-4 sm:flex-row">
            <Input placeholder="Search by place, support type, or neighborhood" className="flex-1" />
            <Button type="button" className="min-w-[160px]">
              <Search size={18} className="mr-2" /> Search
            </Button>
          </form>
          <div className="mt-8 space-y-5">
            {providers.map((provider) => (
              <div key={provider.id} className="rounded-3xl border border-slate-200/90 bg-slate-50 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">{provider.name}</h2>
                    <p className="mt-1 text-sm text-slate-600">{provider.specialization}</p>
                  </div>
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase text-slate-700">{provider.distance}</span>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-700">
                  <div className="inline-flex items-center gap-2 text-slate-600">
                    <MapPin size={16} /> {provider.location}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-slate-900 shadow-sm">
                    <Star size={16} className="text-amber-500" /> {provider.rating}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <aside className="rounded-[2rem] bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white shadow-glow">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/10 text-white">
            <MapPin size={22} />
          </div>
          <h2 className="mt-6 text-2xl font-semibold">Trusted local care</h2>
          <p className="mt-4 text-slate-200 leading-7">These provider suggestions are a starting point. When you’re ready, reach out to someone who feels right for your recovery path.</p>
          <Button variant="accent" className="mt-8">Save provider list</Button>
        </aside>
      </div>
    </motion.div>
  );
}
