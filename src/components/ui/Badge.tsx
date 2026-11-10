import { label } from '@/utils/format';

const tones: Record<string, string> = {
  new: 'bg-teal-50 text-teal-700 ring-teal-200',
  contacted: 'bg-amber-50 text-amber-700 ring-amber-200',
  qualified: 'bg-violet-50 text-violet-700 ring-violet-200',
  proposal: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200',
  won: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  lost: 'bg-rose-50 text-rose-700 ring-rose-200',
  low: 'bg-slate-100 text-slate-600 ring-slate-200',
  medium: 'bg-amber-50 text-amber-700 ring-amber-200',
  high: 'bg-rose-50 text-rose-700 ring-rose-200',
  todo: 'bg-slate-100 text-slate-600 ring-slate-200',
  in_progress: 'bg-teal-50 text-teal-700 ring-teal-200',
  done: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  inactive: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export default function Badge({ value, text }: { value: string; text?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[value] ?? tones.todo}`}>
      {text ?? label(value)}
    </span>
  );
}
