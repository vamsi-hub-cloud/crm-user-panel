import type { LucideIcon } from 'lucide-react';

type Tone = 'brand' | 'emerald' | 'amber' | 'teal' | 'rose' | 'sky' | 'pink' | 'orange';
const tones: Record<Tone, string> = {
  brand: 'from-violet-600 to-fuchsia-500',
  emerald: 'from-emerald-500 to-teal-500',
  amber: 'from-amber-400 to-orange-500',
  teal: 'from-teal-500 to-cyan-500',
  sky: 'from-teal-500 to-cyan-500',
  rose: 'from-rose-500 to-pink-500',
  pink: 'from-fuchsia-500 to-pink-500',
  orange: 'from-orange-500 to-rose-500',
};

export default function StatCard({ title, value, hint, icon: Icon, tone = 'brand' }: { title: string; value: string; hint?: string; icon: LucideIcon; tone?: Tone }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${tones[tone]} p-5 text-white shadow-glow`}>
      <span className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/15" />
      <span className="pointer-events-none absolute -bottom-10 right-8 h-24 w-24 rounded-full bg-white/10" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/85">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
        <span className="rounded-xl bg-white/20 p-2.5 backdrop-blur"><Icon className="h-5 w-5" /></span>
      </div>
      {hint && <p className="relative mt-3 text-xs text-white/85">{hint}</p>}
    </div>
  );
}
