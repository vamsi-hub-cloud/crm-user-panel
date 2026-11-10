import type { ReactNode } from 'react';

export default function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="hidden h-10 w-1.5 rounded-full bg-gradient-to-b from-brand-600 via-fuchsia-500 to-orange-400 sm:block" />
        <div>
          <h1 className="gradient-text text-2xl font-bold sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-slate-600">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
