import { AlertCircle } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/Field';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { clearAuthError, resetPassword } from '@/store/authSlice';
import { pushToast } from '@/store/uiSlice';
import { clean, passwordRules, required, type Errors } from '@/utils/validation';
import AuthShell from './AuthShell';

export default function ResetPassword() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((s) => s.auth);
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState<Errors<typeof form>>({});

  useEffect(() => { dispatch(clearAuthError()); }, [dispatch]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const v = clean<typeof form>({
      password: required(form.password, 'New password') ?? passwordRules(form.password),
      confirm: form.confirm !== form.password ? 'Passwords do not match' : undefined,
    });
    setErrors(v);
    if (Object.keys(v).length) return;
    const res = await dispatch(resetPassword({ password: form.password }));
    if (resetPassword.fulfilled.match(res)) { dispatch(pushToast('success', 'Password updated. Sign in with your new password')); navigate('/login', { replace: true }); }
  };

  return (
    <AuthShell title="Set a new password" subtitle="Choose a strong password you haven't used before.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && <div role="alert" className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
        <PasswordInput id="password" label="New password" hint="At least 8 characters, with an uppercase letter and a number" value={form.password} error={errors.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <PasswordInput id="confirm" label="Confirm password" value={form.confirm} error={errors.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
        <Button type="submit" loading={loading} className="w-full">Update password</Button>
      </form>
    </AuthShell>
  );
}
