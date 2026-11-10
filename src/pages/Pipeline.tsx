import { Plus } from 'lucide-react';
import { useState, type DragEvent, type FormEvent } from 'react';
import Button from '@/components/ui/Button';
import { SelectInput, TextInput } from '@/components/ui/Field';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import { ErrorState, Skeleton } from '@/components/ui/States';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useCrmData } from '@/hooks/useCrmData';
import { deals as dealEntity } from '@/store/entities';
import { pushToast } from '@/store/uiSlice';
import { compactCurrency, currency, isOverdue, shortDate, toDateInput } from '@/utils/format';
import { clean, required, type Errors } from '@/utils/validation';
import type { Deal, DealStage } from '@/types';

const stages: { id: DealStage; name: string; prob: number; bar: string }[] = [
  { id: 'prospecting', name: 'Prospecting', prob: 15, bar: 'bg-teal-500' },
  { id: 'qualification', name: 'Qualification', prob: 35, bar: 'bg-violet-500' },
  { id: 'proposal', name: 'Proposal', prob: 55, bar: 'bg-fuchsia-500' },
  { id: 'negotiation', name: 'Negotiation', prob: 75, bar: 'bg-amber-500' },
  { id: 'won', name: 'Won', prob: 100, bar: 'bg-emerald-500' },
  { id: 'lost', name: 'Lost', prob: 0, bar: 'bg-rose-500' },
];

