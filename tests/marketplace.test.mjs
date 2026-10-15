// Integration tests: start `npm run test:server` (port 3100, throwaway database) first.
import { test } from 'node:test'
import assert from 'node:assert/strict'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3100'
const ADMIN = { email: 'admin@mrittika.test', password: 'MrittikaAdmin@2026' }
const DEMO_VENDOR = { email: 'vendor@mrittika.test', password: 'AranyaVendor@2026' }
const PNG_1PX = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
const ADDRESS = { name: 'Rohan Das', phone: '9830012345', line1: '22 Lake Road', line2: '', city: 'Kolkata', state: 'West Bengal', pincode: '700029' }

const unique = label => `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

async function call(method, path, { body, cookie, raw } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    redirect: 'manual',
    headers: { ...(raw ? {} : { 'Content-Type': 'application/json' }), ...(cookie ? { Cookie: cookie } : {}) },
    body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
  })
  const text = await res.text()
  let data = text
  try { data = JSON.parse(text) } catch { /* HTML or plain text responses stay as strings */ }
  return { res, data }
}

const cookieFrom = res => res.headers.get('set-cookie').match(/mrittika_session=[^;]+/)[0]

async function login({ email, password }) {
  const { res } = await call('POST', '/api/auth/login', { body: { email, password } })
  assert.equal(res.status, 200, `login failed for ${email}`)
  return cookieFrom(res)
}

async function newUser(label) {
  const email = `${unique(label)}@example.test`
  const { res } = await call('POST', '/api/auth/register', {
    body: { name: 'Test Person', email, phone: '', password: 'clay-and-kiln-42', acceptTerms: true },
  })
  assert.equal(res.status, 201)
  return { email, cookie: cookieFrom(res) }
}

const application = name => ({
  businessName: name,
  city: 'Jaipur',
  state: 'Rajasthan',
  gstin: '08ABCDE1234F1Z5',
  contactPhone: '9414012345',
  categories: ['home-living'],
  description: 'A family workshop making hand-block printed home textiles since 1982.',
  practices: 'Natural dyes, organic cotton from Madhya Pradesh, plastic-free packaging, GOTS certified.',
  acceptTerms: true,
})

const productBody = (name, overrides = {}) => ({
  name,
  category: 'home-living',
  price: 1299,
  gstRate: 12,
  stockCount: 3,
  shortDescription: 'Hand-block printed cotton table runner.',
  description: 'Printed by hand with carved teak blocks and natural madder and indigo dyes on organic cotton.',
  materials: ['Organic cotton', 'Natural dyes'],
  certifications: ['GOTS'],
  tags: ['handmade'],
  imageUrl: '/products/recycled-cotton-throw.jpg',
  plasticAvoidedG: 0,
  waterSavedL: 1500,
  wasteDivertedG: 0,
  ...overrides,
})

/** Registers a user, applies as a vendor and has the admin approve them. */
async function approvedVendor(label) {
  const user = await newUser(label)
  const name = unique('Block Print Studio')
  const applied = await call('POST', '/api/vendor/application', { cookie: user.cookie, body: application(name) })
  assert.equal(applied.res.status, 201)
  const admin = await login(ADMIN)
  const approve = await call('POST', `/api/admin/vendors/${applied.data.vendor.id}`, { cookie: admin, body: { action: 'approve', note: '', commissionRate: 10 } })
  assert.equal(approve.res.status, 200)
  return { ...user, vendorId: applied.data.vendor.id, businessName: name, admin }
}

/** Creates a product as the vendor and has the admin approve it with a score. */
async function liveProduct(vendor, overrides) {
  const created = await call('POST', '/api/vendor/products', { cookie: vendor.cookie, body: productBody(unique('Ajrakh Table Runner'), overrides) })
  assert.equal(created.res.status, 201)
  const approved = await call('POST', `/api/admin/products/${created.data.product.id}`, { cookie: vendor.admin, body: { action: 'approve', score: 88, note: '' } })
  assert.equal(approved.res.status, 200)
  return created.data.product
}

async function buyAndPay(cookie, items) {
  const order = await call('POST', '/api/orders', { cookie, body: { items, address: ADDRESS, acceptTerms: true } })
  assert.equal(order.res.status, 201, JSON.stringify(order.data))
  const paid = await call('POST', `/api/orders/${order.data.order.id}/payment`, { cookie, body: { outcome: 'success', method: 'UPI · t@upi' } })
  return { id: order.data.order.id, paid }
}

test('vendor application: requires sign-in, terms and a valid GSTIN; records consent; cannot apply twice', async () => {
  assert.equal((await call('POST', '/api/vendor/application', { body: application('X Studio') })).res.status, 401)

  const user = await newUser('apply')
  const noTerms = await call('POST', '/api/vendor/application', { cookie: user.cookie, body: { ...application(unique('Studio')), acceptTerms: false } })
  assert.equal(noTerms.res.status, 400)
  assert.ok(noTerms.data.fieldErrors.acceptTerms)

  const badGstin = await call('POST', '/api/vendor/application', { cookie: user.cookie, body: { ...application(unique('Studio')), gstin: 'NOTAGSTIN' } })
  assert.ok(badGstin.data.fieldErrors.gstin)

  const ok = await call('POST', '/api/vendor/application', { cookie: user.cookie, body: application(unique('Studio')) })
  assert.equal(ok.res.status, 201)
  assert.equal(ok.data.vendor.status, 'pending')

  const twice = await call('POST', '/api/vendor/application', { cookie: user.cookie, body: application(unique('Studio')) })
  assert.equal(twice.res.status, 409)

  const me = await call('GET', '/api/auth/me', { cookie: user.cookie })
  assert.ok(me.data.consents.some(c => c.context === 'vendor-application'))
  assert.equal(me.data.user.role, 'buyer', 'still a buyer until approved')
})

test('business names must be unique', async () => {
  const a = await newUser('dupe-a')
  const b = await newUser('dupe-b')
  const name = unique('Same Name Crafts')
  await call('POST', '/api/vendor/application', { cookie: a.cookie, body: application(name) })
  const clash = await call('POST', '/api/vendor/application', { cookie: b.cookie, body: application(name.toUpperCase()) })
  assert.equal(clash.res.status, 409)
})

test('pending vendors and buyers cannot use vendor APIs or the dashboard; non-admins cannot use admin APIs', async () => {
  const user = await newUser('pending')
  await call('POST', '/api/vendor/application', { cookie: user.cookie, body: application(unique('Pending Co')) })
  assert.equal((await call('POST', '/api/vendor/products', { cookie: user.cookie, body: productBody('Nope product') })).res.status, 403)
  const dash = await call('GET', '/vendor/dashboard', { cookie: user.cookie })
  assert.match(dash.res.headers.get('location') ?? '', /\/vendor\/register$/)

  assert.equal((await call('POST', '/api/admin/vendors/1', { cookie: user.cookie, body: { action: 'approve' } })).res.status, 403)
  assert.equal((await call('POST', '/api/admin/products/1', { cookie: user.cookie, body: { action: 'hide' } })).res.status, 403)
  const adminPage = await call('GET', '/admin', { cookie: user.cookie })
  assert.match(adminPage.data, /Admins only/)
})

test('admin approval turns the applicant into a vendor with dashboard access', async () => {
  const vendor = await approvedVendor('approve')
  const me = await call('GET', '/api/auth/me', { cookie: vendor.cookie })
  assert.equal(me.data.user.role, 'vendor')
  const dash = await call('GET', '/vendor/dashboard', { cookie: vendor.cookie })
  assert.equal(dash.res.status, 200)
  assert.match(dash.data, new RegExp(vendor.businessName))
})

test('rejecting a vendor requires a reason, and a rejected vendor can resubmit', async () => {
  const user = await newUser('reject')
  const applied = await call('POST', '/api/vendor/application', { cookie: user.cookie, body: application(unique('Maybe Co')) })
  const admin = await login(ADMIN)
  const noReason = await call('POST', `/api/admin/vendors/${applied.data.vendor.id}`, { cookie: admin, body: { action: 'reject', note: '' } })
  assert.equal(noReason.res.status, 400)
  const rejected = await call('POST', `/api/admin/vendors/${applied.data.vendor.id}`, { cookie: admin, body: { action: 'reject', note: 'GSTIN does not match business name' } })
  assert.equal(rejected.res.status, 200)
  const again = await call('POST', '/api/vendor/application', { cookie: user.cookie, body: application(unique('Maybe Co Fixed')) })
  assert.equal(again.res.status, 201)
  assert.equal(again.data.vendor.status, 'pending')
})

test('image upload accepts real images only and serves them back', async () => {
  const vendor = await approvedVendor('upload')
  const form = new FormData()
  form.append('image', new Blob([PNG_1PX], { type: 'image/png' }), 'pixel.png')
  const up = await call('POST', '/api/uploads', { cookie: vendor.cookie, raw: form })
  assert.equal(up.res.status, 201)
  assert.match(up.data.url, /^\/api\/uploads\/[a-f0-9]{32}\.png$/)

  const served = await fetch(`${BASE_URL}${up.data.url}`)
  assert.equal(served.status, 200)
  assert.equal(served.headers.get('content-type'), 'image/png')

  const fake = new FormData()
  fake.append('image', new Blob(['<script>alert(1)</script>'], { type: 'image/png' }), 'evil.png')
  assert.equal((await call('POST', '/api/uploads', { cookie: vendor.cookie, raw: fake })).res.status, 400)
  assert.equal((await fetch(`${BASE_URL}/api/uploads/..%2F..%2Fmrittika.db`)).status, 404)

  const buyer = await newUser('upload-buyer')
  const denied = new FormData()
  denied.append('image', new Blob([PNG_1PX], { type: 'image/png' }), 'pixel.png')
  assert.equal((await call('POST', '/api/uploads', { cookie: buyer.cookie, raw: denied })).res.status, 403)
})

test('new products need admin approval with a score before appearing in the shop; claim edits send them back to review', async () => {
  const vendor = await approvedVendor('review')
  const created = await call('POST', '/api/vendor/products', { cookie: vendor.cookie, body: productBody(unique('Indigo Runner')) })
  assert.equal(created.res.status, 201)
  const { id, slug } = created.data.product
  assert.equal(created.data.product.status, 'pending_review')
  assert.equal((await call('GET', `/product/${slug}`)).res.status, 404)

  const noScore = await call('POST', `/api/admin/products/${id}`, { cookie: vendor.admin, body: { action: 'approve', note: '' } })
  assert.equal(noScore.res.status, 400)
  await call('POST', `/api/admin/products/${id}`, { cookie: vendor.admin, body: { action: 'approve', score: 91, note: '' } })
  const page = await call('GET', `/product/${slug}`)
  assert.equal(page.res.status, 200)
  assert.match(page.data, /Verified vendor/)

  const priceOnly = await call('PATCH', `/api/vendor/products/${id}`, { cookie: vendor.cookie, body: { ...productBody(created.data.product.name), price: 1399 } })
  assert.equal(priceOnly.data.product.status, 'active', 'price changes do not need review')

  const claimEdit = await call('PATCH', `/api/vendor/products/${id}`, {
    cookie: vendor.cookie,
    body: { ...productBody(created.data.product.name), price: 1399, waterSavedL: 9000 },
  })
  assert.equal(claimEdit.data.product.status, 'pending_review')
  assert.equal((await call('GET', `/product/${slug}`)).res.status, 404)
})

test('vendors cannot edit other vendors’ products, and invalid products are rejected', async () => {
  const a = await approvedVendor('own-a')
  const b = await approvedVendor('own-b')
  const product = await liveProduct(a)
  const edit = await call('PATCH', `/api/vendor/products/${product.id}`, { cookie: b.cookie, body: productBody('Hijacked') })
  assert.equal(edit.res.status, 404)

  const bad = await call('POST', '/api/vendor/products', { cookie: a.cookie, body: productBody('X', { price: -5, gstRate: 7, imageUrl: 'https://evil.example/x.png' }) })
  assert.equal(bad.res.status, 400)
  assert.deepEqual(Object.keys(bad.data.fieldErrors).sort(), ['gstRate', 'imageUrl', 'name', 'price'])
})

test('paying for an order takes stock; sold-out products cannot be ordered', async () => {
  const vendor = await approvedVendor('stock')
  const product = await liveProduct(vendor, { stockCount: 2 })
  const buyer = await newUser('stock-buyer')
  const { paid } = await buyAndPay(buyer.cookie, [{ slug: product.slug, quantity: 2 }])
  assert.equal(paid.data.order.status, 'paid')
  const again = await call('POST', '/api/orders', { cookie: buyer.cookie, body: { items: [{ slug: product.slug, quantity: 1 }], address: ADDRESS, acceptTerms: true } })
  assert.equal(again.res.status, 409, 'out of stock')
})

test('multi-vendor fulfilment: order ships only when every vendor ships, then delivers', async () => {
  const vendor = await approvedVendor('fulfil')
  const product = await liveProduct(vendor)
  const aranya = await login(DEMO_VENDOR)
  const buyer = await newUser('fulfil-buyer')
  const { id } = await buyAndPay(buyer.cookie, [
    { slug: product.slug, quantity: 1 },
    { slug: 'neem-charcoal-soap', quantity: 1 },
  ])

  const dash = await call('GET', '/vendor/dashboard?tab=orders', { cookie: vendor.cookie })
  assert.match(dash.data, new RegExp(id))

  assert.equal((await call('POST', `/api/vendor/orders/${id}`, { cookie: vendor.cookie, body: { status: 'delivered' } })).res.status, 409, 'must ship before delivering')
  assert.equal((await call('POST', `/api/vendor/orders/${id}`, { cookie: vendor.cookie, body: { status: 'shipped' } })).res.status, 200)
  let order = await call('GET', `/orders/${id}`, { cookie: buyer.cookie })
  assert.match(order.data, /Paid — preparing/, 'still waiting on the other vendor')
  assert.match(order.data, new RegExp(`Shipped by ${vendor.businessName}`))

  assert.equal((await call('POST', `/api/vendor/orders/${id}`, { cookie: aranya, body: { status: 'shipped' } })).res.status, 200)
  order = await call('GET', `/orders/${id}`, { cookie: buyer.cookie })
  assert.match(order.data, />Shipped</)

  await call('POST', `/api/vendor/orders/${id}`, { cookie: vendor.cookie, body: { status: 'delivered' } })
  await call('POST', `/api/vendor/orders/${id}`, { cookie: aranya, body: { status: 'delivered' } })
  order = await call('GET', `/orders/${id}`, { cookie: buyer.cookie })
  assert.match(order.data, />Delivered</)

  const stranger = await approvedVendor('fulfil-stranger')
  assert.equal((await call('POST', `/api/vendor/orders/${id}`, { cookie: stranger.cookie, body: { status: 'shipped' } })).res.status, 404)
})

test('payouts deduct the vendor commission', async () => {
  const vendor = await approvedVendor('payout')
  const product = await liveProduct(vendor, { price: 1000 })
  const buyer = await newUser('payout-buyer')
  const { id } = await buyAndPay(buyer.cookie, [{ slug: product.slug, quantity: 2 }])
  await call('POST', `/api/vendor/orders/${id}`, { cookie: vendor.cookie, body: { status: 'shipped' } })
  await call('POST', `/api/vendor/orders/${id}`, { cookie: vendor.cookie, body: { status: 'delivered' } })
  const page = await call('GET', '/vendor/dashboard?tab=payouts', { cookie: vendor.cookie })
  assert.match(page.data, /₹2,000/, 'gross sales')
  assert.match(page.data, /₹200/, '10% commission')
  assert.match(page.data, /₹1,800/, 'net ready to settle')
})

test('suspending a vendor hides their products from the shop until reinstated', async () => {
  const vendor = await approvedVendor('suspend')
  const product = await liveProduct(vendor)
  assert.equal((await call('GET', `/product/${product.slug}`)).res.status, 200)
  await call('POST', `/api/admin/vendors/${vendor.vendorId}`, { cookie: vendor.admin, body: { action: 'suspend', note: 'Certification lapsed' } })
  assert.equal((await call('GET', `/product/${product.slug}`)).res.status, 404)
  await call('POST', `/api/admin/vendors/${vendor.vendorId}`, { cookie: vendor.admin, body: { action: 'reinstate', note: '' } })
  assert.equal((await call('GET', `/product/${product.slug}`)).res.status, 200)
})

test('admin panel shows the consent log and vendor queue', async () => {
  const admin = await login(ADMIN)
  const consents = await call('GET', '/admin?tab=consents', { cookie: admin })
  assert.equal(consents.res.status, 200)
  assert.match(consents.data, /Vendor application/)
  assert.match(consents.data, /Registration/)
  const vendors = await call('GET', '/admin?tab=vendors', { cookie: admin })
  assert.match(vendors.data, /Aranya Botanicals/)
})
