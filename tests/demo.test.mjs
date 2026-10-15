// Integration tests: start `npm run test:server` (port 3100, throwaway database) first.
import { test } from 'node:test'
import assert from 'node:assert/strict'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3100'

/** Minimal cookie jar: applies Set-Cookie headers (including deletions) like a browser would. */
function jar() {
  const cookies = new Map()
  return {
    header: () => [...cookies].map(([k, v]) => `${k}=${v}`).join('; '),
    absorb(res) {
      for (const line of res.headers.getSetCookie()) {
        const [pair, ...attrs] = line.split(';')
        const [name, ...rest] = pair.split('=')
        const value = rest.join('=')
        const expired = attrs.some(a => /expires=thu, 01 jan 1970/i.test(a.trim()) || /max-age=0/i.test(a.trim()))
        if (!value || expired) cookies.delete(name.trim())
        else cookies.set(name.trim(), value)
      }
    },
    has: name => cookies.has(name),
  }
}

async function call(cookies, method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    redirect: 'manual',
    headers: { 'Content-Type': 'application/json', ...(cookies.header() ? { Cookie: cookies.header() } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  cookies.absorb(res)
  const text = await res.text()
  let data = text
  try { data = JSON.parse(text) } catch { /* HTML stays as text */ }
  return { res, data }
}

const me = async cookies => (await call(cookies, 'GET', '/api/auth/me')).data

test('signed-out visitors can enter any demo account in one click', async () => {
  const c = jar()
  assert.equal((await me(c)).demo.enabled, true)

  const sw = await call(c, 'POST', '/api/auth/demo-switch', { account: 'admin' })
  assert.equal(sw.res.status, 200)
  assert.equal(sw.data.redirectTo, '/admin')
  const session = await me(c)
  assert.equal(session.user.role, 'admin')
  assert.equal(session.demo.returnTo, null, 'nothing to return to when starting signed out')
  assert.equal((await call(c, 'GET', '/admin')).res.status, 200)
})

test('switching from your own account remembers it, and "back" restores it', async () => {
  const c = jar()
  const email = `presenter-${Date.now()}@example.test`
  await call(c, 'POST', '/api/auth/register', {
    name: 'Anu Presenter', email, phone: '', password: 'viva-day-2026', acceptTerms: true, acceptPrivacy: true,
  })
  assert.equal((await me(c)).user.email, email)

  await call(c, 'POST', '/api/auth/demo-switch', { account: 'vendor' })
  let session = await me(c)
  assert.equal(session.user.email, 'vendor@mrittika.test')
  assert.equal(session.demo.returnTo, 'Anu Presenter')

  await call(c, 'POST', '/api/auth/demo-switch', { account: 'admin' })
  session = await me(c)
  assert.equal(session.user.role, 'admin')
  assert.equal(session.demo.returnTo, 'Anu Presenter', 'hopping between demo accounts keeps the way back')

  const back = await call(c, 'POST', '/api/auth/demo-switch', { account: 'return' })
  assert.equal(back.res.status, 200)
  session = await me(c)
  assert.equal(session.user.email, email)
  assert.equal(session.demo.returnTo, null)
  assert.equal(c.has('mrittika_demo_origin'), false)

  assert.equal((await call(c, 'POST', '/api/auth/demo-switch', { account: 'return' })).res.status, 400)
})

test('the demo buyer exists, and unknown targets are rejected', async () => {
  const c = jar()
  await call(c, 'POST', '/api/auth/demo-switch', { account: 'buyer' })
  assert.equal((await me(c)).user.email, 'buyer@mrittika.test')
  assert.equal((await call(c, 'POST', '/api/auth/demo-switch', { account: 'superuser' })).res.status, 400)
})

test('signing out also forgets the way back', async () => {
  const c = jar()
  const email = `signout-${Date.now()}@example.test`
  await call(c, 'POST', '/api/auth/register', {
    name: 'Short Visit', email, phone: '', password: 'viva-day-2026', acceptTerms: true, acceptPrivacy: true,
  })
  await call(c, 'POST', '/api/auth/demo-switch', { account: 'admin' })
  await call(c, 'POST', '/api/auth/logout', {})
  const session = await me(c)
  assert.equal(session.user, null)
  assert.equal(session.demo.returnTo, null)
})
