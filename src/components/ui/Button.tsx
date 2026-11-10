import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md';
  loading?: boolean;
  icon?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: 'bg-gradient-to-r from-brand-600 via-fuchsia-600 to-orange-500 text-white shadow-glow hover:brightness-110',
  secondary: 'bg-white text-brand-800 border border-violet-200 hover:bg-violet-50',
  ghost: 'text-slate-600 hover:bg-violet-50',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
};

export default function Button({ variant = 'primary', size = 'md', loading, icon, children, className = '', disabled, ...rest }: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} ${variants[variant]} ${className}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
