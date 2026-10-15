// Integration tests: start `npm run test:server` (port 3100, throwaway database) first.
import { test } from 'node:test'
import assert from 'node:assert/strict'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3100'

const ADDRESS = {
  name: 'Kavya Menon',
  phone: '9812345678',
  line1: '14 Banyan Lane, Indiranagar',
  line2: '',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560038',
}

async function call(method, path, { body, cookie } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    redirect: 'manual',
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  let data = null
  try { data = JSON.parse(text) } catch { data = text }
  return { res, data }
}

async function newUser(label) {
  const email = `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.test`
  const { res } = await call('POST', '/api/auth/register', {
    body: { name: 'Kavya Menon', email, phone: '', password: 'mud-and-monsoon-7', acceptTerms: true, acceptPrivacy: true },
  })
  assert.equal(res.status, 201)
  const cookie = res.headers.get('set-cookie').match(/mrittika_session=[^;]+/)[0]
  return { email, cookie }
}

const placeOrder = (cookie, body) =>
  call('POST', '/api/orders', { cookie, body: { address: ADDRESS, acceptTerms: true, ...body } })

test('placing an order requires sign-in', async () => {
  const { res } = await placeOrder(undefined, { items: [{ slug: 'bamboo-cutlery-set', quantity: 1 }] })
  assert.equal(res.status, 401)
})

test('placing an order requires accepting the terms, and records checkout consent when accepted', async () => {
  const { cookie } = await newUser('order-terms')
  const rejected = await placeOrder(cookie, { items: [{ slug: 'bamboo-cutlery-set', quantity: 1 }], acceptTerms: false })
  assert.equal(rejected.res.status, 400)
  assert.ok(rejected.data.fieldErrors.terms)

  const accepted = await placeOrder(cookie, { items: [{ slug: 'bamboo-cutlery-set', quantity: 1 }] })
  assert.equal(accepted.res.status, 201)

  const me = await call('GET', '/api/auth/me', { cookie })
  const given = me.data.consents.map(c => `${c.context}:${c.policy}`).sort()
  assert.deepEqual(given, ['checkout:privacy', 'checkout:terms', 'registration:privacy', 'registration:terms'])
})

test('server prices the order from the catalogue and ignores client-sent prices', async () => {
  const { cookie } = await newUser('order-price')
  const { res, data } = await placeOrder(cookie, {
    items: [{ slug: 'bamboo-cutlery-set', quantity: 2, price: 1 }],
    total: 1,
  })
  assert.equal(res.status, 201)
  assert.equal(data.order.status, 'pending_payment')
  assert.equal(data.order.subtotal, 549 * 2)
  assert.equal(data.order.shipping, 0, 'orders above ₹999 ship free')
  assert.equal(data.order.total, 1098)
  assert.match(data.order.id, /^MRT-[23456789A-Z]{8}$/)
})

test('small orders pay flat shipping', async () => {
  const { cookie } = await newUser('order-ship')
  const { data } = await placeOrder(cookie, { items: [{ slug: 'neem-charcoal-soap', quantity: 1 }] })
  assert.equal(data.order.total, 299 + 89)
})

test('unknown products, bad quantities and bad addresses are rejected', async () => {
  const { cookie } = await newUser('order-bad')
  assert.equal((await placeOrder(cookie, { items: [{ slug: 'plastic-straws', quantity: 1 }] })).res.status, 400)
  assert.equal((await placeOrder(cookie, { items: [{ slug: 'bamboo-cutlery-set', quantity: 0 }] })).res.status, 400)
  assert.equal((await placeOrder(cookie, { items: [{ slug: 'bamboo-cutlery-set', quantity: 11 }] })).res.status, 409)
  assert.equal((await placeOrder(cookie, { items: [] })).res.status, 400)
  const badAddress = await placeOrder(cookie, { items: [{ slug: 'bamboo-cutlery-set', quantity: 1 }], address: { ...ADDRESS, pincode: '12' } })
  assert.equal(badAddress.res.status, 400)
  assert.ok(badAddress.data.fieldErrors.pincode)
})

