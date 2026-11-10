import { BookOpen, ChevronDown, LifeBuoy, Mail, MessageCircle, Phone, Rocket } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';

const faqs = [
  { q: 'How do I add a new lead?', a: 'Open Leads and choose Add lead, or use the Add lead shortcut on the dashboard. Name, company, email, phone and estimated value are required.' },
  { q: 'How do I move a deal to another stage?', a: 'On the Pipeline board, drag a deal card to a new column. On touch screens, tap Move on the card and pick a stage.' },
  { q: 'Where can I schedule a follow-up?', a: 'Open a lead and use the Follow-ups section. Follow-ups appear on your dashboard and in the Calendar.' },
  { q: 'What do the task priorities mean?', a: 'High tasks need action first, Medium tasks are important but flexible, and Low tasks can wait. Overdue tasks are highlighted in red.' },
  { q: 'Why can\'t I see Pipeline or Reports?', a: 'Access depends on your role. Employees don\'t have Pipeline or Reports. Ask your manager if you need access.' },
  { q: 'How do I change my password?', a: 'Go to Profile & settings, open the Password tab, enter your current password and choose a new one with at least 8 characters, an uppercase letter and a number.' },
  { q: 'How are goals calculated?', a: 'Goals use your closed-won deals, converted leads, logged activities and completed tasks. You can edit each target from the Goals page.' },
];

const guides = [
  { icon: Rocket, title: 'Getting started', text: 'Add your first lead, log a call and schedule a follow-up in five minutes.', grad: 'from-violet-500 to-fuchsia-500' },
  { icon: BookOpen, title: 'Pipeline playbook', text: 'Keep deals moving: stage definitions and best practices.', grad: 'from-orange-400 to-rose-500' },
  { icon: LifeBuoy, title: 'Troubleshooting', text: 'Fixes for sign-in, verification codes and loading issues.', grad: 'from-teal-400 to-emerald-500' },
];

export default function Help() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <>
      <PageHeader title="Help center" subtitle="Guides, answers and ways to reach support." />
      <div className="grid gap-4 md:grid-cols-3">
        {guides.map(({ icon: Icon, title, text, grad }) => (
          <div key={title} className={`rounded-2xl bg-gradient-to-br ${grad} p-5 text-white shadow-glow`}><span className="inline-flex rounded-xl bg-white/25 p-2.5"><Icon className="h-5 w-5" /></span><h2 className="mt-4 text-lg font-semibold">{title}</h2><p className="mt-1 text-sm text-white/90">{text}</p></div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">Frequently asked questions</h2>
          <ul className="divide-y divide-violet-50">
            {faqs.map((f, i) => (
              <li key={f.q}>
                <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 py-4 text-left"><span className="text-sm font-semibold text-slate-900">{f.q}</span><ChevronDown className={`h-5 w-5 shrink-0 text-brand-600 transition ${open === i ? 'rotate-180' : ''}`} /></button>
                {open === i && <p className="pb-4 text-sm text-slate-600">{f.a}</p>}
              </li>
            ))}
          </ul>
        </div>
        <div className="card h-fit p-5">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Contact support</h2>
          <ul className="space-y-3 text-sm">
            {[{ i: Mail, t: 'support@nexoracrm.com', s: 'Replies within 24 hours', c: 'bg-pink-100 text-pink-600' }, { i: Phone, t: '+91 40 5555 0100', s: 'Mon to Fri, 9am to 6pm', c: 'bg-teal-100 text-teal-600' }, { i: MessageCircle, t: 'Live chat', s: 'Average wait: 3 minutes', c: 'bg-amber-100 text-amber-600' }].map(({ i: I, t, s, c }) => (
              <li key={t} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><span className={`rounded-xl p-2.5 ${c}`}><I className="h-4 w-4" /></span><div><p className="font-medium text-slate-900">{t}</p><p className="text-xs text-slate-500">{s}</p></div></li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
