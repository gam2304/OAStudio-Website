import { useCallback, useEffect, useState } from 'react'

interface ApiState<T> {
  data: T | null
  error: unknown
  loading: boolean
  reload: () => void
}

// Runs `load` whenever deps change (or reload() is called); ignores responses from stale requests
export function useApi<T>(load: () => Promise<T>, deps: unknown[] = []): ApiState<T> {
  const [state, setState] = useState<Omit<ApiState<T>, 'reload'>>({ data: null, error: null, loading: true })
  const [tick, setTick] = useState(0)
  const reload = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let active = true
    // Keep the previous data while reloading so lists don't flash empty
    setState((s) => ({ ...s, loading: true, error: null }))
    load().then(
      (data) => active && setState({ data, error: null, loading: false }),
      (error) => active && setState({ data: null, error, loading: false }),
    )
    return () => {
      active = false
    }
  }, [...deps, tick]) // `load` is a fresh closure each render; callers list its inputs in deps

  return { ...state, reload }
}
