import assert from 'node:assert/strict'
import { test } from 'node:test'
import { byMostRecent } from './sortByRecent.ts'

test('sorts newest first and tolerates null timestamps', () => {
  const rows = [
    { id: 1, updatedAt: null, createdAt: null },
    { id: 2, updatedAt: '2026-11-18T10:00:00', createdAt: null },
    { id: 3, updatedAt: null, createdAt: '2026-11-19T09:00:00' },
    { id: 4, updatedAt: null, createdAt: null },
  ]
  assert.deepEqual([...rows].sort(byMostRecent).map((r) => r.id), [3, 2, 4, 1])
})
