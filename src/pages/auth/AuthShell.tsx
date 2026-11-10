import { BarChart3, Rocket, ShieldCheck, Sparkles, TrendingUp, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import Logo from '@/components/ui/Logo';

export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#2e1065] via-fuchsia-700 to-orange-500 p-12 text-white lg:flex">
        <span className="animate-float pointer-events-none absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-fuchsia-400/30 blur-3xl" />
        <span className="animate-float pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-amber-300/30 blur-3xl" />
        <span className="pointer-events-none absolute right-10 top-10 h-40 w-40 rounded-full border border-white/20" />
        <span className="pointer-events-none absolute right-20 top-20 h-20 w-20 rounded-full border border-white/20" />
        <div className="relative"><Logo light size={48} /></div>
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur"><Sparkles className="h-3.5 w-3.5" /> Built for sales teams</span>
          <h2 className="mt-4 max-w-lg text-4xl font-bold leading-tight">Close more deals with a workspace you'll love using.</h2>
          <p className="mt-3 max-w-md text-white/80">Leads, pipeline, customers, tasks and goals, all in one colorful place.</p>
          <ul className="mt-8 grid max-w-lg gap-3 text-sm sm:grid-cols-2">
            {[{ i: TrendingUp, t: 'Live sales performance' }, { i: Users, t: 'Full customer history' }, { i: Rocket, t: 'Kanban deal pipeline' }, { i: ShieldCheck, t: 'Role-based access' }].map(({ i: I, t }) => (
              <li key={t} className="flex items-center gap-3 rounded-2xl bg-white/15 p-3 backdrop-blur"><span className="rounded-xl bg-white/20 p-2"><I className="h-4 w-4" /></span>{t}</li>
            ))}
          </ul>
        </div>
        <p className="relative flex items-center gap-2 text-xs text-white/70"><BarChart3 className="h-4 w-4" /> © {new Date().getFullYear()} Nexora CRM · Enterprise CRM Platform</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-3xl bg-white/80 p-7 shadow-card ring-1 ring-violet-100 backdrop-blur sm:p-8">
          <div className="mb-6 lg:hidden"><Logo /></div>
          <h1 className="gradient-text text-3xl font-bold">{title}</h1>
          <p className="mb-6 mt-1.5 text-sm text-slate-600">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