test('simulated payment: failure can be retried, success marks the order paid and then locks it', async () => {
  const { cookie } = await newUser('order-pay')
  const { data } = await placeOrder(cookie, { items: [{ slug: 'khadi-tote-bag', quantity: 1 }] })
  const id = data.order.id

  const failed = await call('POST', `/api/orders/${id}/payment`, { cookie, body: { outcome: 'failed', method: 'UPI · test@upi' } })
  assert.equal(failed.data.order.status, 'payment_failed')

  const paid = await call('POST', `/api/orders/${id}/payment`, { cookie, body: { outcome: 'success', method: 'UPI · test@upi' } })
  assert.equal(paid.data.order.status, 'paid')
  assert.ok(paid.data.order.paidAt)
  assert.deepEqual(paid.data.order.events.map(e => e.status), ['pending_payment', 'payment_failed', 'paid'])

  const again = await call('POST', `/api/orders/${id}/payment`, { cookie, body: { outcome: 'success', method: 'Card' } })
  assert.equal(again.res.status, 409, 'a paid order cannot be paid twice')
})

test('cancelling payment cancels the order', async () => {
  const { cookie } = await newUser('order-cancel')
  const { data } = await placeOrder(cookie, { items: [{ slug: 'khadi-tote-bag', quantity: 1 }] })
  const cancelled = await call('POST', `/api/orders/${data.order.id}/payment`, { cookie, body: { outcome: 'cancelled', method: 'x' } })
  assert.equal(cancelled.data.order.status, 'cancelled')
  const pay = await call('POST', `/api/orders/${data.order.id}/payment`, { cookie, body: { outcome: 'success', method: 'x' } })
  assert.equal(pay.res.status, 409)
})

test('a paid order can be cancelled until a vendor ships it; stock is returned', async () => {
  const { cookie } = await newUser('order-cancel-paid')
  const { data } = await placeOrder(cookie, { items: [{ slug: 'kantha-quilt', quantity: 2 }] })
  const id = data.order.id
  assert.equal((await call('POST', `/api/orders/${id}/cancel`, { cookie })).res.status, 409, 'unpaid orders are not cancellable this way')

  await call('POST', `/api/orders/${id}/payment`, { cookie, body: { outcome: 'success', method: 'UPI · a@upi' } })
  const stockAfterPay = (await call('GET', '/product/kantha-quilt')).data.match(/(\d+)(?:<!-- -->)? units remaining/)[1]

  const other = await newUser('order-cancel-other')
  assert.equal((await call('POST', `/api/orders/${id}/cancel`, { cookie: other.cookie })).res.status, 404)

  const cancelled = await call('POST', `/api/orders/${id}/cancel`, { cookie })
  assert.equal(cancelled.res.status, 200)
  assert.equal(cancelled.data.order.status, 'cancelled')
  assert.match(cancelled.data.order.events.at(-1).note, /full refund/)
  const stockAfterCancel = (await call('GET', '/product/kantha-quilt')).data.match(/(\d+)(?:<!-- -->)? units remaining/)[1]
  assert.equal(Number(stockAfterCancel), Number(stockAfterPay) + 2)

  assert.equal((await call('POST', `/api/orders/${id}/cancel`, { cookie })).res.status, 409, 'cannot cancel twice')
})

test('invalid payment outcome is rejected', async () => {
  const { cookie } = await newUser('order-outcome')
  const { data } = await placeOrder(cookie, { items: [{ slug: 'khadi-tote-bag', quantity: 1 }] })
  const res = await call('POST', `/api/orders/${data.order.id}/payment`, { cookie, body: { outcome: 'refund', method: 'x' } })
  assert.equal(res.res.status, 400)
})

test("users cannot pay for or view another user's order", async () => {
  const owner = await newUser('order-owner')
  const other = await newUser('order-other')
  const { data } = await placeOrder(owner.cookie, { items: [{ slug: 'khadi-tote-bag', quantity: 1 }] })

  const pay = await call('POST', `/api/orders/${data.order.id}/payment`, { cookie: other.cookie, body: { outcome: 'success', method: 'x' } })
  assert.equal(pay.res.status, 404)

  const page = await call('GET', `/orders/${data.order.id}`, { cookie: other.cookie })
  assert.equal(page.res.status, 404)
})

test('order page renders the invoice with GST split and country of origin for the owner', async () => {
  const { cookie } = await newUser('order-page')
  const { data } = await placeOrder(cookie, { items: [{ slug: 'bamboo-cutlery-set', quantity: 1 }] })
  await call('POST', `/api/orders/${data.order.id}/payment`, { cookie, body: { outcome: 'success', method: 'UPI · a@upi' } })

  const page = await call('GET', `/orders/${data.order.id}`, { cookie })
  assert.equal(page.res.status, 200)
  assert.match(page.data, /Invoice/)
  assert.match(page.data, /Vanavasi Crafts/)
  assert.match(page.data, /India/)
  assert.match(page.data, /₹490/, 'taxable value of ₹549 at 12% GST')
  assert.match(page.data, /₹59/, 'GST component')
})

