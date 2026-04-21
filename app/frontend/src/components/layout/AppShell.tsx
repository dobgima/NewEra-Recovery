import type { ComponentType } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  HeartPulse,
  Home,
  MapPin,
  ShieldAlert,
  Sparkles,
  Users,
  User
} from 'lucide-react';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import { CheckinsPage } from '@/components/checkins/CheckinsPage';
import { RecoveryPlanPage } from '@/components/recovery-plan/RecoveryPlanPage';
import { CrisisPlanPage } from '@/components/crisis-plan/CrisisPlanPage';
import { MilestonesPage } from '@/components/milestones/MilestonesPage';
import { ResourcesPage } from '@/components/resources/ResourcesPage';
import { PeerSupportPage } from '@/components/peer-support/PeerSupportPage';
import { TreatmentPage } from '@/components/treatment/TreatmentPage';
import { ProfilePage } from '@/components/profile/ProfilePage';
import { SupportContactsPage } from '@/components/support-contacts/SupportContactsPage';
import type { AuthState } from '@/types/auth';
import type { Screen } from '@/types/screen';
import type { CheckinRecord } from '@/types/checkin';
import type { RecoveryPlan } from '@/types/recovery-plan';
import type { CrisisPlan } from '@/types/crisis-plan';
import type { Milestone } from '@/types/milestone';

const navItems: Array<{ id: Screen; label: string; subtitle: string; icon: ComponentType<{ size: number }> }> = [
  { id: 'dashboard', label: 'Dashboard', subtitle: 'Your home', icon: Home },
  { id: 'checkins', label: 'Check-ins', subtitle: 'Daily pulse', icon: HeartPulse },
  { id: 'recovery-plan', label: 'Recovery', subtitle: 'Your plan', icon: BookOpen },
  { id: 'crisis-plan', label: 'Crisis plan', subtitle: 'Emergency support', icon: ShieldAlert },
  { id: 'milestones', label: 'Milestones', subtitle: 'Progress', icon: Sparkles },
  { id: 'resources', label: 'Resources', subtitle: 'Helpful content', icon: BookOpen },
  { id: 'peer-support', label: 'Peer support', subtitle: 'Trusted community', icon: Users },
  { id: 'treatment', label: 'Treatment', subtitle: 'Find care', icon: MapPin },
  { id: 'profile', label: 'Profile', subtitle: 'Your settings', icon: User },
  { id: 'support-contacts', label: 'Support contacts', subtitle: 'Trusted people', icon: Users },
];

type AppShellProps = {
  auth: AuthState;
  current: Screen;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  loadingData: boolean;
  data: {
    checkins: CheckinRecord[];
    recoveryPlan: RecoveryPlan | null;
    crisisPlan: CrisisPlan | null;
    milestones: Milestone[];
    submitCheckin: (payload: Partial<CheckinRecord>) => Promise<{ checkin: CheckinRecord } | null>;
    submitRecoveryPlan: (payload: RecoveryPlan) => Promise<RecoveryPlan | null>;
    submitCrisisPlan: (payload: CrisisPlan) => Promise<CrisisPlan | null>;
    createNewMilestone: (payload: Omit<Milestone, 'id' | 'achievedAt'>) => Promise<Milestone | null>;
    refresh: () => Promise<void>;
  };
};

export function AppShell({ auth, current, onNavigate, onLogout, loadingData, data }: AppShellProps) {
  const displayName = auth.user.profile?.displayName || `${auth.user.profile?.firstName ?? 'Recovery'} ${auth.user.profile?.lastName ?? ''}`.trim();

  return (
    <div className="min-h-screen bg-slate-100 py-6">
      <div className="mx-auto grid w-full max-w-[1600px] gap-6 px-4 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="rounded-[2.5rem] border border-slate-200/80 bg-white/95 p-6 shadow-glow">
          <div className="space-y-6">
            <div className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-lg shadow-slate-950/15">
              <img src="/logo.png" alt="New Era Recovery" className="h-full w-full rounded-3xl bg-white object-cover" />
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = item.id === current;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`group flex w-full items-start gap-4 rounded-3xl border px-4 py-4 text-left transition ${
                      active ? 'border-slate-900/10 bg-slate-950 text-white shadow-lg shadow-slate-950/10' : 'border-transparent bg-slate-50 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`mt-1 inline-flex h-11 w-11 items-center justify-center rounded-3xl ${active ? 'bg-slate-800 text-sky-200' : 'bg-slate-100 text-slate-500'}`}>
                      <Icon size={20} />
                    </span>
                    <div>
                      <div className="font-semibold">{item.label}</div>
                      <p className="mt-1 text-sm text-slate-500">{item.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </nav>
            <div className="rounded-[2rem] border border-slate-200/80 bg-slate-50 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-950 text-white">{displayName?.charAt(0).toUpperCase() ?? 'R'}</div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">{displayName || auth.user.email}</p>
                  <p className="text-sm text-slate-500">Member</p>
                </div>
              </div>
              <button onClick={onLogout} className="mt-6 inline-flex w-full items-center justify-center rounded-3xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <main className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-glow">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{current.replace('-', ' ')}</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-950">Explore your recovery tools.</h1>
              </div>
              <div className="inline-flex items-center gap-3 rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-600 shadow-inner">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_8px_rgba(16,185,129,0.08)]"></span>
                {loadingData ? 'Refreshing your latest progress…' : 'All systems ready'}
              </div>
            </div>
          </motion.div>

          <div className="rounded-[2rem] bg-white/95 p-0 shadow-glow">
            {current === 'dashboard' && (
              <DashboardPage user={auth.user} data={data} onNavigate={onNavigate} loading={loadingData} />
            )}
            {current === 'checkins' && <CheckinsPage data={data} onNavigate={onNavigate} loading={loadingData} />}
            {current === 'recovery-plan' && <RecoveryPlanPage plan={data.recoveryPlan} onSave={data.submitRecoveryPlan} onNavigate={onNavigate} />}
            {current === 'crisis-plan' && <CrisisPlanPage plan={data.crisisPlan} onSave={data.submitCrisisPlan} onNavigate={onNavigate} />}
            {current === 'milestones' && <MilestonesPage milestones={data.milestones} createNewMilestone={data.createNewMilestone} onNavigate={onNavigate} loading={loadingData} />}
            {current === 'resources' && <ResourcesPage onNavigate={onNavigate} />}
            {current === 'peer-support' && <PeerSupportPage onNavigate={onNavigate} />}
            {current === 'treatment' && <TreatmentPage onNavigate={onNavigate} />}
            {current === 'profile' && <ProfilePage user={auth.user} onUpdate={data.refresh} />}
            {current === 'support-contacts' && <SupportContactsPage />}
          </div>
        </main>
      </div>
    </div>
  );
}
