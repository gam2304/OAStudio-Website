import { useEffect, useState } from 'react'
import { withDefaults, type HomeContent } from '../content/homeContent'
import { getHomeContent } from '../services/publicApi'

// Last loaded content, so returning to a page doesn't flash the defaults before the admin's version
let cached: HomeContent | null = null

/** Admin-edited landing page content merged with defaults; null only during the very first load. */
export function useHomeContent() {
  const [content, setContent] = useState(cached)
  useEffect(() => {
    let active = true
    getHomeContent().then(
      (saved) => (cached = withDefaults(saved)),
      () => (cached = cached ?? withDefaults(null)), // API down: show the built-in content
    ).then(() => active && setContent(cached))
    return () => {
      active = false
    }
  }, [])
  return content
}

/** Lets the admin editor show its saved version immediately on the public site after saving. */
export const setCachedHomeContent = (content: HomeContent) => {
  cached = content
}
