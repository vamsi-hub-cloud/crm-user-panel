import { CheckCircle2, DollarSign, Percent, Trophy } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import { ErrorState, PageSkeleton } from '@/components/ui/States';
import { useCrmData } from '@/hooks/useCrmData';
import { compactCurrency, currency, label } from '@/utils/format';

const COLORS = ['#10b981', '#7c3aed', '#f59e0b', '#f43f5e'];

export default function Reports() {
  const d = useCrmData();
  if (d.loading) return <><PageHeader title="Reports & analytics" /><PageSkeleton /></>;
  if (d.failed) return <ErrorState message={d.error ?? 'Please try again'} onRetry={d.reload} />;

  const won = d.deals.filter((x) => x.stage === 'won');
  const lost = d.deals.filter((x) => x.stage === 'lost');
  const revenue = won.reduce((a, x) => a + x.value, 0);
  const wonLeads = d.leads.filter((l) => l.status === 'won').length;
  const conversion = d.leads.length ? Math.round((wonLeads / d.leads.length) * 100) : 0;
  const doneTasks = d.tasks.filter((t) => t.status === 'done').length;
  const completion = d.tasks.length ? Math.round((doneTasks / d.tasks.length) * 100) : 0;

  const months = Array.from({ length: 6 }, (_, i) => { const dt = new Date(); dt.setMonth(dt.getMonth() - (5 - i)); return { key: `${dt.getFullYear()}-${dt.getMonth()}`, name: dt.toLocaleDateString('en-US', { month: 'short' }), won: 0, lost: 0, leads: 0, converted: 0 }; });
  const at = (iso: string) => { const dt = new Date(iso); return months.find((m) => m.key === `${dt.getFullYear()}-${dt.getMonth()}`); };
  won.forEach((x) => { const m = at(x.closeDate); if (m) m.won += x.value; });
  lost.forEach((x) => { const m = at(x.closeDate); if (m) m.lost += x.value; });
  d.leads.forEach((l) => { const m = at(l.createdAt); if (m) { m.leads += 1; if (l.status === 'won') m.converted += 1; } });
  const rate = months.map((m) => ({ name: m.name, rate: m.leads ? Math.round((m.converted / m.leads) * 100) : 0 }));

  const funnel = ['new', 'contacted', 'qualified', 'proposal', 'won'].map((s) => ({ name: label(s), count: d.leads.filter((l) => l.status === s).length }));
  const taskPie = [
    { name: 'Completed', value: doneTasks },
    { name: 'In progress', value: d.tasks.filter((t) => t.status === 'in_progress').length },
    { name: 'To do', value: d.tasks.filter((t) => t.status === 'todo').length },
  ].filter((t) => t.value > 0);

  return (
    <>
      <PageHeader title="Reports & analytics" subtitle={d.team ? 'Performance across your team.' : 'Your personal performance.'} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Revenue won" value={compactCurrency(revenue)} hint={`${won.length} deals closed`} icon={DollarSign} tone="emerald" />
        <StatCard title="Lead conversion" value={`${conversion}%`} hint={`${wonLeads} of ${d.leads.length} leads won`} icon={Percent} />
        <StatCard title="Completed deals" value={String(won.length)} hint={`Avg. ${won.length ? currency(revenue / won.length) : '$0'}`} icon={Trophy} tone="amber" />
        <StatCard title="Task completion" value={`${completion}%`} hint={`${doneTasks} of ${d.tasks.length} tasks done`} icon={CheckCircle2} tone="sky" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900">Won vs. lost revenue</h2>
          <div className="mt-4 h-64"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={months} margin={{ left: -10 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} /><YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => compactCurrency(v)} /><Tooltip formatter={(v: number) => currency(v)} /><Legend /><Bar dataKey="won" name="Won" fill="#10b981" radius={[4, 4, 0, 0]} /><Bar dataKey="lost" name="Lost" fill="#f43f5e" radius={[4, 4, 0, 0]} /></BarChart>
          </ResponsiveContainer></div>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900">Lead conversion rate</h2>
          <p className="text-sm text-slate-500">Share of each month's new leads that were won</p>
          <div className="mt-4 h-60"><ResponsiveContainer width="100%" height="100%">
            <LineChart data={rate} margin={{ left: -10 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} /><YAxis tickLine={false} axisLine={false} fontSize={12} unit="%" /><Tooltip formatter={(v: number) => `${v}%`} /><Line type="monotone" dataKey="rate" name="Conversion" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 4 }} /></LineChart>
          </ResponsiveContainer></div>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900">Lead funnel</h2>
          <div className="mt-4 h-60"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnel} layout="vertical" margin={{ left: 10 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" /><XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} /><YAxis type="category" dataKey="name" tickLine={false} axisLine={false} fontSize={12} width={80} /><Tooltip /><Bar dataKey="count" name="Leads" fill="#7c3aed" radius={[0, 4, 4, 0]} /></BarChart>
          </ResponsiveContainer></div>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900">Task statistics</h2>
          <div className="mt-2 h-52"><ResponsiveContainer width="100%" height="100%">
            <PieChart><Pie data={taskPie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>{taskPie.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie><Tooltip /><Legend /></PieChart>
          </ResponsiveContainer></div>
          <p className="mt-1 text-center text-xs text-slate-500">{d.tasks.filter((t) => t.status !== 'done' && new Date(t.dueDate) < new Date(new Date().toDateString())).length} overdue tasks</p>
        </div>
      </div>
    </>
  );
}
