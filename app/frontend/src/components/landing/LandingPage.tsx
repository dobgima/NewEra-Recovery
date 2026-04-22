import { motion } from 'framer-motion';
import { HeartPulse, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { landingContent } from './landing.constants';

const features = [
  {
    title: 'Daily check-ins',
    description: 'Track your mood, energy, and support needs with a daily routine.',
    icon: HeartPulse,
    titleColor: 'text-sky-700'
  },
  {
    title: 'Recovery plans',
    description: 'Build meaningful goals, habits, and support practices.',
    icon: Sparkles,
    titleColor: 'blue'
  }
];

type LandingPageProps = {
  onLogin: () => void;
  onRegister: () => void;
};

export function LandingPage({ onLogin, onRegister }: LandingPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 pb-16 lg:gap-16">
      <section className="rounded-[2.5rem] bg-hero px-6 py-16 shadow-glow sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <div className="flex justify-center">
              <img src="/logo.png" alt="New Era Recovery" className="h-20 w-auto brightness-110 contrast-110" />
            </div>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button onClick={onRegister} className="min-w-[160px]">Create account</Button>
              <Button variant="secondary" onClick={onLogin} className="min-w-[160px]">Sign in</Button>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="overflow-hidden rounded-[2rem] bg-white/95 p-8 shadow-2xl shadow-slate-900/10 ring-1 ring-slate-200/60"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="rounded-[1.75rem] border border-slate-200/80 bg-slate-50 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-sky-100 text-sky-600">
                      <Icon size={20} />
                    </div>
                    <h2 className={`mt-5 text-lg font-semibold ${feature.titleColor}`}>{feature.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
        <div className="rounded-[2rem] bg-gradient-to-br from-sky-500/15 to-violet-500/10 p-8 shadow-glow">
          <h3 className="text-2xl font-semibold text-slate-950">{landingContent.sections.stayCentered.title}</h3>
          <ul className="mt-5 space-y-4 text-slate-700">
            {landingContent.sections.stayCentered.bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className={`mt-1 h-2.5 w-2.5 rounded-full ${['bg-sky-500', 'bg-violet-500', 'bg-emerald-500'][idx]}`} />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[2rem] bg-white/95 p-8 shadow-glow">
          <h3 className="text-2xl font-semibold text-slate-950">{landingContent.sections.everythingYouNeed.title}</h3>
          <p className="mt-4 text-slate-600 leading-7">{landingContent.sections.everythingYouNeed.description}</p>
        </div>
      </section>

      <section className="rounded-[2rem] bg-slate-950/95 p-10 text-white shadow-glow">
        <div className="grid gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
          <div className="rounded-[1.75rem] bg-white/10 p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-200">{landingContent.sections.welcomeMessage.label}</p>
            <p className="mt-3 text-lg text-slate-100">{landingContent.sections.welcomeMessage.description}</p>
          </div>
          <div className="rounded-[1.75rem] bg-white/10 p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-200">{landingContent.sections.realDailyRoutines.label}</p>
            <p className="mt-3 text-lg text-slate-100">{landingContent.sections.realDailyRoutines.description}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
