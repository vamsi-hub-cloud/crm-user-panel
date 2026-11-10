import { CalendarDays, CheckSquare, DollarSign, Flame, Handshake, Plus, Target, TrendingUp, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import StatCard from '@/components/ui/StatCard';
import { ErrorState, PageSkeleton } from '@/components/ui/States';
import { useCrmData } from '@/hooks/useCrmData';
import { compactCurrency, currency, dateTime, isOverdue, isToday, label, shortDate, timeAgo } from '@/utils/format';
import { activityIcon } from './customers/CustomerProfile';

const PIE = ['#14b8a6', '#f59e0b', '#8b5cf6', '#d946ef', '#10b981', '#f43f5e'];
const STAGES: { id: string; name: string; color: string }[] = [
  { id: 'prospecting', name: 'Prospecting', color: '#14b8a6' },
  { id: 'qualification', name: 'Qualification', color: '#8b5cf6' },
  { id: 'proposal', name: 'Proposal', color: '#d946ef' },
  { id: 'negotiation', name: 'Negotiation', color: '#f97316' },
];

export default function Dashboard() {
  const d = useCrmData();
  if (d.loading) return <PageSkeleton />;
  if (d.failed) return <ErrorState message={d.error ?? 'Please try again'} onRetry={d.reload} />;

  const openLeads = d.leads.filter((l) => l.status !== 'won' && l.status !== 'lost');
  const activeCustomers = d.customers.filter((c) => c.status === 'active');
  const openDeals = d.deals.filter((x) => !['won', 'lost'].includes(x.stage));
  const pendingTasks = d.tasks.filter((t) => t.status !== 'done');
  const won = d.deals.filter((x) => x.stage === 'won');
  const lost = d.deals.filter((x) => x.stage === 'lost');
  const wonValue = won.reduce((a, x) => a + x.value, 0);
  const pipelineValue = openDeals.reduce((a, x) => a + x.value, 0);
  const winRate = won.length + lost.length ? Math.round((won.length / (won.length + lost.length)) * 100) : 0;
  const target = d.team ? 750000 : 250000;
  const progress = Math.min(100, Math.round((wonValue / target) * 100));
  const todayTasks = pendingTasks.filter((t) => isToday(t.dueDate)).length;
  const overdue = pendingTasks.filter((t) => isOverdue(t.dueDate) && !isToday(t.dueDate)).length;

  const months = Array.from({ length: 6 }, (_, i) => {
    const dt = new Date(); dt.setMonth(dt.getMonth() - (5 - i));
    return { key: `${dt.getFullYear()}-${dt.getMonth()}`, name: dt.toLocaleDateString('en-US', { month: 'short' }), revenue: 0 };
  });
  won.forEach((x) => { const dt = new Date(x.closeDate); const m = months.find((mm) => mm.key === `${dt.getFullYear()}-${dt.getMonth()}`); if (m) m.revenue += x.value; });

  const statusData = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'].map((s) => ({ name: label(s), value: d.leads.filter((l) => l.status === s).length })).filter((s) => s.value > 0);
  const stageData = STAGES.map((s) => ({ ...s, value: d.deals.filter((x) => x.stage === s.id).reduce((a, x) => a + x.value, 0), count: d.deals.filter((x) => x.stage === s.id).length }));
  const dueSoon = [...pendingTasks].sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate)).slice(0, 5);
  const followUps = d.leads.flatMap((l) => l.followUps.filter((f) => !f.done).map((f) => ({ ...f, lead: l.name }))).sort((a, b) => +new Date(a.date) - +new Date(b.date)).slice(0, 4);
  const upcoming = d.activities.filter((a) => new Date(a.date) > new Date()).sort((a, b) => +new Date(a.date) - +new Date(b.date)).slice(0, 4);
  const recent = d.activities.filter((a) => new Date(a.date) <= new Date()).sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 5);
  const topCustomers = d.customers.map((c) => ({ c, value: d.deals.filter((x) => x.customerId === c.id && x.stage === 'won').reduce((a, x) => a + x.value, 0) })).sort((a, b) => b.value - a.value).slice(0, 5);
  const hot = [...openDeals].sort((a, b) => b.probability - a.probability || b.value - a.value).slice(0, 4);
  const cname = (id: string) => d.customers.find((c) => c.id === id)?.company ?? 'Unknown customer';

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-700 via-fuchsia-600 to-orange-500 p-6 text-white shadow-glow sm:p-8">
        <span className="animate-float pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/15" />
        <span className="pointer-events-none absolute bottom-0 right-40 h-32 w-32 rounded-full bg-amber-300/25 blur-xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Welcome back, {d.user.name.split(' ')[0]}!</h1>
            <p className="mt-2 max-w-xl text-white/85">{d.team ? 'Your whole team at a glance.' : `You have ${todayTasks} task${todayTasks === 1 ? '' : 's'} due today${overdue ? ` and ${overdue} overdue` : ''}.`} You're at {progress}% of your quarterly target.</p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link to="/leads?new=1" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-fuchsia-700 shadow hover:bg-fuchsia-50"><Plus className="h-4 w-4" /> Add lead</Link>
              <Link to="/tasks?new=1" className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/30"><CheckSquare className="h-4 w-4" /> New task</Link>
              <Link to="/activities?new=1" className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/30"><Zap className="h-4 w-4" /> Log activity</Link>
              <Link to="/calendar" className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/30"><CalendarDays className="h-4 w-4" /> Calendar</Link>
            </div>
          </div>
          <div className="grid shrink-0 grid-cols-3 gap-3 text-center">
            {[{ v: compactCurrency(wonValue), l: 'Revenue won' }, { v: `${winRate}%`, l: 'Win rate' }, { v: compactCurrency(pipelineValue), l: 'Open pipeline' }].map((s) => (
              <div key={s.l} className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur"><p className="text-xl font-bold">{s.v}</p><p className="text-xs text-white/80">{s.l}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard title="Assigned leads" value={String(openLeads.length)} hint={`${d.leads.filter((l) => l.status === 'new').length} new`} icon={Target} tone="pink" />
        <StatCard title="Active customers" value={String(activeCustomers.length)} hint={`${d.customers.length} total accounts`} icon={Users} tone="emerald" />
        <StatCard title="Ongoing deals" value={String(openDeals.length)} hint={`${compactCurrency(pipelineValue)} in pipeline`} icon={Handshake} tone="brand" />
        <StatCard title="Pending tasks" value={String(pendingTasks.length)} hint={`${overdue} overdue`} icon={CheckSquare} tone="amber" />
        <StatCard title="Revenue won" value={compactCurrency(wonValue)} hint={`${won.length} deals closed`} icon={DollarSign} tone="teal" />
        <StatCard title="Win rate" value={`${winRate}%`} hint={`${won.length} won · ${lost.length} lost`} icon={TrendingUp} tone="orange" />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div><h2 className="text-lg font-semibold text-slate-900">Revenue won</h2><p className="text-sm text-slate-500">Closed-won deals, last 6 months</p></div>
            <p className="gradient-text text-2xl font-bold">{currency(wonValue)}</p>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={months} margin={{ left: -10, right: 8 }}>
                <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d946ef" stopOpacity={0.45} /><stop offset="100%" stopColor="#f97316" stopOpacity={0.02} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ede9fe" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => compactCurrency(v)} />
                <Tooltip formatter={(v: number) => currency(v)} />
                <Area type="monotone" dataKey="revenue" stroke="#c026d3" strokeWidth={3} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card relative overflow-hidden p-5">
          <span className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br from-amber-200 to-orange-200 opacity-60" />
          <h2 className="relative text-lg font-semibold text-slate-900">Quarterly target</h2>
          <p className="relative text-sm text-slate-500">{d.team ? 'Team goal' : 'Your goal'} · {compactCurrency(target)}</p>
          <div className="relative mx-auto mt-4 h-44 w-44">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <defs><linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7c3aed" /><stop offset="1" stopColor="#f97316" /></linearGradient></defs>
              <circle cx="60" cy="60" r="50" fill="none" stroke="#ede9fe" strokeWidth="12" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="url(#ring)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(progress / 100) * 314} 314`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center"><p className="text-3xl font-bold text-slate-900">{progress}%</p><p className="text-xs text-slate-500">{compactCurrency(wonValue)} won</p></div>
          </div>
          <dl className="relative mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Remaining</dt><dd className="font-semibold text-slate-900">{compactCurrency(Math.max(0, target - wonValue))}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Avg. deal size</dt><dd className="font-semibold text-slate-900">{won.length ? currency(wonValue / won.length) : '$0'}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Weighted forecast</dt><dd className="font-semibold text-slate-900">{compactCurrency(openDeals.reduce((a, x) => a + (x.value * x.probability) / 100, 0))}</dd></div>
          </dl>
          <Link to="/goals" className="relative mt-4 block rounded-xl bg-gradient-to-r from-brand-600 to-fuchsia-600 py-2 text-center text-sm font-semibold text-white">View all goals</Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5">
          <h2 className="text-lg font-semibold text-slate-900">Lead status</h2>
          <div className="h-52"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={82} paddingAngle={4}>{statusData.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
          <ul className="mt-2 grid grid-cols-2 gap-1.5 text-xs text-slate-600">{statusData.map((s, i) => <li key={s.name} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE[i % PIE.length] }} />{s.name} ({s.value})</li>)}</ul>
        </div>
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">Pipeline by stage</h2>
          <p className="text-sm text-slate-500">Open deal value in each stage</p>
          <div className="mt-3 h-60"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={stageData} margin={{ left: -10 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ede9fe" /><XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} /><YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => compactCurrency(v)} /><Tooltip formatter={(v: number) => currency(v)} /><Bar dataKey="value" name="Value" radius={[10, 10, 0, 0]}>{stageData.map((s) => <Cell key={s.id} fill={s.color} />)}</Bar></BarChart>
          </ResponsiveContainer></div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Tasks due soon" to="/tasks" accent="from-amber-400 to-orange-500">
          {dueSoon.length === 0 && <Empty text="You're all caught up." />}
          {dueSoon.map((t) => (
            <li key={t.id} className="flex items-start justify-between gap-3 py-3">
              <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-900">{t.title}</p><p className={`text-xs ${isOverdue(t.dueDate) && !isToday(t.dueDate) ? 'text-rose-600' : 'text-slate-500'}`}>{isToday(t.dueDate) ? 'Due today' : isOverdue(t.dueDate) ? `Overdue · ${shortDate(t.dueDate)}` : `Due ${shortDate(t.dueDate)}`}</p></div>
              <Badge value={t.priority} />
            </li>
          ))}
        </Panel>
        <Panel title="Upcoming meetings & calls" to="/calendar" accent="from-teal-400 to-emerald-500">
          {upcoming.length === 0 && <Empty text="Nothing scheduled. Add an event from the calendar." />}
          {upcoming.map((a) => { const I = activityIcon[a.type]; return (
            <li key={a.id} className="flex items-center gap-3 py-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600"><I className="h-4 w-4" /></span><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-900">{a.subject}</p><p className="text-xs text-slate-500">{cname(a.customerId)} · {dateTime(a.date)}</p></div></li>
          ); })}
        </Panel>
        <Panel title="Upcoming follow-ups" to="/leads" accent="from-fuchsia-500 to-pink-500">
          {followUps.length === 0 && <Empty text="No follow-ups scheduled." />}
          {followUps.map((f) => (
            <li key={f.id} className="py-3"><p className="text-sm font-medium text-slate-900">{f.note}</p><p className={`text-xs ${isOverdue(f.date) && !isToday(f.date) ? 'text-rose-600' : 'text-slate-500'}`}>{f.lead} · {isOverdue(f.date) && !isToday(f.date) ? 'Overdue' : shortDate(f.date)}</p></li>
          ))}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Hot deals" to="/pipeline" accent="from-rose-500 to-orange-500" icon={<Flame className="h-4 w-4 text-white" />}>
          {hot.length === 0 && <Empty text="No open deals." />}
          {hot.map((x) => (
            <li key={x.id} className="py-3"><div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-medium text-slate-900">{x.title}</p><span className="text-sm font-semibold text-slate-900">{compactCurrency(x.value)}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-violet-100"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-orange-400" style={{ width: `${x.probability}%` }} /></div><p className="mt-1 text-xs text-slate-500">{cname(x.customerId)} · {x.probability}% likely</p></li>
          ))}
        </Panel>
        <Panel title="Top customers" to="/customers" accent="from-emerald-400 to-teal-500">
          {topCustomers.map(({ c, value }) => (
            <li key={c.id} className="flex items-center gap-3 py-3"><Avatar name={c.name} size={36} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-900">{c.company}</p><p className="text-xs text-slate-500">{c.name}</p></div><span className="text-sm font-semibold text-emerald-600">{compactCurrency(value)}</span></li>
          ))}
        </Panel>
        <Panel title="Recent activity" to="/activities" accent="from-violet-500 to-fuchsia-500">
          {recent.length === 0 && <Empty text="No activity logged yet." />}
          {recent.map((a) => { const I = activityIcon[a.type]; return (
            <li key={a.id} className="flex items-center gap-3 py-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><I className="h-4 w-4" /></span><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-900">{a.subject}</p><p className="text-xs text-slate-500">{cname(a.customerId)} · {timeAgo(a.date)}</p></div></li>
          ); })}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, to, accent, icon, children }: { title: string; to: string; accent: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card overflow-hidden">
      <div className={`flex items-center justify-between bg-gradient-to-r ${accent} px-5 py-3 text-white`}>
        <h2 className="flex items-center gap-2 font-semibold">{icon}{title}</h2>
        <Link to={to} className="text-xs font-semibold text-white/90 underline-offset-2 hover:underline">View all</Link>
      </div>
      <ul className="divide-y divide-violet-50 px-5">{children}</ul>
    </div>
  );
}
const Empty = ({ text }: { text: string }) => <li className="py-8 text-center text-sm text-slate-500">{text}</li>;
