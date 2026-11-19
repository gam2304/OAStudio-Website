// Newest first by updatedAt, then createdAt, then id. Timestamps can be null (old rows), so never call methods on them.
export function byMostRecent<T extends { id: number; updatedAt?: string | null; createdAt?: string | null }>(a: T, b: T) {
  const ta = a.updatedAt ?? a.createdAt ?? ''
  const tb = b.updatedAt ?? b.createdAt ?? ''
  return tb.localeCompare(ta) || b.id - a.id
}
