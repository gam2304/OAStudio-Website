import { Component, type ErrorInfo, type ReactNode } from 'react'

// Without this, any render error unmounts the whole app and leaves a blank page.
// Give it a `key` (e.g. the pathname) so navigating away clears the error.
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Render error', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div role="alert" className="mx-auto max-w-xl py-24 text-center">
        <p className="label-caps mb-4 text-error">Something went wrong</p>
        <p className="mb-8 text-ink/60">This page could not be displayed. Try reloading; if it keeps happening, tell the developer what you were doing.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="label-caps border border-stone/30 px-6 py-3 transition-colors hover:border-bronze hover:text-bronze"
        >
          Reload
        </button>
      </div>
    )
  }
}
