import { Activity, BarChart3, Bell, CalendarDays, CheckSquare, Crown, HelpCircle, KanbanSquare, LayoutDashboard, LogOut, Target, Trophy, UserCircle, Users, X, type LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import Avatar from '@/components/ui/Avatar';
import Logo from '@/components/ui/Logo';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { logout } from '@/store/authSlice';
import { setSidebar } from '@/store/uiSlice';
import { can, roleLabel } from '@/utils/permissions';
import type { Permission } from '@/types';

interface Item { to: string; label: string; icon: LucideIcon; perm: Permission; color: string }
const groups: { title: string; items: Item[] }[] = [
  { title: 'Overview', items: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, perm: 'dashboard', color: 'text-violet-300' },
    { to: '/calendar', label: 'Calendar', icon: CalendarDays, perm: 'calendar', color: 'text-sky-300' },
    { to: '/goals', label: 'Goals', icon: Trophy, perm: 'goals', color: 'text-amber-300' },
  ] },
  { title: 'Sales', items: [
    { to: '/leads', label: 'Leads', icon: Target, perm: 'leads', color: 'text-pink-300' },
    { to: '/pipeline', label: 'Pipeline', icon: KanbanSquare, perm: 'pipeline', color: 'text-orange-300' },
    { to: '/customers', label: 'Customers', icon: Users, perm: 'customers', color: 'text-emerald-300' },
  ] },
  { title: 'Work', items: [
    { to: '/tasks', label: 'Tasks', icon: CheckSquare, perm: 'tasks', color: 'text-yellow-300' },
    { to: '/activities', label: 'Activities', icon: Activity, perm: 'activities', color: 'text-teal-300' },
    { to: '/reports', label: 'Reports', icon: BarChart3, perm: 'reports', color: 'text-fuchsia-300' },
    { to: '/team', label: 'Team leaderboard', icon: Crown, perm: 'team_view', color: 'text-amber-300' },
  ] },
  { title: 'Account', items: [
    { to: '/notifications', label: 'Notifications', icon: Bell, perm: 'notifications', color: 'text-rose-300' },
    { to: '/profile', label: 'Profile & settings', icon: UserCircle, perm: 'profile', color: 'text-cyan-300' },
    { to: '/help', label: 'Help center', icon: HelpCircle, perm: 'help', color: 'text-lime-300' },
  ] },
];

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.sidebarOpen);
  const user = useAppSelector((s) => s.auth.user)!;
  const close = () => dispatch(setSidebar(false));

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={close} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-gradient-to-b from-[#2e1065] via-[#4c1d95] to-[#701a75] text-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center justify-between px-5">
          <Logo light />
          <button onClick={close} className="rounded p-1 text-white/70 hover:bg-white/10 lg:hidden" aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>

        <div className="mx-4 mb-3 flex items-center gap-3 rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
          <Avatar name={user.name} size={40} />
          <div className="min-w-0 leading-tight"><p className="truncate text-sm font-semibold">{user.name}</p><p className="truncate text-xs text-white/70">{roleLabel[user.role]}</p></div>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 pb-3" aria-label="Main">
          {groups.map((g) => {
            const items = g.items.filter((n) => can(user.role, n.perm));
            if (!items.length) return null;
            return (
              <div key={g.title}>
                <p className="mb-1.5 px-3 text-xs font-semibold text-white/50">{g.title}</p>
                <div className="space-y-1">
                  {items.map(({ to, label, icon: Icon, color }) => (
                    <NavLink key={to} to={to} onClick={close} className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-white/20 text-white shadow-lg ring-1 ring-white/20' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                      <Icon className={`h-5 w-5 ${color}`} /> {label}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button onClick={() => dispatch(logout())} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white">
            <LogOut className="h-5 w-5" /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