export default function Pipeline() {
  const d = useCrmData();
  const dispatch = useAppDispatch();
  const saving = useAppSelector((s) => s.deals.saving);
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<DealStage | null>(null);
  const [open, setOpen] = useState(false);
  const [moving, setMoving] = useState<Deal | null>(null);

  const customerName = (id: string) => d.customers.find((c) => c.id === id)?.company ?? 'Unknown customer';

  const move = async (deal: Deal, stage: DealStage) => {
    if (deal.stage === stage) return;
    const prob = stages.find((s) => s.id === stage)!.prob;
    const res = await dispatch(dealEntity.thunks.update({ id: deal.id, stage, probability: prob }));
    dispatch(pushToast(res.meta.requestStatus === 'fulfilled' ? 'success' : 'error', res.meta.requestStatus === 'fulfilled' ? `Moved to ${stages.find((s) => s.id === stage)!.name}` : 'Could not move the deal'));
  };

  const onDrop = (e: DragEvent, stage: DealStage) => {
    e.preventDefault(); setOver(null);
    const deal = d.deals.find((x) => x.id === dragId);
    setDragId(null);
    if (deal) move(deal, stage);
  };

  if (d.failed) return <ErrorState message={d.error ?? 'Please try again'} onRetry={d.reload} />;
  const total = d.deals.filter((x) => !['won', 'lost'].includes(x.stage)).reduce((a, x) => a + x.value, 0);
  const weighted = d.deals.filter((x) => !['won', 'lost'].includes(x.stage)).reduce((a, x) => a + (x.value * x.probability) / 100, 0);

  return (
    <>
      <PageHeader title="Sales pipeline" subtitle={`${compactCurrency(total)} open · ${compactCurrency(weighted)} weighted forecast`} actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>Add deal</Button>} />
      {d.loading ? <div className="flex gap-4 overflow-hidden">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-96 w-72 shrink-0" />)}</div> : (
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6">
          {stages.map((s) => {
            const items = d.deals.filter((x) => x.stage === s.id);
            return (
              <section key={s.id} aria-label={s.name} onDragOver={(e) => { e.preventDefault(); setOver(s.id); }} onDragLeave={() => setOver(null)} onDrop={(e) => onDrop(e, s.id)}
                className={`flex w-72 shrink-0 flex-col rounded-xl border bg-slate-100/70 p-3 transition ${over === s.id ? 'border-brand-400 bg-brand-50/60' : 'border-transparent'}`}>
                <header className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${s.bar}`} /><h2 className="text-sm font-semibold text-slate-800">{s.name}</h2><span className="rounded-full bg-white px-2 text-xs text-slate-500">{items.length}</span></div>
                  <span className="text-xs font-medium text-slate-500">{compactCurrency(items.reduce((a, x) => a + x.value, 0))}</span>
                </header>
                <div className="min-h-24 flex-1 space-y-2.5">
                  {items.length === 0 && <p className="rounded-lg border border-dashed border-slate-300 py-6 text-center text-xs text-slate-400">Drop a deal here</p>}
                  {items.map((x) => (
                    <article key={x.id} draggable onDragStart={(e) => { setDragId(x.id); e.dataTransfer.effectAllowed = 'move'; }} onDragEnd={() => { setDragId(null); setOver(null); }}
                      className={`cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-card active:cursor-grabbing ${dragId === x.id ? 'opacity-50' : ''}`}>
                      <p className="text-sm font-medium text-slate-900">{x.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{customerName(x.customerId)}</p>
                      <div className="mt-3 flex items-center justify-between"><p className="text-sm font-semibold text-slate-900">{currency(x.value)}</p><p className="text-xs text-slate-500">{x.probability}%</p></div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full ${s.bar}`} style={{ width: `${x.probability}%` }} /></div>
                      <div className="mt-3 flex items-center justify-between">
                        <p className={`text-xs ${isOverdue(x.closeDate) && !['won', 'lost'].includes(x.stage) ? 'text-rose-600' : 'text-slate-500'}`}>Close {shortDate(x.closeDate)}</p>
                        <button onClick={() => setMoving(x)} className="text-xs font-medium text-brand-600 hover:text-brand-700">Move</button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <DealForm open={open} saving={saving} customers={d.customers.map((c) => ({ value: c.id, label: `${c.company} (${c.name})` }))} onClose={() => setOpen(false)}
        onSubmit={async (data) => {
          const res = await dispatch(dealEntity.thunks.create({ ...data, ownerId: d.user.id, createdAt: new Date().toISOString(), stage: 'prospecting', probability: 15 }));
          if (res.meta.requestStatus === 'fulfilled') { dispatch(pushToast('success', 'Deal added to Prospecting')); setOpen(false); } else dispatch(pushToast('error', 'Could not add the deal'));
        }} />

      <Modal open={!!moving} title="Move deal" onClose={() => setMoving(null)}>
        <p className="mb-3 text-sm text-slate-600">{moving?.title}</p>
        <div className="grid gap-2">
          {stages.map((s) => <button key={s.id} disabled={s.id === moving?.stage} onClick={() => { if (moving) move(moving, s.id); setMoving(null); }} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-left text-sm hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-400"><span className={`h-2.5 w-2.5 rounded-full ${s.bar}`} />{s.name}{s.id === moving?.stage && <span className="ml-auto text-xs">Current</span>}</button>)}
        </div>
      </Modal>
    </>
  );
}

interface DealDraft { title: string; customerId: string; value: string; closeDate: string }
function DealForm({ open, saving, customers, onClose, onSubmit }: { open: boolean; saving: boolean; customers: { value: string; label: string }[]; onClose: () => void; onSubmit: (d: { title: string; customerId: string; value: number; closeDate: string }) => void }) {
  const [f, setF] = useState<DealDraft>({ title: '', customerId: '', value: '', closeDate: toDateInput(new Date(Date.now() + 30 * 86400000).toISOString()) });
  const [errors, setErrors] = useState<Errors<DealDraft>>({});
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = clean<DealDraft>({ title: required(f.title, 'Deal name'), customerId: f.customerId ? undefined : 'Choose a customer', value: Number(f.value) > 0 ? undefined : 'Enter a value above 0', closeDate: required(f.closeDate, 'Close date') });
    setErrors(v);
    if (Object.keys(v).length) return;
    onSubmit({ title: f.title.trim(), customerId: f.customerId, value: Number(f.value), closeDate: new Date(f.closeDate + 'T10:00:00').toISOString() });
    setF({ ...f, title: '', value: '' });
  };
  return (
    <Modal open={open} onClose={onClose} title="Add deal" footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="deal-form" loading={saving}>Add deal</Button></>}>
      <form id="deal-form" onSubmit={submit} noValidate className="space-y-4">
        <TextInput id="deal-title" label="Deal name" value={f.title} error={errors.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        <SelectInput id="deal-customer" label="Customer" value={f.customerId} error={errors.customerId} onChange={(e) => setF({ ...f, customerId: e.target.value })} options={[{ value: '', label: 'Select a customer' }, ...customers]} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput id="deal-value" label="Value (USD)" type="number" min="0" value={f.value} error={errors.value} onChange={(e) => setF({ ...f, value: e.target.value })} />
          <TextInput id="deal-close" label="Expected close" type="date" value={f.closeDate} error={errors.closeDate} onChange={(e) => setF({ ...f, closeDate: e.target.value })} />
        </div>
      </form>
    </Modal>
  );
}
