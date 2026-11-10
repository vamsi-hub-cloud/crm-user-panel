import { AlertCircle } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { PasswordInput, TextInput } from '@/components/ui/Field';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { clearAuthError, login } from '@/store/authSlice';
import { clean, isEmail, required, type Errors } from '@/utils/validation';
import AuthShell from './AuthShell';

const demo = [
  { role: 'Sales Representative', email: 'rep@crm.com' },
  { role: 'Employee', email: 'employee@crm.com' },
  { role: 'Sales Manager', email: 'manager@crm.com' },
];

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Errors<typeof form>>({});

  useEffect(() => { dispatch(clearAuthError()); }, [dispatch]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const v = clean<typeof form>({
      email: required(form.email, 'Email') ?? (isEmail(form.email) ? undefined : 'Enter a valid email address'),
      password: required(form.password, 'Password'),
    });
    setErrors(v);
    if (Object.keys(v).length) return;
    const res = await dispatch(login(form));
    if (login.fulfilled.match(res)) navigate('/verify-otp');
  };

  return (
    <AuthShell title="Sign in" subtitle="Use your work email to access your CRM workspace.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && <div role="alert" className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
        <TextInput id="email" label="Email" type="email" autoComplete="email" placeholder="you@company.com" value={form.email} error={errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <PasswordInput id="password" label="Password" autoComplete="current-password" placeholder="Enter your password" value={form.password} error={errors.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <div className="text-right"><Link to="/forgot-password" className="text-sm font-medium text-brand-600 hover:text-brand-700">Forgot password?</Link></div>
        <Button type="submit" loading={loading} className="w-full">Continue</Button>
      </form>
      <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-4">
        <p className="text-xs font-semibold text-slate-700">Demo accounts</p>
        <p className="mt-0.5 text-xs text-slate-500">Password <code className="rounded bg-slate-100 px-1">Password1</code> · Verification code <code className="rounded bg-slate-100 px-1">123456</code></p>
        <div className="mt-3 space-y-1.5">
          {demo.map((d) => (
            <button key={d.email} type="button" onClick={() => setForm({ email: d.email, password: 'Password1' })} className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs hover:bg-slate-50">
              <span className="font-medium text-slate-700">{d.role}</span><span className="text-slate-500">{d.email}</span>
            </button>
          ))}
        </div>
      </div>
    </AuthShell>
  );
}
