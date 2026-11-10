import { Mail, MapPin, Phone } from 'lucide-react';
import { useMemo, useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import PageHeader from '@/components/ui/PageHeader';
import SearchBox from '@/components/ui/SearchBox';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States';
import { useCrmData } from '@/hooks/useCrmData';
import { currency } from '@/utils/format';
import CustomerProfile from './CustomerProfile';

export default function Customers() {
  const d = useCrmData();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useMemo(() => d.customers.filter((c) => (filter === 'all' || c.status === filter) && `${c.name} ${c.company} ${c.email}`.toLowerCase().includes(q.toLowerCase())), [d.customers, q, filter]);
  const selected = d.customers.find((c) => c.id === openId);

  if (selected) return <CustomerProfile customer={selected} deals={d.deals.filter((x) => x.customerId === selected.id)} activities={d.activities.filter((a) => a.customerId === selected.id)} onBack={() => setOpenId(null)} />;

  return (
    <>
      <PageHeader title="Customers" subtitle="Profiles, contact details, history and related deals." />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBox value={q} onChange={setQ} placeholder="Search customers" />
        <div className="flex gap-1.5">{(['all', 'active', 'inactive'] as const).map((s) => <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${filter === s ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}>{s}</button>)}</div>
      </div>
      {d.loading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-44" />)}</div>
        : d.failed ? <ErrorState message={d.error ?? 'Please try again'} onRetry={d.reload} />
        : list.length === 0 ? <div className="card"><EmptyState title="No customers found" text="Try a different search or filter." /></div>
        : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((c) => {
              const value = d.deals.filter((x) => x.customerId === c.id && x.stage === 'won').reduce((a, x) => a + x.value, 0);
              return (
                <button key={c.id} onClick={() => setOpenId(c.id)} className="card p-5 text-left transition hover:border-brand-300 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3"><Avatar name={c.name} size={44} /><div className="min-w-0"><p className="truncate font-medium text-slate-900">{c.name}</p><p className="truncate text-sm text-slate-500">{c.company}</p></div></div>
                    <Badge value={c.status} />
                  </div>
                  <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
                    <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /><span className="truncate">{c.email}</span></li>
                    <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" />{c.phone}</li>
                    <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" />{c.location}</li>
                  </ul>
                  <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">Lifetime won value <span className="font-semibold text-slate-800">{currency(value)}</span></p>
                </button>
              );
            })}
          </div>
        )}
    </>
  );
}
