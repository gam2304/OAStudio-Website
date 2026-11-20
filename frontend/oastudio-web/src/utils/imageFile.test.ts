import assert from 'node:assert/strict'
import { test } from 'node:test'
import { imageFileError, MAX_IMAGE_BYTES, reorder } from './imageFile.ts'

test('accepts jpg, png and webp up to 10 MB', () => {
  for (const type of ['image/jpeg', 'image/png', 'image/webp'])
    assert.equal(imageFileError({ type, size: MAX_IMAGE_BYTES, name: 'a' }), null)
})

test('rejects other types, empty and oversized files', () => {
  assert.match(imageFileError({ type: 'image/gif', size: 10, name: 'a.gif' })!, /only JPG/)
  assert.match(imageFileError({ type: 'image/png', size: 0, name: 'a.png' })!, /empty/)
  assert.match(imageFileError({ type: 'image/png', size: MAX_IMAGE_BYTES + 1, name: 'a.png' })!, /10 MB/)
})

const imgs = (orders: number[]) => orders.map((displayOrder, i) => ({ id: i + 1, displayOrder }))

test('moving down swaps neighbours and returns only changed items', () => {
  const changes = reorder(imgs([0, 1, 2]), 0, 1)
  assert.deepEqual(changes.map((c) => [c.item.id, c.displayOrder]), [[2, 0], [1, 1]])
})

test('normalises gaps and duplicates to 0..n-1', () => {
  const changes = reorder(imgs([5, 5, 9]), 2, 0)
  assert.deepEqual(changes.map((c) => [c.item.id, c.displayOrder]), [[3, 0], [1, 1], [2, 2]])
})

test('no-op move changes nothing', () => assert.deepEqual(reorder(imgs([0, 1]), 1, 1), []))
