import { Bell, CalendarClock, CheckSquare, Megaphone, Target, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States';
import { useAppDispatch } from '@/hooks/redux';
import { useCrmData } from '@/hooks/useCrmData';
import { notifications as notificationEntity } from '@/store/entities';
import { pushToast } from '@/store/uiSlice';
import { timeAgo } from '@/utils/format';
import type { NotificationType } from '@/types';

const icons: Record<NotificationType, { i: LucideIcon; tone: string }> = {
  lead: { i: Target, tone: 'bg-teal-50 text-teal-600' },
  task: { i: CheckSquare, tone: 'bg-amber-50 text-amber-600' },
  meeting: { i: CalendarClock, tone: 'bg-violet-50 text-violet-600' },
  update: { i: Megaphone, tone: 'bg-emerald-50 text-emerald-600' },
};

export default function Notifications() {
  const d = useCrmData();
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const unread = d.notifications.filter((n) => !n.read);
  const list = [...(tab === 'unread' ? unread : d.notifications)].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const markRead = (id: string) => dispatch(notificationEntity.thunks.update({ id, read: true }));
  const markAll = async () => {
    await Promise.all(unread.map((n) => dispatch(notificationEntity.thunks.update({ id: n.id, read: true }))));
    dispatch(pushToast('success', 'All notifications marked as read'));
  };

  return (
    <>
      <PageHeader title="Notifications" subtitle="Lead assignments, task reminders, meetings and updates." actions={<Button variant="secondary" disabled={!unread.length} onClick={markAll}>Mark all as read</Button>} />
      <div className="mb-4 flex gap-1.5">{(['all', 'unread'] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${tab === t ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}>{t}{t === 'unread' ? ` (${unread.length})` : ''}</button>)}</div>
      {d.loading ? <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20" />)}</div>
        : d.failed ? <ErrorState message={d.error ?? 'Please try again'} onRetry={d.reload} />
        : list.length === 0 ? <div className="card"><EmptyState title={tab === 'unread' ? "You're all caught up" : 'No notifications'} text="New lead assignments and reminders will show up here." /></div>
        : (
          <ul className="card divide-y divide-slate-100">
            {list.map((n) => {
              const { i: I, tone } = icons[n.type] ?? { i: Bell, tone: 'bg-slate-100 text-slate-600' };
              return (
                <li key={n.id}>
                  <button onClick={() => !n.read && markRead(n.id)} className={`flex w-full items-start gap-4 p-4 text-left transition hover:bg-slate-50 ${n.read ? '' : 'bg-brand-50/40'}`}>
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone}`}><I className="h-5 w-5" /></span>
                    <div className="min-w-0 flex-1"><p className="text-sm font-medium text-slate-900">{n.title}</p><p className="text-sm text-slate-600">{n.message}</p><p className="mt-1 text-xs text-slate-500">{timeAgo(n.createdAt)}</p></div>
                    {!n.read && <span aria-label="Unread" className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-600" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
    </>
  );
}
