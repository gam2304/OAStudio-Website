import assert from 'node:assert/strict'
import { test } from 'node:test'
import { SECTION_IDS, defaultHomeContent, tr, withDefaults } from './homeContent.ts'

test('nothing saved gives the defaults', () => assert.deepEqual(withDefaults(null), defaultHomeContent))

test('keeps saved order and visibility, appends unknown-to-admin sections', () => {
  const c = withDefaults({ sections: [{ id: 'cta', visible: false }, { id: 'hero', visible: true }] })
  assert.deepEqual(c.sections.slice(0, 2), [{ id: 'cta', visible: false }, { id: 'hero', visible: true }])
  assert.equal(c.sections.length, SECTION_IDS.length)
})

test('drops unknown and duplicate section ids', () => {
  const c = withDefaults({ sections: [{ id: 'hero', visible: true }, { id: 'bogus' as never, visible: true }, { id: 'hero', visible: false }] })
  assert.equal(c.sections.filter((s) => s.id === 'hero').length, 1)
  assert.ok(!c.sections.some((s) => (s.id as string) === 'bogus'))
})

test('partial section keeps default fields', () => {
  const c = withDefaults({ founder: { name: 'X' } })
  assert.equal(c.founder.name, 'X')
  assert.deepEqual(c.founder.bio, defaultHomeContent.founder.bio)
})

test('tr falls back to the other language', () => {
  assert.equal(tr({ fr: 'Bonjour', en: '' }, 'en'), 'Bonjour')
  assert.equal(tr({ fr: 'Bonjour', en: 'Hello' }, 'en'), 'Hello')
})
