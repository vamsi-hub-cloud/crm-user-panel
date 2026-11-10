import { Calendar, Check, Mail, Phone, Plus } from 'lucide-react';
import { useState } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { SelectInput, TextInput } from '@/components/ui/Field';
import Modal from '@/components/ui/Modal';
import { useAppDispatch } from '@/hooks/redux';
import { leads } from '@/store/entities';
import { pushToast } from '@/store/uiSlice';
import { currency, isOverdue, isToday, label, shortDate, toDateInput, uid } from '@/utils/format';
import type { Lead } from '@/types';
import { leadStatuses } from './LeadForm';

export default function LeadDetail({ lead, onClose, onEdit }: { lead: Lead | null; onClose: () => void; onEdit: (l: Lead) => void }) {
  const dispatch = useAppDispatch();
  const [note, setNote] = useState('');
  const [date, setDate] = useState(toDateInput(new Date(Date.now() + 86400000).toISOString()));
  const [err, setErr] = useState<string>();
  if (!lead) return null;

  const save = async (patch: Partial<Lead>, msg: string) => {
    const res = await dispatch(leads.thunks.update({ id: lead.id, ...patch }));
    dispatch(pushToast(leads.thunks.update.fulfilled.match(res) ? 'success' : 'error', leads.thunks.update.fulfilled.match(res) ? msg : 'Could not save. Try again'));
  };

  const addFollowUp = () => {
    if (!note.trim()) return setErr('Describe the follow-up');
    if (!date) return setErr('Pick a date');
    setErr(undefined);
    save({ followUps: [...lead.followUps, { id: uid('f'), date: new Date(date + 'T10:00:00').toISOString(), note: note.trim(), done: false }] }, 'Follow-up scheduled');
    setNote('');
  };
  const toggle = (id: string) => save({ followUps: lead.followUps.map((f) => (f.id === id ? { ...f, done: !f.done } : f)) }, 'Follow-up updated');
  const sorted = [...lead.followUps].sort((a, b) => +new Date(a.date) - +new Date(b.date));

  return (
    <Modal open onClose={onClose} wide title={lead.name} footer={<><Button variant="secondary" onClick={onClose}>Close</Button><Button onClick={() => onEdit(lead)}>Edit lead</Button></>}>
      <div className="space-y-6">
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <p className="text-slate-600"><span className="block text-xs text-slate-500">Company</span>{lead.company}</p>
          <p className="text-slate-600"><span className="block text-xs text-slate-500">Estimated value</span>{currency(lead.value)}</p>
          <p className="flex items-center gap-2 text-slate-600"><Mail className="h-4 w-4 text-slate-400" /><a className="hover:text-brand-600" href={`mailto:${lead.email}`}>{lead.email}</a></p>
          <p className="flex items-center gap-2 text-slate-600"><Phone className="h-4 w-4 text-slate-400" /><a className="hover:text-brand-600" href={`tel:${lead.phone}`}>{lead.phone}</a></p>
          <p className="text-slate-600"><span className="block text-xs text-slate-500">Source</span>{lead.source}</p>
          <p className="text-slate-600"><span className="mb-1 block text-xs text-slate-500">Added</span>{shortDate(lead.createdAt)}</p>
        </div>

        <SelectInput id="detail-status" label="Update status" value={lead.status} onChange={(e) => save({ status: e.target.value as Lead['status'] }, `Status changed to ${label(e.target.value)}`)} options={leadStatuses.map((s) => ({ value: s, label: label(s) }))} />

        {lead.notes && <div><p className="mb-1 text-sm font-medium text-slate-700">Notes</p><p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{lead.notes}</p></div>}

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Follow-ups</p>
          <ul className="space-y-2">
            {sorted.length === 0 && <li className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">No follow-ups yet. Schedule the next touchpoint below.</li>}
            {sorted.map((f) => (
              <li key={f.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                <button onClick={() => toggle(f.id)} aria-label={f.done ? 'Mark as not done' : 'Mark as done'} className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${f.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>{f.done && <Check className="h-3.5 w-3.5" />}</button>
                <div className="min-w-0 flex-1"><p className={`text-sm ${f.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{f.note}</p><p className={`flex items-center gap-1 text-xs ${!f.done && isOverdue(f.date) && !isToday(f.date) ? 'text-rose-600' : 'text-slate-500'}`}><Calendar className="h-3 w-3" />{shortDate(f.date)}</p></div>
                {f.done ? <Badge value="done" /> : isToday(f.date) ? <Badge value="medium" text="Today" /> : isOverdue(f.date) ? <Badge value="high" text="Overdue" /> : null}
              </li>
            ))}
          </ul>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_160px_auto] sm:items-end">
            <TextInput id="fu-note" label="New follow-up" placeholder="e.g. Send proposal" value={note} error={err} onChange={(e) => setNote(e.target.value)} />
            <TextInput id="fu-date" label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Button onClick={addFollowUp} icon={<Plus className="h-4 w-4" />} className="sm:mb-0">Add</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
