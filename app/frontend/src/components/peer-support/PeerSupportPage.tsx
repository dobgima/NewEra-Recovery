import { motion } from 'framer-motion';
import { Users, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { PeerConnection } from '@/types/peer';
import type { Screen } from '@/types/screen';

const peers: PeerConnection[] = [
  { id: '1', name: 'Avery Wells', location: 'Portland, OR', status: 'online' },
  { id: '2', name: 'Jules Parker', location: 'Austin, TX', status: 'available' },
  { id: '3', name: 'Mila Chen', location: 'Toronto, ON', status: 'away' }
];

type PeerSupportPageProps = {
  onNavigate: (screen: Screen) => void;
};

const statusStyles: Record<PeerConnection['status'], string> = {
  online: 'bg-emerald-500/20 text-emerald-700',
  available: 'bg-sky-500/20 text-sky-700',
  away: 'bg-amber-300/20 text-amber-700'
};

export function PeerSupportPage({ onNavigate }: PeerSupportPageProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <div className="rounded-[2rem] bg-white/95 p-8 shadow-glow">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Peer support</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Connect with encouragement and calm community care.</h1>
          </div>
          <Button variant="secondary" onClick={() => onNavigate('resources')}>Explore resources</Button>
        </div>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <article className="rounded-[2rem] bg-gradient-to-br from-violet-500/10 to-sky-500/10 p-8 shadow-glow">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-50 text-violet-700">
            <Users size={22} />
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-slate-950">Support at your pace</h2>
          <p className="mt-4 text-slate-600 leading-7">Peer support gives you compassionate space when a warm connection feels right.</p>
          <Button variant="accent" className="mt-8">Request support</Button>
        </article>
        {peers.map((peer) => (
          <div key={peer.id} className="rounded-[2rem] bg-white/95 p-6 shadow-glow">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xl font-semibold text-slate-950">{peer.name}</p>
                <p className="mt-1 text-sm text-slate-600">{peer.location}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[peer.status]}`}>{peer.status}</span>
            </div>
            <p className="mt-5 text-sm text-slate-600">A peer who knows how to listen, reflect, and offer gentle support when you need it most.</p>
            <Button variant="ghost" className="mt-6">Start chat</Button>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-[2rem] bg-white/95 p-8 shadow-glow">
        <div className="flex items-center gap-3 text-slate-500">
          <Heart size={18} />
          <p className="text-sm uppercase tracking-[0.24em]">Wellness atmosphere</p>
        </div>
        <p className="mt-4 text-slate-600 leading-7">This page grows with you. In future updates, peer matching and community check-ins can be added seamlessly.</p>
      </div>
    </motion.div>
  );
}
