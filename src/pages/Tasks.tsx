import { Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { SelectInput, TextArea, TextInput } from '@/components/ui/Field';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import SearchBox from '@/components/ui/SearchBox';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useCrmData } from '@/hooks/useCrmData';
import { tasks as taskEntity } from '@/store/entities';
import { pushToast } from '@/store/uiSlice';
import { isOverdue, isToday, label, shortDate, toDateInput } from '@/utils/format';
import { clean, required, type Errors } from '@/utils/validation';
import type { Priority, Task, TaskStatus } from '@/types';

type Draft = { title: string; description: string; priority: Priority; status: TaskStatus; dueDate: string };
const priorities: Priority[] = ['low', 'medium', 'high'];
const statuses: TaskStatus[] = ['todo', 'in_progress', 'done'];

export default function Tasks() {
  const d = useCrmData();
  const dispatch = useAppDispatch();
  const saving = useAppSelector((s) => s.tasks.saving);
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'all' | TaskStatus>('all');
  const [prio, setPrio] = useState<'all' | Priority>('all');
  const [form, setForm] = useState<{ open: boolean; task?: Task }>({ open: false });
  const [del, setDel] = useState<Task | null>(null);

  useEffect(() => { if (params.get('new')) { setForm({ open: true }); setParams({}, { replace: true }); } }, [params, setParams]);

  const list = useMemo(() => d.tasks
    .filter((t) => (tab === 'all' || t.status === tab) && (prio === 'all' || t.priority === prio) && t.title.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => Number(a.status === 'done') - Number(b.status === 'done') || +new Date(a.dueDate) - +new Date(b.dueDate)), [d.tasks, q, tab, prio]);

  const toggle = async (t: Task) => {
    const done = t.status !== 'done';
    const res = await dispatch(taskEntity.thunks.update({ id: t.id, status: done ? 'done' : 'todo', completedAt: done ? new Date().toISOString() : undefined }));
    if (res.meta.requestStatus === 'fulfilled') dispatch(pushToast('success', done ? 'Task completed' : 'Task reopened'));
  };

  const submit = async (data: Draft) => {
    const payload = { ...data, dueDate: new Date(data.dueDate + 'T17:00:00').toISOString() };
    const res = form.task ? await dispatch(taskEntity.thunks.update({ id: form.task.id, ...payload })) : await dispatch(taskEntity.thunks.create({ ...payload, ownerId: d.user.id, createdAt: new Date().toISOString() }));
    if (res.meta.requestStatus === 'fulfilled') { dispatch(pushToast('success', form.task ? 'Task updated' : 'Task created')); setForm({ open: false }); } else dispatch(pushToast('error', 'Could not save the task'));
  };

  const counts = { all: d.tasks.length, todo: d.tasks.filter((t) => t.status === 'todo').length, in_progress: d.tasks.filter((t) => t.status === 'in_progress').length, done: d.tasks.filter((t) => t.status === 'done').length };

  return (
    <>
      <PageHeader title="Tasks" subtitle="Plan your work with priorities and deadlines." actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setForm({ open: true })}>New task</Button>} />
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(['all', ...statuses] as const).map((s) => <button key={s} onClick={() => setTab(s)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${tab === s ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}>{s === 'all' ? 'All' : label(s)} ({counts[s]})</button>)}
      </div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <SearchBox value={q} onChange={setQ} placeholder="Search tasks" />
        <select aria-label="Filter by priority" value={prio} onChange={(e) => setPrio(e.target.value as 'all' | Priority)} className="input sm:w-44"><option value="all">All priorities</option>{priorities.map((p) => <option key={p} value={p}>{label(p)} priority</option>)}</select>
      </div>

      {d.loading ? <div className="space-y-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
        : d.failed ? <ErrorState message={d.error ?? 'Please try again'} onRetry={d.reload} />
        : list.length === 0 ? <div className="card"><EmptyState title={d.tasks.length ? 'No tasks match your filters' : 'No tasks yet'} text={d.tasks.length ? 'Clear a filter to see more.' : 'Create a task to keep track of what is next.'} /></div>
        : (
          <ul className="card divide-y divide-slate-100">
            {list.map((t) => (
              <li key={t.id} className="flex items-start gap-3 p-4">
                <button onClick={() => toggle(t)} aria-label={t.status === 'done' ? `Reopen ${t.title}` : `Complete ${t.title}`} className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${t.status === 'done' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 hover:border-brand-500'}`}>{t.status === 'done' && <Check className="h-3.5 w-3.5" />}</button>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${t.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{t.title}</p>
                  {t.description && <p className="mt-0.5 text-sm text-slate-500">{t.description}</p>}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge value={t.priority} text={`${label(t.priority)} priority`} /><Badge value={t.status} />
                    <span className={`text-xs ${t.status !== 'done' && isOverdue(t.dueDate) && !isToday(t.dueDate) ? 'font-medium text-rose-600' : 'text-slate-500'}`}>{t.status !== 'done' && isToday(t.dueDate) ? 'Due today' : `${t.status !== 'done' && isOverdue(t.dueDate) ? 'Overdue · ' : 'Due '}${shortDate(t.dueDate)}`}</span>
                  </div>
                </div>
                <div className="flex shrink-0">
                  <button aria-label={`Edit ${t.title}`} onClick={() => setForm({ open: true, task: t })} className="rounded p-1.5 text-slate-500 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button>
                  <button aria-label={`Delete ${t.title}`} onClick={() => setDel(t)} className="rounded p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}

      {form.open && <TaskForm key={form.task?.id ?? 'new'} initial={form.task} saving={saving} onClose={() => setForm({ open: false })} onSubmit={submit} />}
      <ConfirmDialog open={!!del} title="Delete task" message={`Delete "${del?.title}"? This can't be undone.`} onClose={() => setDel(null)} onConfirm={async () => { if (del) { await dispatch(taskEntity.thunks.remove(del.id)); dispatch(pushToast('success', 'Task deleted')); setDel(null); } }} />
    </>
  );
}

function TaskForm({ initial, saving, onClose, onSubmit }: { initial?: Task; saving: boolean; onClose: () => void; onSubmit: (d: Draft) => void }) {
  const [f, setF] = useState<Draft>({ title: initial?.title ?? '', description: initial?.description ?? '', priority: initial?.priority ?? 'medium', status: initial?.status ?? 'todo', dueDate: toDateInput(initial?.dueDate ?? new Date(Date.now() + 86400000).toISOString()) });
  const [errors, setErrors] = useState<Errors<Draft>>({});
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = clean<Draft>({ title: required(f.title, 'Title'), dueDate: required(f.dueDate, 'Due date') });
    setErrors(v);
    if (!Object.keys(v).length) onSubmit({ ...f, title: f.title.trim() });
  };
  return (
    <Modal open onClose={onClose} title={initial ? 'Edit task' : 'New task'} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="task-form" loading={saving}>{initial ? 'Save changes' : 'Create task'}</Button></>}>
      <form id="task-form" onSubmit={submit} noValidate className="space-y-4">
        <TextInput id="task-title" label="Title" value={f.title} error={errors.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        <TextArea id="task-desc" label="Description" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectInput id="task-priority" label="Priority" value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value as Priority })} options={priorities.map((p) => ({ value: p, label: label(p) }))} />
          <SelectInput id="task-status" label="Status" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as TaskStatus })} options={statuses.map((s) => ({ value: s, label: label(s) }))} />
          <TextInput id="task-due" label="Deadline" type="date" value={f.dueDate} error={errors.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} />
        </div>
      </form>
    </Modal>
  );
}
