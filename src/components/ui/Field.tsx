import { Eye, EyeOff } from 'lucide-react';
import { useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface Wrap { label: string; error?: string; hint?: string; children: ReactNode; htmlFor: string }
export function FieldWrap({ label, error, hint, children, htmlFor }: Wrap) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error ? <p role="alert" className="mt-1 text-xs text-rose-600">{error}</p> : hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string; id: string };
export function TextInput({ label, error, hint, id, className = '', ...rest }: InputProps) {
  return (
    <FieldWrap label={label} error={error} hint={hint} htmlFor={id}>
      <input id={id} aria-invalid={!!error} className={`input ${error ? 'input-error' : ''} ${className}`} {...rest} />
    </FieldWrap>
  );
}

export function PasswordInput({ label, error, hint, id, ...rest }: InputProps) {
  const [show, setShow] = useState(false);
  return (
    <FieldWrap label={label} error={error} hint={hint} htmlFor={id}>
      <div className="relative">
        <input id={id} type={show ? 'text' : 'password'} aria-invalid={!!error} className={`input pr-10 ${error ? 'input-error' : ''}`} {...rest} />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </FieldWrap>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; id: string; options: { value: string; label: string }[] };
export function SelectInput({ label, error, id, options, ...rest }: SelectProps) {
  return (
    <FieldWrap label={label} error={error} htmlFor={id}>
      <select id={id} className={`input ${error ? 'input-error' : ''}`} {...rest}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </FieldWrap>
  );
}

type AreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; id: string };
export function TextArea({ label, error, id, ...rest }: AreaProps) {
  return (
    <FieldWrap label={label} error={error} htmlFor={id}>
      <textarea id={id} rows={3} className={`input resize-none ${error ? 'input-error' : ''}`} {...rest} />
    </FieldWrap>
  );
}
