// Integration tests: start `npm run test:server` (port 3100, throwaway database) first.
import { test } from 'node:test'
import assert from 'node:assert/strict'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3100'
const uniqueEmail = label => `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.test`

async function post(path, body, cookie) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(body),
  })
  return { res, data: await res.json() }
}

async function me(cookie) {
  const res = await fetch(`${BASE_URL}/api/auth/me`, { headers: cookie ? { Cookie: cookie } : {} })
  return res.json()
}

function sessionCookie(res) {
  const header = res.headers.get('set-cookie') ?? ''
  const match = header.match(/mrittika_session=([^;]*)/)
  return match && match[1] ? `mrittika_session=${match[1]}` : null
}

const validRegistration = email => ({
  name: 'Asha Kulkarni',
  email,
  phone: '9876543210',
  password: 'compost-heap-42',
  acceptTerms: true,
})

test('registering stores the user, starts a session and records T&C consent', async () => {
  const email = uniqueEmail('register')
  const { res, data } = await post('/api/auth/register', validRegistration(email))

  assert.equal(res.status, 201)
  assert.equal(data.user.email, email)
  assert.equal(data.user.role, 'buyer')
  assert.equal(data.user.password_hash, undefined, 'password hash must never be returned')

  const cookie = sessionCookie(res)
  assert.ok(cookie, 'expected a session cookie')
  assert.match(res.headers.get('set-cookie'), /HttpOnly/i)

  const session = await me(cookie)
  assert.equal(session.user.email, email)
  assert.equal(session.consents.length, 1)
  assert.equal(session.consents[0].policy, 'terms')
  assert.equal(session.consents[0].context, 'registration')
  assert.ok(session.consents[0].policyVersion)
  assert.ok(!Number.isNaN(Date.parse(session.consents[0].acceptedAt)))
})

test('registration is rejected when terms are not accepted, and no account is created', async () => {
  const email = uniqueEmail('noterms')
  const { res, data } = await post('/api/auth/register', { ...validRegistration(email), acceptTerms: false })

  assert.equal(res.status, 400)
  assert.ok(data.fieldErrors.acceptTerms)
  assert.equal(sessionCookie(res), null)

  const login = await post('/api/auth/login', { email, password: 'compost-heap-42' })
  assert.equal(login.res.status, 401, 'account must not exist after a rejected registration')
})

test('acceptTerms must be the boolean true, not a truthy string', async () => {
  const { res } = await post('/api/auth/register', { ...validRegistration(uniqueEmail('truthy')), acceptTerms: 'yes' })
  assert.equal(res.status, 400)
})

test('duplicate email is rejected with 409 regardless of case', async () => {
  const email = uniqueEmail('dupe')
  await post('/api/auth/register', validRegistration(email))
  const { res, data } = await post('/api/auth/register', validRegistration(email.toUpperCase()))
  assert.equal(res.status, 409)
  assert.ok(data.fieldErrors.email)
})

test('invalid fields are reported per field', async () => {
  const { res, data } = await post('/api/auth/register', {
    name: 'A',
    email: 'not-an-email',
    phone: '12345',
    password: 'short',
    acceptTerms: true,
  })
  assert.equal(res.status, 400)
  assert.deepEqual(Object.keys(data.fieldErrors).sort(), ['email', 'name', 'password', 'phone'])
})

test('login succeeds with the right password and fails with a generic error otherwise', async () => {
  const email = uniqueEmail('login')
  await post('/api/auth/register', validRegistration(email))

  const ok = await post('/api/auth/login', { email, password: 'compost-heap-42' })
  assert.equal(ok.res.status, 200)
  assert.ok(sessionCookie(ok.res))

  const wrong = await post('/api/auth/login', { email, password: 'wrong-password' })
  const unknown = await post('/api/auth/login', { email: uniqueEmail('ghost'), password: 'whatever-123' })
  assert.equal(wrong.res.status, 401)
  assert.equal(unknown.res.status, 401)
  assert.equal(wrong.data.error, unknown.data.error, 'errors must not reveal whether the email exists')
})

test('logout ends the session server-side', async () => {
  const email = uniqueEmail('logout')
  const { res } = await post('/api/auth/register', validRegistration(email))
  const cookie = sessionCookie(res)

  const out = await post('/api/auth/logout', {}, cookie)
  assert.equal(out.res.status, 200)

  const session = await me(cookie)
  assert.equal(session.user, null, 'old cookie must no longer authenticate')
})

test('malformed JSON body returns 400, not 500', async () => {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{not json',
  })
  assert.equal(res.status, 400)
})
