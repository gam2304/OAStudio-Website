import { errorMessage } from '../../services/api'

export function Loading({ label = 'Loading' }: { label?: string }) {
  return (
    <p role="status" className="label-caps py-24 text-center text-ink/40">
      {label}…
    </p>
  )
}

export function ErrorState({ error, fallback }: { error: unknown; fallback?: string }) {
  return (
    <p role="alert" className="py-24 text-center text-error">
      {errorMessage(error, fallback ?? 'Content could not be loaded. Please try again later.')}
    </p>
  )
}