test('order page redirects signed-out visitors to sign in', async () => {
  const { res } = await call('GET', '/orders/MRT-AAAAAAAA')
  assert.ok([307, 308].includes(res.status))
  assert.match(res.headers.get('location'), /\/auth\?next=/)
})

test('impact dashboard counts only paid orders', async () => {
  const { cookie } = await newUser('impact')
  const empty = await call('GET', '/account/impact', { cookie })
  assert.match(empty.data, /Your impact starts with your first order/)

  const unpaid = await placeOrder(cookie, { items: [{ slug: 'recycled-cotton-throw', quantity: 1 }] })
  assert.equal(unpaid.res.status, 201)
  const stillEmpty = await call('GET', '/account/impact', { cookie })
  assert.match(stillEmpty.data, /Your impact starts with your first order/)

  const { data } = await placeOrder(cookie, { items: [{ slug: 'bamboo-cutlery-set', quantity: 2 }] })
  await call('POST', `/api/orders/${data.order.id}/payment`, { cookie, body: { outcome: 'success', method: 'x' } })
  const page = await call('GET', '/account/impact', { cookie })
  assert.match(page.data, /2 kg/, '2 × 1000 g plastic avoided')
  assert.doesNotMatch(page.data, /8,000 L/, 'the unpaid throw must not count')
})

test('address book: saved from checkout, listed, and deletable only by its owner', async () => {
  const owner = await newUser('addr-owner')
  const other = await newUser('addr-other')
  await placeOrder(owner.cookie, { items: [{ slug: 'khadi-tote-bag', quantity: 1 }], saveAddress: true })

  const list = await call('GET', '/api/account/addresses', { cookie: owner.cookie })
  assert.equal(list.data.addresses.length, 1)
  const id = list.data.addresses[0].id

  const byOrderId = await placeOrder(owner.cookie, { items: [{ slug: 'khadi-tote-bag', quantity: 1 }], address: undefined, addressId: id })
  assert.equal(byOrderId.res.status, 201)
  assert.equal(byOrderId.data.order.shippingAddress.pincode, ADDRESS.pincode)

  assert.equal((await call('DELETE', `/api/account/addresses/${id}`, { cookie: other.cookie })).res.status, 404)
  assert.equal((await call('DELETE', `/api/account/addresses/${id}`, { cookie: owner.cookie })).res.status, 200)
  assert.equal((await call('GET', '/api/account/addresses', { cookie: owner.cookie })).data.addresses.length, 0)
})

test('wishlist add, list, remove; unknown products rejected', async () => {
  const { cookie } = await newUser('wish')
  assert.equal((await call('POST', '/api/wishlist', { cookie, body: { slug: 'wild-forest-honey' } })).res.status, 201)
  assert.equal((await call('POST', '/api/wishlist', { cookie, body: { slug: 'wild-forest-honey' } })).res.status, 201, 'adding twice is harmless')
  assert.deepEqual((await call('GET', '/api/wishlist', { cookie })).data.slugs, ['wild-forest-honey'])
  assert.equal((await call('POST', '/api/wishlist', { cookie, body: { slug: 'nope' } })).res.status, 400)
  await call('DELETE', '/api/wishlist', { cookie, body: { slug: 'wild-forest-honey' } })
  assert.deepEqual((await call('GET', '/api/wishlist', { cookie })).data.slugs, [])
  assert.equal((await call('GET', '/api/wishlist')).res.status, 401)
})

test('profile update validates and persists', async () => {
  const { cookie } = await newUser('profile')
  const bad = await call('PATCH', '/api/account/profile', { cookie, body: { name: 'K', phone: '123' } })
  assert.equal(bad.res.status, 400)
  assert.deepEqual(Object.keys(bad.data.fieldErrors).sort(), ['name', 'phone'])

  const ok = await call('PATCH', '/api/account/profile', { cookie, body: { name: 'Kavya R. Menon', phone: '9000000001' } })
  assert.equal(ok.res.status, 200)
  const me = await call('GET', '/api/auth/me', { cookie })
  assert.equal(me.data.user.name, 'Kavya R. Menon')
  assert.equal(me.data.user.phone, '9000000001')
})

test('old /order-confirmation and /profile links redirect to the new pages', async () => {
  const confirmation = await call('GET', '/order-confirmation?id=MRT-ABCDEFGH')
  assert.match(confirmation.res.headers.get('location') ?? '', /\/orders\/MRT-ABCDEFGH$/)
  const profile = await call('GET', '/profile')
  assert.match(profile.res.headers.get('location') ?? '', /\/account$/)
})
