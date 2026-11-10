import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import Button from '@/components/ui/Button';
import { SelectInput, TextInput } from '@/components/ui/Field';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import { ErrorState, PageSkeleton } from '@/components/ui/States';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useCrmData } from '@/hooks/useCrmData';
import { activities as activityEntity } from '@/store/entities';
import { pushToast } from '@/store/uiSlice';
import { dateTime, label } from '@/utils/format';
import { clean, required, type Errors } from '@/utils/validation';

type Kind = 'task' | 'followup' | 'call' | 'meeting' | 'email' | 'other';
interface Ev { id: string; kind: Kind; title: string; sub: string; date: Date }

const kinds: Record<Kind, { name: string; dot: string; chip: string }> = {
  task: { name: 'Task due', dot: 'bg-amber-500', chip: 'bg-amber-100 text-amber-800' },
  followup: { name: 'Follow-up', dot: 'bg-pink-500', chip: 'bg-pink-100 text-pink-800' },
  call: { name: 'Call', dot: 'bg-teal-500', chip: 'bg-teal-100 text-teal-800' },
  meeting: { name: 'Meeting', dot: 'bg-violet-500', chip: 'bg-violet-100 text-violet-800' },
  email: { name: 'Email', dot: 'bg-orange-500', chip: 'bg-orange-100 text-orange-800' },
  other: { name: 'Other', dot: 'bg-emerald-500', chip: 'bg-emerald-100 text-emerald-800' },
};
const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const nowLocal = () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };

