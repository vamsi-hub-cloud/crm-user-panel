import { ArrowLeft, CalendarCheck, Mail, MapPin, MessageSquare, Phone, Users } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { label, currency, dateTime, shortDate } from '@/utils/format';
import type { Activity, Customer, Deal } from '@/types';

export const activityIcon = { call: Phone, meeting: Users, email: Mail, interaction: MessageSquare, follow_up: CalendarCheck };

export default function CustomerProfile({ customer: c, deals, activities, onBack }: { customer: Customer; deals: Deal[]; activities: Activity[]; onBack: () => void }) {
  const history = [...activities].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  return (
    <>
      <button onClick={onBack} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> All customers</button>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card h-fit p-6">
          <div className="flex flex-col items-center text-center">
            <Avatar name={c.name} size={72} />
            <h1 className="mt-3 text-lg font-semibold text-slate-900">{c.name}</h1>
            <p className="text-sm text-slate-500">{c.company}</p>
            <div className="mt-2"><Badge value={c.status} /></div>
          </div>
          <dl className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
            <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-slate-400" /><a href={`mailto:${c.email}`} className="truncate text-slate-700 hover:text-brand-600">{c.email}</a></div>
            <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-slate-400" /><a href={`tel:${c.phone}`} className="text-slate-700 hover:text-brand-600">{c.phone}</a></div>
            <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-slate-400" /><span className="text-slate-700">{c.location}</span></div>
            <div className="flex items-center gap-3"><CalendarCheck className="h-4 w-4 text-slate-400" /><span className="text-slate-700">Customer since {shortDate(c.since)}</span></div>
          </dl>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="card p-5">
            <h2 className="font-semibold text-slate-900">Related deals</h2>
            {deals.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">No deals with this customer yet.</p> : (
              <ul className="mt-3 divide-y divide-slate-100">
                {deals.map((x) => (
                  <li key={x.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-900">{x.title}</p><p className="text-xs text-slate-500">Close {shortDate(x.closeDate)}</p></div>
                    <div className="flex items-center gap-3"><span className="text-sm font-semibold text-slate-900">{currency(x.value)}</span><Badge value={x.stage === 'won' ? 'won' : x.stage === 'lost' ? 'lost' : 'proposal'} text={label(x.stage)} /></div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="card p-5">
            <h2 className="font-semibold text-slate-900">Interaction history</h2>
            {history.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">No interactions recorded yet. Log a call or meeting from Activities.</p> : (
              <ol className="mt-4 space-y-5 border-l border-slate-200 pl-5">
                {history.map((a) => {
                  const I = activityIcon[a.type];
                  return (
                    <li key={a.id} className="relative">
                      <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-brand-600 ring-4 ring-white"><I className="h-3.5 w-3.5" /></span>
                      <p className="text-sm font-medium text-slate-900">{a.subject}</p>
                      <p className="text-xs text-slate-500">{label(a.type)} · {dateTime(a.date)}{a.duration ? ` · ${a.duration} min` : ''}</p>
                      {a.notes && <p className="mt-1 text-sm text-slate-600">{a.notes}</p>}
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
