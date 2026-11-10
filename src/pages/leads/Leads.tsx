import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import PageHeader from '@/components/ui/PageHeader';
import SearchBox from '@/components/ui/SearchBox';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useCrmData } from '@/hooks/useCrmData';
import { leads as leadEntity } from '@/store/entities';
import { pushToast } from '@/store/uiSlice';
import { currency, isOverdue, isToday, label, shortDate } from '@/utils/format';
import type { Lead } from '@/types';
import LeadDetail from './LeadDetail';
import LeadForm, { leadStatuses } from './LeadForm';

export default function Leads() {
  const d = useCrmData();
  const dispatch = useAppDispatch();
  const saving = useAppSelector((s) => s.leads.saving);
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [form, setForm] = useState<{ open: boolean; lead?: Lead }>({ open: false });
  const [viewId, setViewId] = useState<string | null>(null);
  const [del, setDel] = useState<Lead | null>(null);

  useEffect(() => { if (params.get('new')) { setForm({ open: true }); setParams({}, { replace: true }); } }, [params, setParams]);

  const list = useMemo(() => d.leads.filter((l) => (status === 'all' || l.status === status) && `${l.name} ${l.company} ${l.email}`.toLowerCase().includes(q.toLowerCase())), [d.leads, q, status]);
  const viewing = d.leads.find((l) => l.id === viewId) ?? null;
  const nextFollowUp = (l: Lead) => l.followUps.filter((f) => !f.done).sort((a, b) => +new Date(a.date) - +new Date(b.date))[0];

  const submit = async (data: Parameters<React.ComponentProps<typeof LeadForm>['onSubmit']>[0]) => {
    const res = form.lead ? await dispatch(leadEntity.thunks.update({ id: form.lead.id, ...data })) : await dispatch(leadEntity.thunks.create({ ...data, ownerId: d.user.id, createdAt: new Date().toISOString(), followUps: [] }));
    if (res.meta.requestStatus === 'fulfilled') { dispatch(pushToast('success', form.lead ? 'Lead updated' : 'Lead added')); setForm({ open: false }); }
    else dispatch(pushToast('error', 'Could not save the lead. Try again'));
  };

  const remove = async () => {
    if (!del) return;
    await dispatch(leadEntity.thunks.remove(del.id));
    dispatch(pushToast('success', 'Lead deleted')); setDel(null);
  };

  return (
    <>
      <PageHeader title="Leads" subtitle="Track prospects, update their status and schedule follow-ups." actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setForm({ open: true })}>Add lead</Button>} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBox value={q} onChange={setQ} placeholder="Search by name, company or email" />
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {['all', ...leadStatuses].map((s) => <button key={s} onClick={() => setStatus(s)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${status === s ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}>{label(s)}</button>)}
        </div>
      </div>

      {d.loading ? <div className="space-y-2">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14" />)}</div>
        : d.failed ? <ErrorState message={d.error ?? 'Please try again'} onRetry={d.reload} />
        : list.length === 0 ? <div className="card"><EmptyState title={d.leads.length ? 'No leads match your filters' : 'No leads yet'} text={d.leads.length ? 'Try a different search or status.' : 'Add your first lead to start tracking your pipeline.'} action={!d.leads.length && <Button onClick={() => setForm({ open: true })}>Add lead</Button>} /></div>
        : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="th">Lead</th><th className="th">Status</th><th className="th">Value</th><th className="th">Next follow-up</th><th className="th">Source</th><th className="th text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {list.map((l) => {
                    const f = nextFollowUp(l);
                    return (
                      <tr key={l.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setViewId(l.id)}>
                        <td className="td"><p className="font-medium text-slate-900">{l.name}</p><p className="text-xs text-slate-500">{l.company}</p></td>
                        <td className="td"><Badge value={l.status} /></td>
                        <td className="td">{currency(l.value)}</td>
                        <td className="td">{f ? <span className={isOverdue(f.date) && !isToday(f.date) ? 'text-rose-600' : ''}>{shortDate(f.date)}</span> : <span className="text-slate-400">None</span>}</td>
                        <td className="td">{l.source}</td>
                        <td className="td text-right" onClick={(e) => e.stopPropagation()}>
                          <button aria-label={`Edit ${l.name}`} onClick={() => setForm({ open: true, lead: l })} className="rounded p-1.5 text-slate-500 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button>
                          <button aria-label={`Delete ${l.name}`} onClick={() => setDel(l)} className="rounded p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {form.open && <LeadForm key={form.lead?.id ?? 'new'} open initial={form.lead} saving={saving} onClose={() => setForm({ open: false })} onSubmit={submit} />}
      <LeadDetail lead={viewing} onClose={() => setViewId(null)} onEdit={(l) => { setViewId(null); setForm({ open: true, lead: l }); }} />
      <ConfirmDialog open={!!del} title="Delete lead" message={`Delete ${del?.name}? This can't be undone.`} onConfirm={remove} onClose={() => setDel(null)} />
    </>
  );
}
