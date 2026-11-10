import { AlertTriangle, Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import Button from './Button';

export const Skeleton = ({ className = '' }: { className?: string }) => <div className={`animate-pulse rounded-lg bg-slate-200/70 ${className}`} />;

export function PageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}</div>
      <Skeleton className="h-72" />
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="mb-3 rounded-full bg-slate-100 p-3 text-slate-400"><Inbox className="h-6 w-6" /></span>
      <p className="font-medium text-slate-900">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <span className="mb-3 rounded-full bg-rose-50 p-3 text-rose-500"><AlertTriangle className="h-6 w-6" /></span>
      <p className="font-medium text-slate-900">We couldn't load this page</p>
      <p className="mt-1 text-sm text-slate-500">{message}</p>
      {onRetry && <Button className="mt-4" variant="secondary" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
