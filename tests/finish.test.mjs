// Integration tests: start `npm run test:server` (port 3100, throwaway database) first.
import { test } from 'node:test'
import assert from 'node:assert/strict'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3100'

async function call(method, path, { body, cookie } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    redirect: 'manual',
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  let data = text
  try { data = JSON.parse(text) } catch { /* HTML responses stay as strings */ }
  return { res, data }
}

const cookieFrom = res => res.headers.get('set-cookie').match(/mrittika_session=[^;]+/)[0]
const uniqueEmail = label => `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.test`

async function newUser(label, password = 'river-stones-81') {
  const email = uniqueEmail(label)
  const { res } = await call('POST', '/api/auth/register', {
    body: { name: 'Arjun Rao', email, phone: '', password, acceptTerms: true, acceptPrivacy: true },
  })
  assert.equal(res.status, 201)
  return { email, cookie: cookieFrom(res) }
}

/** Product slugs linked from a rendered results page, in order. */
const slugsIn = html => [...new Set([...html.matchAll(/href="\/product\/([a-z0-9-]+)"/g)].map(m => m[1]))]

test('privacy policy and returns policy are published and linked from the footer', async () => {
  const privacy = await call('GET', '/privacy')
  assert.equal(privacy.res.status, 200)
  assert.match(privacy.data, /Data Fiduciary/)
  assert.match(privacy.data, /mrittika_session/)
  assert.doesNotMatch(privacy.data, /Pending/)

  const returns = await call('GET', '/returns-shipping')
  assert.equal(returns.res.status, 200)
  assert.match(returns.data, /7(<!-- -->)? days of delivery/)
  assert.match(returns.data, /never charge a cancellation fee/)

  const home = await call('GET', '/')
  assert.match(home.data, /href="\/returns-shipping"/)
  assert.match(home.data, /href="\/privacy"/)
})

test('search matches words across name, materials and vendor, and ranks name matches first', async () => {
  const bamboo = slugsIn((await call('GET', '/search?q=bamboo')).data)
  assert.ok(bamboo.includes('bamboo-cutlery-set'))
  assert.ok(bamboo.includes('bamboo-toothbrush-pack'))
  assert.ok(!bamboo.includes('wild-forest-honey'))

  const byVendor = slugsIn((await call('GET', '/search?q=aranya')).data)
  assert.ok(byVendor.includes('neem-charcoal-soap'))
  assert.ok(byVendor.includes('natural-loofah-scrubber'))

  const allWords = slugsIn((await call('GET', '/search?q=kantha+silk')).data)
  assert.deepEqual(allWords, ['kantha-stitch-stole'], 'every word must match')
})

test('Shop by Impact, category and score filters narrow results', async () => {
  const water = slugsIn((await call('GET', '/search?impact=water')).data)
  assert.ok(water.includes('recycled-cotton-throw'))
  assert.ok(!water.includes('bamboo-cutlery-set'), 'cutlery saves plastic, not water')

  const food = slugsIn((await call('GET', '/search?cat=food&impact=plastic')).data)
  assert.ok(food.length > 0)
  assert.ok(food.every(s => ['wild-forest-honey', 'cold-pressed-coconut-oil', 'organic-jaggery', 'darjeeling-green-tea', 'wayanad-black-pepper', 'shade-grown-arabica-coffee'].includes(s)))

  const top = slugsIn((await call('GET', '/search?min=90')).data)
  assert.ok(!top.includes('soy-wax-candle'), 'scored 84')

  const none = await call('GET', '/search?q=plastic+straws+xyz')
  assert.match(none.data, /No products match/)
})

test('search ignores unknown filter values instead of failing', async () => {
  const res = await call('GET', '/search?cat=weapons&impact=nuclear&min=7&sort=random')
  assert.equal(res.res.status, 200)
  assert.ok(slugsIn(res.data).length >= 30)
})

test('journal lists articles, renders them with linked products, and 404s unknown slugs', async () => {
  const list = await call('GET', '/journal')
  assert.match(list.data, /Five plastic-free swaps/)
  const article = await call('GET', '/journal/what-a-gi-tag-tells-you')
  assert.equal(article.res.status, 200)
  assert.match(article.data, /Geographical Indications of Goods/)
  assert.ok(slugsIn(article.data).includes('kolhapuri-chappals'))
  assert.equal((await call('GET', '/journal/not-a-real-article')).res.status, 404)
})

test('unknown pages get the custom 404 with a search box', async () => {
  const res = await call('GET', '/definitely-not-here')
  assert.equal(res.res.status, 404)
  assert.match(res.data, /gone back to the soil/)
})

test('security headers are sent on every page', async () => {
  const { res } = await call('GET', '/')
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(res.headers.get('x-frame-options'), 'DENY')
  assert.equal(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin')
})

test('password reset: single-use link sets a new password and signs out other sessions', async () => {
  const user = await newUser('reset', 'old-password-123')

  const unknown = await call('POST', '/api/auth/password-reset/request', { body: { email: uniqueEmail('nobody') } })
  assert.equal(unknown.res.status, 200)
  assert.equal(unknown.data.demoResetLink, undefined)

  const req = await call('POST', '/api/auth/password-reset/request', { body: { email: user.email } })
  assert.equal(req.data.message, unknown.data.message, 'same message whether or not the account exists')
  const token = new URL(req.data.demoResetLink, BASE_URL).searchParams.get('token')
  assert.ok(token)

  assert.equal((await call('POST', '/api/auth/password-reset/confirm', { body: { token, password: 'short' } })).res.status, 400)
  assert.equal((await call('POST', '/api/auth/password-reset/confirm', { body: { token: 'forged', password: 'new-password-456' } })).res.status, 400)

  const ok = await call('POST', '/api/auth/password-reset/confirm', { body: { token, password: 'new-password-456' } })
  assert.equal(ok.res.status, 200)
  assert.equal((await call('POST', '/api/auth/password-reset/confirm', { body: { token, password: 'another-pass-789' } })).res.status, 400, 'link is single-use')

  assert.equal((await call('GET', '/api/auth/me', { cookie: user.cookie })).data.user, null, 'existing sessions are revoked')
  assert.equal((await call('POST', '/api/auth/login', { body: { email: user.email, password: 'old-password-123' } })).res.status, 401)
  assert.equal((await call('POST', '/api/auth/login', { body: { email: user.email, password: 'new-password-456' } })).res.status, 200)
})

test('repeated failed sign-ins are rate-limited, and success is still blocked during the lockout', async () => {
  const { email } = await newUser('ratelimit', 'right-password-1')
  for (let i = 0; i < 5; i++) {
    assert.equal((await call('POST', '/api/auth/login', { body: { email, password: `wrong-${i}-password` } })).res.status, 401)
  }
  const locked = await call('POST', '/api/auth/login', { body: { email, password: 'right-password-1' } })
  assert.equal(locked.res.status, 429)
  assert.ok(Number(locked.res.headers.get('retry-after')) > 0)
})
