import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

// Admin form primitives following DESIGN.md: 0px corners, bottom-border inputs, label-caps labels

const control =
  'w-full appearance-none rounded-none border-0 border-b border-stone/30 bg-transparent py-2 text-ink outline-none transition-colors focus:border-bronze aria-[invalid=true]:border-error'

interface FieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  optional?: boolean
}

function FieldShell({ id, label, error, hint, optional, children }: FieldProps & { children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="label-caps mb-2 block text-ink/60">
        {label}
        {optional && <span className="ml-2 normal-case tracking-normal text-ink/30">(optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-error">{error}</p>
      ) : (
        hint && <p className="mt-2 text-xs text-ink/40">{hint}</p>
      )}
    </div>
  )
}

const aria = (id: string, error?: string) => ({
  'aria-invalid': !!error,
  'aria-describedby': error ? `${id}-error` : undefined,
})

export function TextField({ id, label, error, hint, optional, ...rest }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell {...{ id, label, error, hint, optional }}>
      <input id={id} className={control} {...aria(id, error)} {...rest} />
    </FieldShell>
  )
}

export function TextArea({ id, label, error, hint, optional, ...rest }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell {...{ id, label, error, hint, optional }}>
      <textarea id={id} rows={4} className={`${control} resize-y`} {...aria(id, error)} {...rest} />
    </FieldShell>
  )
}

export function SelectField({ id, label, error, hint, optional, children, ...rest }: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldShell {...{ id, label, error, hint, optional }}>
      <select id={id} className={`${control} [&>option]:bg-void`} {...aria(id, error)} {...rest}>
        {children}
      </select>
    </FieldShell>
  )
}

const variants = {
  primary: 'border border-transparent bg-paper px-6 py-3 text-void hover:border-bronze hover:bg-void hover:text-bronze',
  secondary: 'border border-stone/30 px-6 py-3 text-ink hover:border-bronze hover:text-bronze',
  link: 'text-ink/60 hover:text-bronze',
  danger: 'text-error hover:text-bronze',
}

export function Button({ variant = 'primary', className = '', ...rest }: { variant?: keyof typeof variants } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`label-caps press rounded-none disabled:opacity-50 ${variants[variant]} ${className}`}
      {...rest}
    />
  )
}

export function Notice({ tone, children }: { tone: 'ok' | 'error'; children: ReactNode }) {
  return tone === 'ok' ? (
    <p role="status" className="text-sm text-gold">{children}</p>
  ) : (
    <p role="alert" className="text-sm text-error">{children}</p>
  )
}

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
      <div>
        <p className="label-caps mb-3 text-ink/50">{eyebrow}</p>
        <h1 className="headline-lg">{title}</h1>
      </div>
      {children}
    </div>
  )
}

const statusTone: Record<string, string> = {
  PUBLISHED: 'text-ink/80',
  DRAFT: 'text-ink/50',
  ARCHIVED: 'text-ink/30',
  NEW: 'text-gold',
  READ: 'text-ink/50',
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={`label-caps ${statusTone[status] ?? 'text-ink/50'}`}>{status.charAt(0) + status.slice(1).toLowerCase()}</span>
}

export const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
