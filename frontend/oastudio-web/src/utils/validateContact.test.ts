import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validateContact } from './validateContact.ts'

const ok = { senderName: 'Ada', senderEmail: 'ada@example.com', senderPhone: '', projectType: '', subject: '', message: 'Hello' }

test('valid form has no errors', () => assert.deepEqual(validateContact(ok), {}))
test('blank required fields', () =>
  assert.deepEqual(Object.keys(validateContact({ ...ok, senderName: ' ', senderEmail: '', message: '\n' })).sort(), [
    'message', 'senderEmail', 'senderName',
  ]))
test('bad email', () => assert.ok(validateContact({ ...ok, senderEmail: 'ada@' }).senderEmail))
test('length limits', () => {
  assert.ok(validateContact({ ...ok, senderName: 'a'.repeat(151) }).senderName)
  assert.ok(validateContact({ ...ok, subject: 'a'.repeat(256) }).subject)
})
test('phone is optional but must look like a number', () => {
  assert.equal(validateContact({ ...ok, senderPhone: '+216 52 685 812' }).senderPhone, undefined)
  assert.ok(validateContact({ ...ok, senderPhone: 'call me' }).senderPhone)
  assert.ok(validateContact({ ...ok, senderPhone: '123' }).senderPhone)
})
