import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/hooks/redux';
import { can } from '@/utils/permissions';
import type { Permission } from '@/types';

export function RequireAuth() {
  const user = useAppSelector((s) => s.auth.user);
  const loc = useLocation();
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: loc.pathname }} />;
}

export function PublicOnly() {
  const user = useAppSelector((s) => s.auth.user);
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

export function RequirePermission({ perm, children }: { perm: Permission; children: JSX.Element }) {
  const role = useAppSelector((s) => s.auth.user?.role);
  if (can(role, perm)) return children;
  return (
    <div className="card mx-auto mt-10 flex max-w-md flex-col items-center px-6 py-12 text-center">
      <span className="mb-3 rounded-full bg-amber-50 p-3 text-amber-600"><ShieldAlert className="h-6 w-6" /></span>
      <h1 className="font-semibold text-slate-900">You don't have access to this page</h1>
      <p className="mt-1 text-sm text-slate-500">Your role doesn't include this module. Ask your manager if you need access.</p>
      <Link to="/dashboard" className="mt-4 text-sm font-medium text-brand-600 hover:text-brand-700">Back to dashboard</Link>
    </div>
  );
}

export function RequirePending({ purpose, children }: { purpose: 'login' | 'reset'; children: JSX.Element }) {
  const pending = useAppSelector((s) => s.auth.pending);
  return pending?.purpose === purpose ? children : <Navigate to={purpose === 'login' ? '/login' : '/forgot-password'} replace />;
}

export function RequireResetVerified({ children }: { children: JSX.Element }) {
  const verified = useAppSelector((s) => s.auth.resetVerified);
  return verified ? children : <Navigate to="/forgot-password" replace />;
}
