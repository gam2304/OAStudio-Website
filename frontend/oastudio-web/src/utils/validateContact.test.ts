import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validateContact } from './validateContact.ts'

const ok = { senderName: 'Ada', senderEmail: 'ada@example.com', subject: '', message: 'Hello' }

test('valid form has no errors', () => assert.deepEqual(validateContact(ok), {}))
test('blank required fields', () =>
  assert.deepEqual(Object.keys(validateContact({ senderName: ' ', senderEmail: '', subject: '', message: '\n' })).sort(), [
    'message', 'senderEmail', 'senderName',
  ]))
test('bad email', () => assert.ok(validateContact({ ...ok, senderEmail: 'ada@' }).senderEmail))
test('length limits', () => {
  assert.ok(validateContact({ ...ok, senderName: 'a'.repeat(151) }).senderName)
  assert.ok(validateContact({ ...ok, subject: 'a'.repeat(256) }).subject)
})
