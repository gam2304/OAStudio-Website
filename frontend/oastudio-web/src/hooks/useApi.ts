import { useEffect, useState } from 'react'

interface ApiState<T> {
  data: T | null
  error: unknown
  loading: boolean
}

// Runs `load` whenever deps change; ignores responses from stale requests
export function useApi<T>(load: () => Promise<T>, deps: unknown[] = []): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({ data: null, error: null, loading: true })

  useEffect(() => {
    let active = true
    setState((s) => ({ ...s, loading: true, error: null }))
    load().then(
      (data) => active && setState({ data, error: null, loading: false }),
      (error) => active && setState({ data: null, error, loading: false }),
    )
    return () => {
      active = false
    }
  }, deps) // `load` is a fresh closure each render; callers list its inputs in deps

  return state
}
