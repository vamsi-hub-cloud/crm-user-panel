import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { cancelPending, clearAuthError, verifyOtp } from '@/store/authSlice';
import { pushToast } from '@/store/uiSlice';
import AuthShell from './AuthShell';

const LEN = 6;

export default function VerifyOtp() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, pending } = useAppSelector((s) => s.auth);
  const [digits, setDigits] = useState<string[]>(Array(LEN).fill(''));
  const [seconds, setSeconds] = useState(30);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { dispatch(clearAuthError()); refs.current[0]?.focus(); }, [dispatch]);
  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const set = (i: number, v: string) => {
    const ch = v.replace(/\D/g, '').slice(-1);
    const next = [...digits]; next[i] = ch; setDigits(next);
    if (ch && i < LEN - 1) refs.current[i + 1]?.focus();
  };
  const onKey = (i: number, e: KeyboardEvent) => { if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus(); };
  const onPaste = (e: ClipboardEvent) => {
    const t = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LEN);
    if (!t) return;
    e.preventDefault();
    setDigits(Array.from({ length: LEN }, (_, i) => t[i] ?? ''));
    refs.current[Math.min(t.length, LEN - 1)]?.focus();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < LEN) return;
    const res = await dispatch(verifyOtp({ code }));
    if (verifyOtp.fulfilled.match(res)) {
      if (res.payload.purpose === 'login') { dispatch(pushToast('success', `Welcome back, ${res.payload.user.name.split(' ')[0]}`)); navigate('/dashboard', { replace: true }); }
      else navigate('/reset-password', { replace: true });
    } else { setDigits(Array(LEN).fill('')); refs.current[0]?.focus(); }
  };

  const resend = () => { setSeconds(30); setDigits(Array(LEN).fill('')); dispatch(pushToast('info', 'A new code was sent. Demo code: 123456')); };
  const back = () => { const to = pending?.purpose === 'reset' ? '/forgot-password' : '/login'; dispatch(cancelPending()); navigate(to); };

  return (
    <AuthShell title="Check your email" subtitle={`Enter the 6-digit code sent to ${pending?.email ?? 'your email'}. Demo code: 123456`}>
      <form onSubmit={submit} className="space-y-5">
        {error && <div role="alert" className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
        <div className="flex justify-between gap-2" onPaste={onPaste}>
          {digits.map((d, i) => (
            <input key={i} ref={(el) => { refs.current[i] = el; }} value={d} inputMode="numeric" maxLength={1} aria-label={`Digit ${i + 1}`} onChange={(e) => set(i, e.target.value)} onKeyDown={(e) => onKey(i, e)} className="input h-12 w-full text-center text-lg font-semibold" />
          ))}
        </div>
        <Button type="submit" loading={loading} disabled={digits.join('').length < LEN} className="w-full">Verify code</Button>
        <div className="flex items-center justify-between text-sm">
          <button type="button" onClick={back} className="flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Back</button>
          {seconds > 0 ? <span className="text-slate-500">Resend in {seconds}s</span> : <button type="button" onClick={resend} className="font-medium text-brand-600 hover:text-brand-700">Resend code</button>}
        </div>
      </form>
    </AuthShell>
  );
}
