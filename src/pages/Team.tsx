import { Crown, Medal } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Avatar from '@/components/ui/Avatar';
import PageHeader from '@/components/ui/PageHeader';
import { ErrorState, PageSkeleton } from '@/components/ui/States';
import { useCrmData } from '@/hooks/useCrmData';
import { salesTeam } from '@/data/mock';
import { compactCurrency, currency } from '@/utils/format';

const COLORS = ['#7c3aed', '#d946ef', '#f97316', '#14b8a6', '#f59e0b'];
const podium = ['from-amber-300 to-orange-400', 'from-slate-300 to-slate-400', 'from-orange-300 to-rose-400'];

export default function Team() {
  const d = useCrmData();
  if (d.loading) return <PageSkeleton />;
  if (d.failed) return <ErrorState message={d.error ?? 'Please try again'} onRetry={d.reload} />;

  const rows = salesTeam.map((m) => {
    const deals = d.deals.filter((x) => x.ownerId === m.id);
    const won = deals.filter((x) => x.stage === 'won'); const lost = deals.filter((x) => x.stage === 'lost');
    const revenue = won.reduce((a, x) => a + x.value, 0);
    return { ...m, revenue, won: won.length, open: deals.filter((x) => !['won', 'lost'].includes(x.stage)).reduce((a, x) => a + x.value, 0), winRate: won.length + lost.length ? Math.round((won.length / (won.length + lost.length)) * 100) : 0, progress: Math.min(100, Math.round((revenue / m.target) * 100)), leads: d.leads.filter((l) => l.ownerId === m.id).length };
  }).sort((a, b) => b.revenue - a.revenue);
  const total = rows.reduce((a, r) => a + r.revenue, 0);

  return (
    <>
      <PageHeader title="Team leaderboard" subtitle={`${rows.length} sellers · ${compactCurrency(total)} won this period`} />
      <div className="grid gap-4 md:grid-cols-3">
        {rows.slice(0, 3).map((r, i) => (
          <div key={r.id} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${podium[i]} p-5 text-white shadow-glow`}>
            <span className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/20" />
            <div className="relative flex items-center justify-between"><span className="flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-xs font-semibold">{i === 0 ? <Crown className="h-3.5 w-3.5" /> : <Medal className="h-3.5 w-3.5" />} #{i + 1}</span><span className="text-2xl font-bold">{compactCurrency(r.revenue)}</span></div>
            <div className="relative mt-4 flex items-center gap-3"><Avatar name={r.name} size={48} /><div><p className="font-semibold">{r.name}</p><p className="text-sm text-white/85">{r.title}</p></div></div>
            <p className="relative mt-4 text-sm text-white/90">{r.won} deals won · {r.winRate}% win rate</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-5">
        <div className="card p-5 xl:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">Revenue by seller</h2>
          <div className="mt-3 h-72"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} layout="vertical" margin={{ left: 10 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ede9fe" /><XAxis type="number" tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => compactCurrency(v)} /><YAxis type="category" dataKey="name" tickLine={false} axisLine={false} fontSize={12} width={95} /><Tooltip formatter={(v: number) => currency(v)} /><Bar dataKey="revenue" name="Won" radius={[0, 8, 8, 0]}>{rows.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar></BarChart>
          </ResponsiveContainer></div>
        </div>
        <div className="card overflow-hidden xl:col-span-3">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="border-b border-violet-100 bg-violet-50"><tr><th className="th">Rank</th><th className="th">Seller</th><th className="th">Won</th><th className="th">Open pipeline</th><th className="th">Win rate</th><th className="th">Target</th></tr></thead>
              <tbody className="divide-y divide-violet-50">
                {rows.map((r, i) => (
                  <tr key={r.id}>
                    <td className="td font-bold text-brand-700">#{i + 1}</td>
                    <td className="td"><div className="flex items-center gap-3"><Avatar name={r.name} size={34} /><div><p className="font-medium text-slate-900">{r.name}</p><p className="text-xs text-slate-500">{r.leads} leads</p></div></div></td>
                    <td className="td font-semibold">{currency(r.revenue)}<span className="block text-xs font-normal text-slate-500">{r.won} deals</span></td>
                    <td className="td">{currency(r.open)}</td>
                    <td className="td">{r.winRate}%</td>
                    <td className="td w-40"><div className="h-2 overflow-hidden rounded-full bg-violet-100"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-400" style={{ width: `${r.progress}%` }} /></div><p className="mt-1 text-xs text-slate-500">{r.progress}% of {compactCurrency(r.target)}</p></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
