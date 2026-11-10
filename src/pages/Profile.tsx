import { useState, type FormEvent } from 'react';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { PasswordInput, TextArea, TextInput } from '@/components/ui/Field';
import PageHeader from '@/components/ui/PageHeader';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { changePassword, clearAuthError, updateProfile } from '@/store/authSlice';
import { pushToast } from '@/store/uiSlice';
import { roleLabel } from '@/utils/permissions';
import { clean, isEmail, isPhone, passwordRules, required, type Errors } from '@/utils/validation';

export default function Profile() {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((s) => s.auth);
  const u = user!;
  const [tab, setTab] = useState<'profile' | 'security' | 'preferences'>('profile');

  return (
    <>
      <PageHeader title="Profile & settings" subtitle="Manage your personal information and account." />
      <div className="mb-5 flex gap-1 border-b border-slate-200">
        {([['profile', 'Personal info'], ['security', 'Password'], ['preferences', 'Preferences']] as const).map(([k, l]) => (
          <button key={k} onClick={() => { setTab(k); dispatch(clearAuthError()); }} className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium ${tab === k ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{l}</button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card h-fit p-6 text-center">
          <div className="flex justify-center"><Avatar name={u.name} size={80} /></div>
          <p className="mt-3 font-semibold text-slate-900">{u.name}</p>
          <p className="text-sm text-slate-500">{u.title}</p>
          <p className="mt-2 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">{roleLabel[u.role]}</p>
        </div>
        <div className="card p-6 lg:col-span-2">
          {tab === 'profile' && <InfoForm key={u.id} loading={loading} onSave={async (p) => { const r = await dispatch(updateProfile(p)); dispatch(pushToast(updateProfile.fulfilled.match(r) ? 'success' : 'error', updateProfile.fulfilled.match(r) ? 'Profile updated' : 'Could not update your profile')); }} />}
          {tab === 'security' && <PasswordForm />}
          {tab === 'preferences' && <Preferences />}
        </div>
      </div>
    </>
  );
}

function InfoForm({ loading, onSave }: { loading: boolean; onSave: (p: { name: string; email: string; phone: string; location: string; bio: string }) => void }) {
  const u = useAppSelector((s) => s.auth.user)!;
  const [f, setF] = useState({ name: u.name, email: u.email, phone: u.phone, location: u.location, bio: u.bio });
  const [errors, setErrors] = useState<Errors<typeof f>>({});
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = clean<typeof f>({ name: required(f.name, 'Full name'), email: required(f.email, 'Email') ?? (isEmail(f.email) ? undefined : 'Enter a valid email address'), phone: required(f.phone, 'Phone') ?? (isPhone(f.phone) ? undefined : 'Enter a valid phone number') });
    setErrors(v);
    if (!Object.keys(v).length) onSave(f);
  };
  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      <TextInput id="p-name" label="Full name" value={f.name} error={errors.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      <TextInput id="p-email" label="Email" type="email" value={f.email} error={errors.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      <TextInput id="p-phone" label="Phone" value={f.phone} error={errors.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
      <TextInput id="p-location" label="Location" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} />
      <TextInput id="p-dept" label="Department" value={u.department} disabled hint="Set by your administrator" />
      <TextInput id="p-role" label="Role" value={roleLabel[u.role]} disabled hint="Set by your administrator" />
      <div className="sm:col-span-2"><TextArea id="p-bio" label="Bio" value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} /></div>
      <div className="sm:col-span-2"><Button type="submit" loading={loading}>Save changes</Button></div>
    </form>
  );
}

function PasswordForm() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);
  const [f, setF] = useState({ current: '', next: '', confirm: '' });
  const [errors, setErrors] = useState<Errors<typeof f>>({});
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const v = clean<typeof f>({ current: required(f.current, 'Current password'), next: required(f.next, 'New password') ?? passwordRules(f.next) ?? (f.next === f.current ? 'Choose a different password' : undefined), confirm: f.confirm !== f.next ? 'Passwords do not match' : undefined });
    setErrors(v);
    if (Object.keys(v).length) return;
    const r = await dispatch(changePassword({ current: f.current, next: f.next }));
    if (changePassword.fulfilled.match(r)) { dispatch(pushToast('success', 'Password changed')); setF({ current: '', next: '', confirm: '' }); }
  };
  return (
    <form onSubmit={submit} noValidate className="max-w-md space-y-4">
      {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</p>}
      <PasswordInput id="pw-current" label="Current password" value={f.current} error={errors.current} onChange={(e) => setF({ ...f, current: e.target.value })} />
      <PasswordInput id="pw-next" label="New password" hint="At least 8 characters, with an uppercase letter and a number" value={f.next} error={errors.next} onChange={(e) => setF({ ...f, next: e.target.value })} />
      <PasswordInput id="pw-confirm" label="Confirm new password" value={f.confirm} error={errors.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} />
      <Button type="submit" loading={loading}>Change password</Button>
    </form>
  );
}

function Preferences() {
  const dispatch = useAppDispatch();
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => { try { return JSON.parse(localStorage.getItem('crm_user_v2_prefs') ?? '') as Record<string, boolean>; } catch { return { leads: true, tasks: true, meetings: true, updates: false }; } });
  const rows = [['leads', 'Lead assignments', 'Get notified when a lead is assigned to you'], ['tasks', 'Task reminders', 'Reminders before a task is due'], ['meetings', 'Upcoming meetings', 'Alerts ahead of scheduled meetings'], ['updates', 'Product updates', 'Occasional news about CRM improvements']] as const;
  const toggle = (k: string) => { const next = { ...prefs, [k]: !prefs[k] }; setPrefs(next); localStorage.setItem('crm_user_v2_prefs', JSON.stringify(next)); dispatch(pushToast('success', 'Preference saved')); };
  return (
    <ul className="divide-y divide-slate-100">
      {rows.map(([k, t, s]) => (
        <li key={k} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
          <div><p className="text-sm font-medium text-slate-900">{t}</p><p className="text-sm text-slate-500">{s}</p></div>
          <button role="switch" aria-checked={!!prefs[k]} aria-label={t} onClick={() => toggle(k)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${prefs[k] ? 'bg-brand-600' : 'bg-slate-300'}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${prefs[k] ? 'left-[22px]' : 'left-0.5'}`} /></button>
        </li>
      ))}
    </ul>
  );
}
