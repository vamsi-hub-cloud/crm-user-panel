import { initials } from '@/utils/format';

const colors = ['from-violet-500 to-fuchsia-500', 'from-orange-400 to-rose-500', 'from-teal-400 to-emerald-500', 'from-amber-400 to-orange-500', 'from-fuchsia-500 to-pink-500', 'from-emerald-400 to-teal-500'];

export default function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const c = colors[name.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0) % colors.length];
  return (
    <span style={{ width: size, height: size, fontSize: size * 0.38 }} className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white shadow-sm ${c}`} aria-hidden>
      {initials(name)}
    </span>
  );
}
