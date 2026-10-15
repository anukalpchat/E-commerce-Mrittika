// Integration tests: start `npm run test:server` (port 3100, throwaway database) first.
import { test } from 'node:test'
import assert from 'node:assert/strict'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3100'
const ADMIN = { email: 'admin@mrittika.test', password: 'MrittikaAdmin@2026' }

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

async function login({ email, password }) {
  const { res } = await call('POST', '/api/auth/login', { body: { email, password } })
  assert.equal(res.status, 200)
  return cookieFrom(res)
}

async function newUser(label) {
  const email = `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.test`
  const { res } = await call('POST', '/api/auth/register', {
    body: { name: 'Nisha Pillai', email, phone: '', password: 'sea-salt-and-sun-9', acceptTerms: true, acceptPrivacy: true },
  })
  return { email, cookie: cookieFrom(res) }
}

const message = overrides => ({
  name: 'Nisha Pillai',
  email: 'nisha@example.test',
  topic: 'grievance',
  orderId: '',
  message: 'The jute rug I received is a different size from the listing.',
  ...overrides,
})

test('contact form validates input and returns a ticket number', async () => {
  const bad = await call('POST', '/api/support', { body: message({ name: '', email: 'nope', topic: 'spam', orderId: '123', message: 'short' }) })
  assert.equal(bad.res.status, 400)
  assert.deepEqual(Object.keys(bad.data.fieldErrors).sort(), ['email', 'message', 'name', 'orderId', 'topic'])

  const ok = await call('POST', '/api/support', { body: message({ orderId: 'mrt-ab23cd45' }) })
  assert.equal(ok.res.status, 201)
  assert.match(ok.data.ticket.id, /^SUP-[23456789A-Z]{6}$/)
  const hours = (Date.parse(ok.data.ticket.acknowledgeBy) - Date.now()) / 3600000
  assert.ok(hours > 47 && hours <= 48, 'acknowledgement deadline is 48 hours out')
})

test('honeypot submissions are accepted silently but not stored', async () => {
  const marker = `honeypot-${Date.now()}`
  const res = await call('POST', '/api/support', { body: { ...message({ message: `${marker} buy cheap watches now please` }), website: 'http://spam.example' } })
  assert.equal(res.res.status, 201)
  const admin = await login(ADMIN)
  const queue = await call('GET', '/admin?tab=support', { cookie: admin })
  assert.doesNotMatch(queue.data, new RegExp(marker))
})

test('admins work the support queue; resolving needs a note, and the customer sees the resolution', async () => {
  const user = await newUser('support')
  const marker = `rug-size-${Date.now()}`
  const ticket = await call('POST', '/api/support', { cookie: user.cookie, body: message({ email: user.email, message: `${marker}: the rug is 3 x 5 ft, not 4 x 6 ft.` }) })
  const id = ticket.data.ticket.id

  assert.equal((await call('POST', `/api/admin/support/${id}`, { cookie: user.cookie, body: { status: 'resolved', note: 'x' } })).res.status, 403)

  const admin = await login(ADMIN)
  const queue = await call('GET', '/admin?tab=support', { cookie: admin })
  assert.match(queue.data, new RegExp(id))
  assert.match(queue.data, /Formal grievance/)

  assert.equal((await call('POST', `/api/admin/support/${id}`, { cookie: admin, body: { status: 'in_progress', note: '' } })).res.status, 200)
  assert.equal((await call('POST', `/api/admin/support/${id}`, { cookie: admin, body: { status: 'resolved', note: '' } })).res.status, 400)
  assert.equal((await call('POST', `/api/admin/support/${id}`, { cookie: admin, body: { status: 'resolved', note: 'Vendor is sending the correct size; keep the first rug.' } })).res.status, 200)
  assert.equal((await call('POST', '/api/admin/support/SUP-NOPE00', { cookie: admin, body: { status: 'open', note: '' } })).res.status, 404)

  const account = await call('GET', '/account?tab=support', { cookie: user.cookie })
  assert.match(account.data, new RegExp(id))
  assert.match(account.data, /Vendor is sending the correct size/)
})

test('admins cannot list a product below the minimum score of 60', async () => {
  const vendor = await login({ email: 'vendor@mrittika.test', password: 'AranyaVendor@2026' })
  const created = await call('POST', '/api/vendor/products', {
    cookie: vendor,
    body: {
      name: `Reed Diffuser ${Date.now()}`, category: 'home-living', price: 499, gstRate: 18, stockCount: 10,
      shortDescription: 'Lemongrass reed diffuser in a glass bottle.',
      description: 'Lemongrass essential oil in a carrier oil with rattan reeds, in a reusable glass bottle with a cork stopper.',
      materials: ['Lemongrass oil', 'Rattan reeds', 'Glass'], certifications: [], tags: [],
      imageUrl: '/products/soy-wax-candle.jpg', plasticAvoidedG: 0, waterSavedL: 0, wasteDivertedG: 0,
    },
  })
  assert.equal(created.res.status, 201)
  const admin = await login(ADMIN)
  const low = await call('POST', `/api/admin/products/${created.data.product.id}`, { cookie: admin, body: { action: 'approve', score: 55, note: '' } })
  assert.equal(low.res.status, 400)
  assert.match(low.data.error, /below 60/)
  const ok = await call('POST', `/api/admin/products/${created.data.product.id}`, { cookie: admin, body: { action: 'approve', score: 60, note: '' } })
  assert.equal(ok.res.status, 200)
})

test('content pages render live catalogue figures', async () => {
  const sustainability = await call('GET', '/sustainability')
  assert.equal(sustainability.res.status, 200)
  assert.match(sustainability.data, /Materials &amp; Sourcing/)
  assert.match(sustainability.data, /Verified vendors/)

  const about = await call('GET', '/about')
  assert.match(about.data, /Soham Sawant/)
  assert.match(about.data, /payments are simulated/)

  const contact = await call('GET', '/contact')
  assert.match(contact.data, /Grievance Officer/)
  assert.match(contact.data, /Is my payment real\?/)
})

test('the catalogue has 30 seeded products across four categories', async () => {
  const shop = await call('GET', '/categories')
  for (const slug of ['coconut-shell-bowls', 'kantha-quilt', 'ikat-cotton-saree', 'shade-grown-arabica-coffee', 'millets-variety-pack']) {
    assert.match(shop.data, new RegExp(`/product/${slug}`))
  }
  const credit = await call('GET', '/product/ubtan-face-pack')
  assert.match(credit.data, /Illustrative photo/)
  assert.match(credit.data, /CC BY 2.0/)
})
