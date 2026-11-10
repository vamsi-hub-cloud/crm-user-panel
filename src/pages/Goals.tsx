import { CheckCircle2, DollarSign, Handshake, Pencil, PhoneCall, Target, Trophy, type LucideIcon } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import Button from '@/components/ui/Button';
import { TextInput } from '@/components/ui/Field';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import { ErrorState, PageSkeleton } from '@/components/ui/States';
import { useAppDispatch } from '@/hooks/redux';
import { useCrmData } from '@/hooks/useCrmData';
import { pushToast } from '@/store/uiSlice';
import { compactCurrency } from '@/utils/format';

const KEY = 'crm_user_v2_goals';
type Targets = Record<'revenue' | 'deals' | 'leads' | 'activities' | 'tasks', number>;
const defaults: Targets = { revenue: 250000, deals: 8, leads: 6, activities: 25, tasks: 15 };
const load = (): Targets => { try { return { ...defaults, ...(JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Targets>) }; } catch { return defaults; } };

export default function Goals() {
  const d = useCrmData();
  const dispatch = useAppDispatch();
  const [targets, setTargets] = useState<Targets>(load);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<keyof Targets, string>>({ revenue: '', deals: '', leads: '', activities: '', tasks: '' });
  const [err, setErr] = useState('');
  if (d.loading) return <PageSkeleton />;
  if (d.failed) return <ErrorState message={d.error ?? 'Please try again'} onRetry={d.reload} />;

  const mult = d.team ? 3 : 1;
  const won = d.deals.filter((x) => x.stage === 'won');
  const actual: Targets = {
    revenue: won.reduce((a, x) => a + x.value, 0),
    deals: won.length,
    leads: d.leads.filter((l) => l.status === 'won').length,
    activities: d.activities.filter((a) => new Date(a.date) <= new Date()).length,
    tasks: d.tasks.filter((t) => t.status === 'done').length,
  };
  const cards: { k: keyof Targets; title: string; icon: LucideIcon; grad: string; money?: boolean }[] = [
    { k: 'revenue', title: 'Revenue won', icon: DollarSign, grad: 'from-violet-600 to-fuchsia-500', money: true },
    { k: 'deals', title: 'Deals closed', icon: Handshake, grad: 'from-orange-500 to-rose-500' },
    { k: 'leads', title: 'Leads converted', icon: Target, grad: 'from-fuchsia-500 to-pink-500' },
    { k: 'activities', title: 'Activities logged', icon: PhoneCall, grad: 'from-teal-500 to-emerald-500' },
    { k: 'tasks', title: 'Tasks completed', icon: CheckCircle2, grad: 'from-amber-400 to-orange-500' },
  ];
  const goal = (k: keyof Targets) => targets[k] * mult;
  const pct = (k: keyof Targets) => Math.min(100, Math.round((actual[k] / goal(k)) * 100));
  const overall = Math.round(cards.reduce((a, c) => a + pct(c.k), 0) / cards.length);
  const fmt = (k: keyof Targets, n: number) => (k === 'revenue' ? compactCurrency(n) : String(n));

  const openEdit = () => { setDraft({ revenue: String(targets.revenue), deals: String(targets.deals), leads: String(targets.leads), activities: String(targets.activities), tasks: String(targets.tasks) }); setErr(''); setEditing(true); };
  const save = (e: FormEvent) => {
    e.preventDefault();
    const next = Object.fromEntries(Object.entries(draft).map(([k, v]) => [k, Number(v)])) as Targets;
    if (Object.values(next).some((n) => !Number.isFinite(n) || n <= 0)) return setErr('Every goal must be a number above 0');
    setTargets(next); localStorage.setItem(KEY, JSON.stringify(next)); setEditing(false); dispatch(pushToast('success', 'Goals updated'));
  };
  const badge = overall >= 80 ? 'On fire' : overall >= 50 ? 'On track' : 'Getting started';

  return (
    <>
      <PageHeader title="Goals" subtitle={d.team ? 'Team targets for this quarter.' : 'Your targets for this quarter.'} actions={<Button variant="secondary" icon={<Pencil className="h-4 w-4" />} onClick={openEdit}>Edit goals</Button>} />
      <section className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 p-6 text-white shadow-glow sm:p-8">
        <span className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/20" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4"><span className="rounded-2xl bg-white/25 p-4"><Trophy className="h-8 w-8" /></span><div><p className="text-sm text-white/85">Overall progress</p><p className="text-4xl font-bold">{overall}%</p></div></div>
          <div className="sm:w-1/2"><div className="h-3 overflow-hidden rounded-full bg-white/30"><div className="h-full rounded-full bg-white" style={{ width: `${overall}%` }} /></div><p className="mt-2 text-sm font-medium">{badge}: keep going!</p></div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ k, title, icon: Icon, grad }) => (
          <div key={k} className="card p-5">
            <div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className={`rounded-xl bg-gradient-to-br ${grad} p-2.5 text-white`}><Icon className="h-5 w-5" /></span><h2 className="font-semibold text-slate-900">{title}</h2></div><span className="text-sm font-bold text-slate-900">{pct(k)}%</span></div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-violet-100"><div className={`h-full rounded-full bg-gradient-to-r ${grad}`} style={{ width: `${pct(k)}%` }} /></div>
            <div className="mt-3 flex justify-between text-sm"><span className="text-slate-500">Achieved <b className="text-slate-900">{fmt(k, actual[k])}</b></span><span className="text-slate-500">Goal <b className="text-slate-900">{fmt(k, goal(k))}</b></span></div>
            <p className="mt-2 text-xs text-slate-500">{actual[k] >= goal(k) ? 'Goal reached. Great work!' : `${fmt(k, goal(k) - actual[k])} to go`}</p>
          </div>
        ))}
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit goals" footer={<><Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button><Button type="submit" form="goal-form">Save goals</Button></>}>
        <form id="goal-form" onSubmit={save} noValidate className="grid gap-4 sm:grid-cols-2">
          <TextInput id="g-rev" label="Revenue (USD)" type="number" value={draft.revenue} onChange={(e) => setDraft({ ...draft, revenue: e.target.value })} />
          <TextInput id="g-deals" label="Deals closed" type="number" value={draft.deals} onChange={(e) => setDraft({ ...draft, deals: e.target.value })} />
          <TextInput id="g-leads" label="Leads converted" type="number" value={draft.leads} onChange={(e) => setDraft({ ...draft, leads: e.target.value })} />
          <TextInput id="g-act" label="Activities logged" type="number" value={draft.activities} onChange={(e) => setDraft({ ...draft, activities: e.target.value })} />
          <TextInput id="g-tasks" label="Tasks completed" type="number" value={draft.tasks} onChange={(e) => setDraft({ ...draft, tasks: e.target.value })} />
          {err && <p role="alert" className="text-sm text-rose-600 sm:col-span-2">{err}</p>}
        </form>
      </Modal>
    </>
  );
}
