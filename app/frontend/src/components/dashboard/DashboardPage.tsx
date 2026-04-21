import { motion } from 'framer-motion';
import { CalendarCheck2, HeartPulse, ShieldAlert, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { AuthUser } from '@/types/auth';
import type { CheckinRecord } from '@/types/checkin';
import type { Milestone } from '@/types/milestone';
import type { RecoveryPlan } from '@/types/recovery-plan';
import type { CrisisPlan } from '@/types/crisis-plan';
import type { Screen } from '@/types/screen';

type DashboardPageProps = {
  user: AuthUser;
  data: {
    checkins: CheckinRecord[];
    recoveryPlan: RecoveryPlan | null;
    crisisPlan: CrisisPlan | null;
    milestones: Milestone[];
  };
  onNavigate: (screen: Screen) => void;
  loading?: boolean;
};

const summaryCards = [
  { label: 'Daily check-ins', icon: HeartPulse, color: 'from-rose-300 to-pink-400' },
  { label: 'Recovery focus', icon: Sparkles, color: 'from-sky-300 to-indigo-400' },
  { label: 'Crisis readiness', icon: ShieldAlert, color: 'from-emerald-300 to-teal-400' },
  { label: 'Milestone progress', icon: CalendarCheck2, color: 'from-amber-300 to-orange-400' }
];

export function DashboardPage({ user, data, onNavigate, loading = false }: DashboardPageProps) {
  const latestCheckin = data.checkins[0];
  const safeDisplayName = user.profile?.displayName || `${user.profile?.firstName || 'Recovery'} ${user.profile?.lastName || ''}`.trim() || 'friend';

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-10 rounded-[2rem] bg-white/90 p-8 shadow-glow">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="h-6 w-32 bg-slate-200 rounded animate-pulse"></div>
              <div>
                <div className="h-12 w-96 bg-slate-200 rounded animate-pulse mb-3"></div>
                <div className="h-4 w-80 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-10 w-32 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-10 w-32 bg-slate-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-[2rem] bg-white/90 p-6 shadow-glow">
              <div className="h-6 w-24 bg-slate-200 rounded animate-pulse mb-4"></div>
              <div className="h-8 w-16 bg-slate-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] bg-white/90 p-8 shadow-glow">
            <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-4">
              <div className="h-20 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-20 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-20 bg-slate-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="rounded-[2rem] bg-white/90 p-8 shadow-glow">
            <div className="h-6 w-40 bg-slate-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-4">
              <div className="h-16 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-16 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-16 bg-slate-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-10 rounded-[2rem] bg-white/90 p-9 shadow-glow">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <Badge variant="soft">Welcome back</Badge>
            <div>
              <h1 className="text-4xl font-semibold text-slate-950 sm:text-5xl">Hello, {safeDisplayName}.</h1>
              <p className="mt-3 max-w-xl text-slate-600 leading-7">This is your recovery dashboard. Check in, review progress, and stay prepared for the week ahead.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Button variant="accent" onClick={() => onNavigate('checkins')}>New check-in</Button>
            <Button variant="secondary" onClick={() => onNavigate('milestones')}>View milestones</Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-[2rem] bg-gradient-to-br px-6 py-8 shadow-lg shadow-slate-200/60 hover:scale-[1.01] transition-transform">
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br ${card.color} text-slate-950`}>
                <Icon size={20} />
              </div>
              <p className="mt-6 text-sm uppercase tracking-[0.24em] text-slate-700">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">
                {card.label === 'Daily check-ins' ? data.checkins.length : card.label === 'Recovery focus' ? data.recoveryPlan ? 'Ready' : 'Set up' : card.label === 'Crisis readiness' ? data.crisisPlan ? 'Ready' : 'Plan' : `${data.milestones.length}`}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[2rem] bg-white/90 p-8 shadow-glow">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Latest check-in</h2>
              <p className="mt-2 text-sm text-slate-600">A gentle summary of your most recent mood and energy.</p>
            </div>
            <Badge>{latestCheckin ? latestCheckin.riskLevel || 'Stable' : 'No check-ins yet'}</Badge>
          </div>
          {latestCheckin ? (
            <div className="mt-8 space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Mood</p>
                  <p className="mt-3 text-xl font-semibold text-slate-950">{latestCheckin.mood}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Energy</p>
                  <p className="mt-3 text-xl font-semibold text-slate-950">{latestCheckin.energy}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Stress</p>
                  <p className="mt-3 text-xl font-semibold text-slate-950">{latestCheckin.stress}</p>
                </div>
              </div>
              <div className="rounded-3xl bg-slate-50 p-6">
                <p className="text-sm text-slate-500">Today’s note</p>
                <p className="mt-3 text-slate-700 leading-7">{latestCheckin.notes || 'No notes were added.'}</p>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-3xl border border-slate-200/80 bg-slate-50 p-8 text-slate-700">
              No check-in yet today. Take a moment to reflect on how you're feeling.
            </div>
          )}
        </section>

        <section className="rounded-[2rem] bg-white/90 p-8 shadow-glow">
          <h2 className="text-2xl font-semibold text-slate-950">Progress insights</h2>
          <p className="mt-3 text-sm text-slate-600">Launch a focus area or review your active recovery plan.</p>
          <div className="mt-8 space-y-5">
            <div className="rounded-3xl bg-slate-50 p-5">
              <h3 className="text-base font-semibold text-slate-900">Recovery plan</h3>
              <p className="mt-2 text-sm text-slate-600">{data.recoveryPlan ? 'Ready for action' : 'Create your first recovery plan to get started.'}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <h3 className="text-base font-semibold text-slate-900">Crisis plan</h3>
              <p className="mt-2 text-sm text-slate-600">{data.crisisPlan ? 'Prepared and supported' : 'Build your crisis plan for peace of mind.'}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <h3 className="text-base font-semibold text-slate-900">Milestone streak</h3>
              <p className="mt-2 text-sm text-slate-600">{data.milestones.length} milestone{data.milestones.length === 1 ? '' : 's'} achieved. Celebrate your progress!</p>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={() => onNavigate('recovery-plan')}>Open recovery plan</Button>
            <Button variant="secondary" onClick={() => onNavigate('crisis-plan')}>Open crisis plan</Button>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
