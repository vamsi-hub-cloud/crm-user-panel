import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { SelectInput, TextArea, TextInput } from '@/components/ui/Field';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useCrmData } from '@/hooks/useCrmData';
import { activities as activityEntity } from '@/store/entities';
import { pushToast } from '@/store/uiSlice';
import { dateTime, label } from '@/utils/format';
import { clean, required, type Errors } from '@/utils/validation';
import type { ActivityType } from '@/types';
import { activityIcon } from './customers/CustomerProfile';

const types: ActivityType[] = ['call', 'meeting', 'email', 'interaction', 'follow_up'];
type Draft = { type: ActivityType; subject: string; notes: string; customerId: string; date: string; duration: string };

const nowLocal = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };

export default function Activities() {
  const d = useCrmData();
  const dispatch = useAppDispatch();
  const saving = useAppSelector((s) => s.activities.saving);
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState<'all' | ActivityType>('all');
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<Draft>({ type: 'call', subject: '', notes: '', customerId: '', date: nowLocal(), duration: '15' });
  const [errors, setErrors] = useState<Errors<Draft>>({});

  useEffect(() => { if (params.get('new')) { setOpen(true); setParams({}, { replace: true }); } }, [params, setParams]);

  const list = useMemo(() => d.activities.filter((a) => filter === 'all' || a.type === filter).sort((a, b) => +new Date(b.date) - +new Date(a.date)), [d.activities, filter]);
  const customerName = (id: string) => d.customers.find((c) => c.id === id)?.company ?? 'Unknown customer';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const v = clean<Draft>({ subject: required(f.subject, 'Subject'), customerId: f.customerId ? undefined : 'Choose a customer', date: required(f.date, 'Date'), duration: Number(f.duration) >= 0 && f.duration !== '' ? undefined : 'Enter minutes (0 or more)' });
    setErrors(v);
    if (Object.keys(v).length) return;
    const res = await dispatch(activityEntity.thunks.create({ type: f.type, subject: f.subject.trim(), notes: f.notes, customerId: f.customerId, date: new Date(f.date).toISOString(), duration: Number(f.duration), ownerId: d.user.id }));
    if (res.meta.requestStatus === 'fulfilled') { dispatch(pushToast('success', `${label(f.type)} logged`)); setOpen(false); setF({ ...f, subject: '', notes: '', date: nowLocal() }); } else dispatch(pushToast('error', 'Could not log the activity'));
  };

  return (
    <>
      <PageHeader title="Activities" subtitle="Log calls, meetings, emails and customer interactions." actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>Log activity</Button>} />
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {(['all', ...types] as const).map((t) => <button key={t} onClick={() => setFilter(t)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${filter === t ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}>{label(t)}</button>)}
      </div>

      {d.loading ? <div className="space-y-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div>
        : d.failed ? <ErrorState message={d.error ?? 'Please try again'} onRetry={d.reload} />
        : list.length === 0 ? <div className="card"><EmptyState title="No activities yet" text="Log your first call or meeting to build a customer history." action={<Button onClick={() => setOpen(true)}>Log activity</Button>} /></div>
        : (
          <ul className="card divide-y divide-slate-100">
            {list.map((a) => {
              const I = activityIcon[a.type];
              return (
                <li key={a.id} className="flex gap-4 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600"><I className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium text-slate-900">{a.subject}</p><Badge value="in_progress" text={label(a.type)} /></div>
                    <p className="mt-0.5 text-xs text-slate-500">{customerName(a.customerId)} · {dateTime(a.date)}{a.duration ? ` · ${a.duration} min` : ''}</p>
                    {a.notes && <p className="mt-1.5 text-sm text-slate-600">{a.notes}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

      <Modal open={open} onClose={() => setOpen(false)} title="Log activity" footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" form="activity-form" loading={saving}>Log activity</Button></>}>
        <form id="activity-form" onSubmit={submit} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput id="act-type" label="Type" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as ActivityType })} options={types.map((t) => ({ value: t, label: label(t) }))} />
            <SelectInput id="act-customer" label="Customer" value={f.customerId} error={errors.customerId} onChange={(e) => setF({ ...f, customerId: e.target.value })} options={[{ value: '', label: 'Select a customer' }, ...d.customers.map((c) => ({ value: c.id, label: c.company }))]} />
          </div>
          <TextInput id="act-subject" label="Subject" value={f.subject} error={errors.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput id="act-date" label="Date and time" type="datetime-local" value={f.date} error={errors.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
            <TextInput id="act-duration" label="Duration (minutes)" type="number" min="0" value={f.duration} error={errors.duration} onChange={(e) => setF({ ...f, duration: e.target.value })} />
          </div>
          <TextArea id="act-notes" label="Notes" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
        </form>
      </Modal>
    </>
  );
}