export default function Calendar() {
  const d = useCrmData();
  const dispatch = useAppDispatch();
  const saving = useAppSelector((s) => s.activities.saving);
  const [cursor, setCursor] = useState(() => { const t = new Date(); t.setDate(1); return t; });
  const [selected, setSelected] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ type: 'meeting', subject: '', customerId: '', date: nowLocal() });
  const [errors, setErrors] = useState<Errors<typeof f>>({});

  const cname = (id: string) => d.customers.find((c) => c.id === id)?.company ?? 'Customer';
  const events = useMemo<Ev[]>(() => [
    ...d.tasks.filter((t) => t.status !== 'done').map((t): Ev => ({ id: t.id, kind: 'task', title: t.title, sub: `${label(t.priority)} priority`, date: new Date(t.dueDate) })),
    ...d.leads.flatMap((l) => l.followUps.filter((x) => !x.done).map((x): Ev => ({ id: x.id, kind: 'followup', title: x.note, sub: l.name, date: new Date(x.date) }))),
    ...d.activities.map((a): Ev => ({ id: a.id, kind: (['call', 'meeting', 'email'].includes(a.type) ? a.type : 'other') as Kind, title: a.subject, sub: cname(a.customerId), date: new Date(a.date) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [d.tasks, d.leads, d.activities, d.customers]);

  if (d.loading) return <PageSkeleton />;
  if (d.failed) return <ErrorState message={d.error ?? 'Please try again'} onRetry={d.reload} />;

  const year = cursor.getFullYear(); const month = cursor.getMonth();
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((first + days) / 7) * 7 }, (_, i) => { const n = i - first + 1; return n >= 1 && n <= days ? new Date(year, month, n) : null; });
  const dayEvents = (day: Date) => events.filter((e) => same(e.date, day)).sort((a, b) => +a.date - +b.date);
  const agenda = dayEvents(selected);
  const monthCount = events.filter((e) => e.date.getMonth() === month && e.date.getFullYear() === year).length;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const v = clean<typeof f>({ subject: required(f.subject, 'Title'), customerId: f.customerId ? undefined : 'Choose a customer', date: required(f.date, 'Date') });
    setErrors(v);
    if (Object.keys(v).length) return;
    const res = await dispatch(activityEntity.thunks.create({ type: f.type as 'call', subject: f.subject.trim(), notes: '', customerId: f.customerId, date: new Date(f.date).toISOString(), duration: 30, ownerId: d.user.id }));
    if (res.meta.requestStatus === 'fulfilled') { dispatch(pushToast('success', 'Event added to your calendar')); setOpen(false); setF({ ...f, subject: '' }); } else dispatch(pushToast('error', 'Could not add the event'));
  };

  return (
    <>
      <PageHeader title="Calendar" subtitle={`${monthCount} events this month · tasks, follow-ups, calls and meetings in one view.`} actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>Add event</Button>} />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 px-5 py-4 text-white">
            <h2 className="text-lg font-semibold">{cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
            <div className="flex items-center gap-1">
              <button aria-label="Previous month" onClick={() => setCursor(new Date(year, month - 1, 1))} className="rounded-lg bg-white/20 p-1.5 hover:bg-white/30"><ChevronLeft className="h-5 w-5" /></button>
              <button onClick={() => { const t = new Date(); setCursor(new Date(t.getFullYear(), t.getMonth(), 1)); setSelected(t); }} className="rounded-lg bg-white/20 px-3 py-1.5 text-sm font-medium hover:bg-white/30">Today</button>
              <button aria-label="Next month" onClick={() => setCursor(new Date(year, month + 1, 1))} className="rounded-lg bg-white/20 p-1.5 hover:bg-white/30"><ChevronRight className="h-5 w-5" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 border-b border-violet-100 bg-violet-50 text-center text-xs font-semibold text-brand-800">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w) => <div key={w} className="py-2">{w}</div>)}</div>
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (!day) return <div key={i} className="min-h-[72px] border-b border-r border-violet-50 bg-slate-50/50 sm:min-h-[96px]" />;
              const ev = dayEvents(day); const isSel = same(day, selected); const isNow = same(day, new Date());
              return (
                <button key={i} onClick={() => setSelected(day)} className={`min-h-[72px] border-b border-r border-violet-50 p-1.5 text-left transition hover:bg-violet-50 sm:min-h-[96px] sm:p-2 ${isSel ? 'bg-fuchsia-50 ring-2 ring-inset ring-fuchsia-400' : ''}`}>
                  <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${isNow ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white' : 'text-slate-700'}`}>{day.getDate()}</span>
                  <div className="mt-1 hidden space-y-0.5 sm:block">
                    {ev.slice(0, 2).map((e) => <p key={e.id} className={`truncate rounded px-1.5 py-0.5 text-[11px] font-medium ${kinds[e.kind].chip}`}>{e.title}</p>)}
                    {ev.length > 2 && <p className="px-1 text-[11px] text-slate-500">+{ev.length - 2} more</p>}
                  </div>
                  <div className="mt-1 flex gap-0.5 sm:hidden">{ev.slice(0, 4).map((e) => <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${kinds[e.kind].dot}`} />)}</div>
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-4 border-t border-violet-100 px-5 py-3 text-xs text-slate-600">{(Object.keys(kinds) as Kind[]).map((k) => <span key={k} className="flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-full ${kinds[k].dot}`} />{kinds[k].name}</span>)}</div>
        </div>

        <aside className="card h-fit p-5">
          <h2 className="text-lg font-semibold text-slate-900">{selected.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
          <p className="text-sm text-slate-500">{agenda.length ? `${agenda.length} item${agenda.length > 1 ? 's' : ''} on your agenda` : 'Nothing planned for this day'}</p>
          <ul className="mt-4 space-y-3">
            {agenda.length === 0 && <li className="rounded-xl border border-dashed border-violet-200 p-6 text-center text-sm text-slate-500">A free day. Add a meeting or call to fill it.</li>}
            {agenda.map((e) => (
              <li key={e.id} className="flex gap-3 rounded-xl bg-slate-50 p-3">
                <span className={`mt-1 h-full w-1.5 shrink-0 self-stretch rounded-full ${kinds[e.kind].dot}`} />
                <div className="min-w-0"><p className="text-sm font-semibold text-slate-900">{e.title}</p><p className="text-xs text-slate-500">{e.sub}</p><span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${kinds[e.kind].chip}`}>{kinds[e.kind].name}{e.kind !== 'task' ? ` · ${dateTime(e.date.toISOString()).split(', ').pop()}` : ''}</span></div>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add event" footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" form="event-form" loading={saving}>Add event</Button></>}>
        <form id="event-form" onSubmit={submit} noValidate className="space-y-4">
          <TextInput id="ev-title" label="Title" value={f.subject} error={errors.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput id="ev-type" label="Type" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} options={[{ value: 'meeting', label: 'Meeting' }, { value: 'call', label: 'Call' }, { value: 'email', label: 'Email' }, { value: 'follow_up', label: 'Follow-up' }]} />
            <SelectInput id="ev-customer" label="Customer" value={f.customerId} error={errors.customerId} onChange={(e) => setF({ ...f, customerId: e.target.value })} options={[{ value: '', label: 'Select a customer' }, ...d.customers.map((c) => ({ value: c.id, label: c.company }))]} />
          </div>
          <TextInput id="ev-date" label="Date and time" type="datetime-local" value={f.date} error={errors.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        </form>
      </Modal>
    </>
  );
}
