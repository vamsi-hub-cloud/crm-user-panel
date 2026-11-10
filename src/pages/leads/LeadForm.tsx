import { useState, type FormEvent } from 'react';
import Button from '@/components/ui/Button';
import { SelectInput, TextArea, TextInput } from '@/components/ui/Field';
import Modal from '@/components/ui/Modal';
import { clean, isEmail, isPhone, required, type Errors } from '@/utils/validation';
import { label } from '@/utils/format';
import type { Lead, LeadStatus } from '@/types';

export const leadStatuses: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
export const sources = ['Website', 'Referral', 'LinkedIn', 'Event', 'Cold outreach', 'Partner'];

export type LeadDraft = Pick<Lead, 'name' | 'company' | 'email' | 'phone' | 'source' | 'status' | 'notes'> & { value: string };

interface Props { open: boolean; initial?: Lead; saving: boolean; onClose: () => void; onSubmit: (d: Omit<LeadDraft, 'value'> & { value: number }) => void }

export default function LeadForm({ open, initial, saving, onClose, onSubmit }: Props) {
  const blank: LeadDraft = { name: initial?.name ?? '', company: initial?.company ?? '', email: initial?.email ?? '', phone: initial?.phone ?? '', source: initial?.source ?? 'Website', status: initial?.status ?? 'new', value: String(initial?.value ?? ''), notes: initial?.notes ?? '' };
  const [f, setF] = useState<LeadDraft>(blank);
  const [errors, setErrors] = useState<Errors<LeadDraft>>({});
  const set = (k: keyof LeadDraft) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = clean<LeadDraft>({
      name: required(f.name, 'Name'),
      company: required(f.company, 'Company'),
      email: required(f.email, 'Email') ?? (isEmail(f.email) ? undefined : 'Enter a valid email address'),
      phone: required(f.phone, 'Phone') ?? (isPhone(f.phone) ? undefined : 'Enter a valid phone number'),
      value: f.value === '' || Number(f.value) < 0 || Number.isNaN(Number(f.value)) ? 'Enter a deal value of 0 or more' : undefined,
    });
    setErrors(v);
    if (Object.keys(v).length) return;
    onSubmit({ ...f, value: Number(f.value) });
  };

  return (
    <Modal open={open} onClose={onClose} wide title={initial ? 'Edit lead' : 'Add lead'}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="lead-form" loading={saving}>{initial ? 'Save changes' : 'Add lead'}</Button></>}>
      <form id="lead-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <TextInput id="lead-name" label="Contact name" value={f.name} error={errors.name} onChange={set('name')} />
        <TextInput id="lead-company" label="Company" value={f.company} error={errors.company} onChange={set('company')} />
        <TextInput id="lead-email" label="Email" type="email" value={f.email} error={errors.email} onChange={set('email')} />
        <TextInput id="lead-phone" label="Phone" value={f.phone} error={errors.phone} onChange={set('phone')} />
        <SelectInput id="lead-source" label="Source" value={f.source} onChange={set('source')} options={sources.map((s) => ({ value: s, label: s }))} />
        <SelectInput id="lead-status" label="Status" value={f.status} onChange={set('status')} options={leadStatuses.map((s) => ({ value: s, label: label(s) }))} />
        <TextInput id="lead-value" label="Estimated value (USD)" type="number" min="0" value={f.value} error={errors.value} onChange={set('value')} />
        <div className="sm:col-span-2"><TextArea id="lead-notes" label="Notes" value={f.notes} onChange={set('notes')} /></div>
      </form>
    </Modal>
  );
}
