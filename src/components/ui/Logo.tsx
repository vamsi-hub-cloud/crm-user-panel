import { useId } from 'react';

/** Nexora CRM mark: gradient rounded tile with an "N" that doubles as a rising trend line. */
export function LogoMark({ size = 40 }: { size?: number }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Nexora CRM logo">
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c3aed" />
          <stop offset=".55" stopColor="#d946ef" />
          <stop offset="1" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill={`url(#g${id})`} />
      <path d="M20 45V20l24 25V20" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="47" cy="16" r="4.5" fill="#fde68a" />
    </svg>
  );
}

export default function Logo({ light = false, size = 40 }: { light?: boolean; size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark size={size} />
      <div className="leading-tight">
        <p className={`text-lg font-bold tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>Nexora<span className="text-fuchsia-400">CRM</span></p>
        <p className={`text-[11px] ${light ? 'text-white/70' : 'text-slate-500'}`}>Sales workspace</p>
      </div>
    </div>
  );
}
