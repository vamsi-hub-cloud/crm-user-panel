import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { TextInput } from '@/components/ui/Field';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { clearAuthError, forgotPassword } from '@/store/authSlice';
import { isEmail, required } from '@/utils/validation';
import AuthShell from './AuthShell';

export default function ForgotPassword() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((s) => s.auth);
  const [email, setEmail] = useState('');
  const [err, setErr] = useState<string>();

  useEffect(() => { dispatch(clearAuthError()); }, [dispatch]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const v = required(email, 'Email') ?? (isEmail(email) ? undefined : 'Enter a valid email address');
    setErr(v);
    if (v) return;
    const res = await dispatch(forgotPassword(email));
    if (forgotPassword.fulfilled.match(res)) navigate('/verify-otp');
  };

  return (
    <AuthShell title="Reset your password" subtitle="Enter your work email and we'll send a 6-digit verification code.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && <div role="alert" className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
        <TextInput id="email" label="Email" type="email" placeholder="you@company.com" value={email} error={err} onChange={(e) => setEmail(e.target.value)} />
        <Button type="submit" loading={loading} className="w-full">Send code</Button>
        <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Back to sign in</Link>
      </form>
    </AuthShell>
  );
}
