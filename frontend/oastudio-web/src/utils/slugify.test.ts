import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isValidSlug, slugify } from './slugify.ts'

test('lowercases, strips accents and joins words with hyphens', () => {
  assert.equal(slugify('Villa Lumière — Phase 2'), 'villa-lumiere-phase-2')
  assert.equal(slugify('DĀR MIRAL'), 'dar-miral')
  assert.equal(slugify('  Résidence   Floris!! '), 'residence-floris')
})

test('non-latin-only input gives an empty slug', () => assert.equal(slugify('دار'), ''))

test('slugify output is always valid unless empty', () => {
  for (const s of ['A & B', 'x--y', '2024 Villa', 'ÉÉ']) assert.ok(isValidSlug(slugify(s)), s)
})

test('isValidSlug matches the backend rule', () => {
  assert.ok(isValidSlug('residential-buildings'))
  assert.equal(isValidSlug('Villas'), false)
  assert.equal(isValidSlug('a--b'), false)
  assert.equal(isValidSlug('-a'), false)
  assert.equal(isValidSlug(''), false)
})
