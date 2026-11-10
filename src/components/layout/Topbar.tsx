import { Bell, Menu } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '@/components/ui/Avatar';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { notifications } from '@/store/entities';
import { setSidebar } from '@/store/uiSlice';
import { roleLabel } from '@/utils/permissions';

export default function Topbar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user)!;
  const { items, status } = useAppSelector((s) => s.notifications);
  const unread = items.filter((n) => n.ownerId === user.id && !n.read).length;

  useEffect(() => { if (status === 'idle') dispatch(notifications.thunks.fetchAll()); }, [status, dispatch]);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-violet-200/60 bg-white/70 px-4 backdrop-blur-md sm:px-6">
      <button onClick={() => dispatch(setSidebar(true))} className="rounded-xl p-2 text-brand-700 hover:bg-violet-100 lg:hidden" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
      <div className="hidden text-sm font-medium text-brand-800 lg:block">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      <div className="flex items-center gap-2 sm:gap-4">
        <Link to="/notifications" className="relative rounded-xl bg-white p-2 text-brand-700 shadow-sm ring-1 ring-violet-100 hover:bg-violet-50" aria-label={`Notifications, ${unread} unread`}>
          <Bell className="h-5 w-5" />
          {unread > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-rose-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
        </Link>
        <Link to="/profile" className="flex items-center gap-3 rounded-full bg-white py-1 pl-1 pr-4 shadow-sm ring-1 ring-violet-100 hover:bg-violet-50">
          <Avatar name={user.name} size={34} />
          <div className="text-left leading-tight">
            <p className="text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="hidden text-xs text-slate-500 sm:block">{roleLabel[user.role]}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
