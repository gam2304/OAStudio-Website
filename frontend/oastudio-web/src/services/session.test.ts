import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isSuperAdmin, parseToken } from './session.ts'

const b64url = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url')
const jwt = (payload: object) => `${b64url({ alg: 'RS256' })}.${b64url(payload)}.sig`

test('parses subject, roles and expiry', () => {
  const s = parseToken(jwt({ sub: 'main', roles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'], exp: 1_900_000_000 }))
  assert.equal(s?.username, 'main')
  assert.deepEqual(s?.roles, ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  assert.equal(s?.expiresAt, 1_900_000_000_000)
  assert.ok(isSuperAdmin(s))
})

test('regular admin is not super admin', () =>
  assert.equal(isSuperAdmin(parseToken(jwt({ sub: 'helper', roles: ['ROLE_ADMIN'], exp: 1 }))), false))

test('rejects malformed tokens', () => {
  assert.equal(parseToken('not-a-jwt'), null)
  assert.equal(parseToken(jwt({ roles: [] })), null)
  assert.equal(parseToken('a.@@@.c'), null)
})

test('missing session is not super admin', () => assert.equal(isSuperAdmin(null), false))
