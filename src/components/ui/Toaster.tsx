import { CheckCircle2, Info, XCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { dismissToast, type Toast } from '@/store/uiSlice';

const icons = { success: CheckCircle2, error: XCircle, info: Info };
const tones = { success: 'text-emerald-600', error: 'text-rose-600', info: 'text-teal-600' };

function Item({ t }: { t: Toast }) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const id = setTimeout(() => dispatch(dismissToast(t.id)), 3500);
    return () => clearTimeout(id);
  }, [t.id, dispatch]);
  const Icon = icons[t.kind];
  return (
    <div role="status" className="animate-pop pointer-events-auto flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <Icon className={`h-5 w-5 shrink-0 ${tones[t.kind]}`} />
      <p className="text-sm text-slate-800">{t.message}</p>
    </div>
  );
}

export default function Toaster() {
  const toasts = useAppSelector((s) => s.ui.toasts);
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
      {toasts.map((t) => <Item key={t.id} t={t} />)}
    </div>
  );
}
