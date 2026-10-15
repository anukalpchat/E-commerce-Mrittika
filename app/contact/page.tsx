import type { Metadata } from 'next'
import Link from 'next/link'
import { FREE_SHIPPING_ABOVE, shippingFor } from '@/lib/orders-shared'
import { formatPrice } from '@/lib/products'
import { getCurrentUser } from '@/lib/server/auth'
import { GRIEVANCE_ACK_HOURS, GRIEVANCE_RESOLUTION_DAYS } from '@/lib/support-shared'
import { GRIEVANCE_OFFICER } from '@/lib/legal'
import { DEFAULT_COMMISSION_RATE } from '@/lib/vendor-shared'
import ContactForm from './ContactForm'

export const metadata: Metadata = { title: 'Contact & FAQ' }
export const dynamic = 'force-dynamic'

const BUYER_FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: 'How is a product’s sustainability score decided?',
    a: (
      <>
        Vendors submit materials, certifications and impact claims with each listing. Our team reviews them and assigns a score out of
        100 before the product can go live; vendors cannot set their own score. The score is an indicative assessment, not an
        independent certification. <Link href="/sustainability" className="text-sienna underline">How scoring works →</Link>
      </>
    ),
  },
  {
    q: 'Is my payment real?',
    a: (
      <>
        No. Mrittika is an academic project and payment is <strong>simulated</strong>: no gateway is contacted and no money moves. You
        choose whether the demo payment succeeds or fails. Card details typed into the demo never leave your browser. A live version
        would hand payment to a PCI-DSS-compliant gateway so Mrittika never sees card numbers.
      </>
    ),
  },
  {
    q: 'How much is shipping and when will my order arrive?',
    a: (
      <>
        Orders above {formatPrice(FREE_SHIPPING_ABOVE)} ship free; smaller orders pay a flat {formatPrice(shippingFor(0))}. Each
        vendor ships its own items, and we estimate delivery within 5 days of payment. Track progress under{' '}
        <Link href="/account?tab=orders" className="text-sienna underline">My Orders</Link>.
      </>
    ),
  },
  {
    q: 'How do I return something?',
    a: (
      <>
        Send us a request with the form on this page, choosing <em>Return or refund</em> and adding your order ID. We acknowledge every
        request within {GRIEVANCE_ACK_HOURS} hours and coordinate with the vendor. Your statutory rights under the Consumer Protection
        Act, 2019 apply in addition to the vendor&apos;s own policy.
      </>
    ),
  },
  {
    q: 'What does my impact dashboard count?',
    a: (
      <>
        Only paid orders. Each product carries per-unit estimates of plastic avoided, water saved and waste diverted, drawn from the
        vendor&apos;s claims and reviewed by us; your dashboard adds them up. They are estimates, not measurements.
      </>
    ),
  },
  {
    q: 'How can I see, correct or delete my personal data?',
    a: (
      <>
        You can edit your name and phone under <Link href="/account" className="text-sienna underline">My Account</Link>. For anything
        else — a copy of your data, or deleting your account — use the form and choose <em>My personal data</em>. Requests are handled
        by hand by our team.
      </>
    ),
  },
]

const VENDOR_FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: 'Who can sell on Mrittika?',
    a: (
      <>
        Indian businesses and artisan collectives with a valid GSTIN whose products have a genuine, documented sustainability
        story. Apply on the <Link href="/vendor/register" className="text-sienna underline">Sell on Mrittika</Link> page; we aim to
        review applications within 3 working days.
      </>
    ),
  },
  {
    q: 'What does it cost?',
    a: <>There is no listing fee. Mrittika keeps a {DEFAULT_COMMISSION_RATE}% commission on the sale value of your items; the rest is shown as your net earnings in the vendor dashboard.</>,
  },
  {
    q: 'Why is my product “Awaiting review” again?',
    a: <>Changing what a product claims — its description, materials, certifications, photo or impact figures — sends it back for review so the score stays accurate. Price and stock changes go live immediately.</>,
  },
  {
    q: 'Can I set my own sustainability score?',
    a: <>No. Scores are assigned by Mrittika during review, based on the documentation you submit. This is what makes them comparable across vendors.</>,
  },
]

export default function ContactPage() {
  const user = getCurrentUser()

  return (
    <main className="min-h-screen bg-vellum">
      <div className="bg-parchment border-b border-sand">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <p className="text-gold font-sans text-xs uppercase tracking-widest mb-2">Help</p>
          <h1 className="font-display text-4xl md:text-5xl text-ink">Contact &amp; FAQ</h1>
          <p className="text-sm text-mist font-sans mt-2 max-w-xl">
            Questions about an order, a product&apos;s score, or selling with us. Every message gets a ticket number and a reply within{' '}
            {GRIEVANCE_ACK_HOURS} hours.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-10">
        <section aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="font-display text-3xl text-ink mb-5">Send us a message</h2>
          <ContactForm defaultName={user?.name ?? ''} defaultEmail={user?.email ?? ''} />
        </section>

        <aside className="space-y-6">
          <div id="grievance" className="bg-parchment border border-sand rounded-sm p-6 scroll-mt-24">
            <h2 className="font-display text-2xl text-ink">Grievance Officer</h2>
            <p className="text-xs text-mist font-sans mt-1 leading-relaxed">
              As required by the Consumer Protection (E-Commerce) Rules, 2020. Complaints are acknowledged within {GRIEVANCE_ACK_HOURS} hours
              and resolved within {GRIEVANCE_RESOLUTION_DAYS} days.
            </p>
            <dl className="mt-4 space-y-2 text-sm font-sans">
              <div>
                <dt className="text-xs text-gold uppercase tracking-widest">Name</dt>
                <dd className="text-ink">{GRIEVANCE_OFFICER.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-gold uppercase tracking-widest">Email</dt>
                <dd><a href={`mailto:${GRIEVANCE_OFFICER.email}`} className="text-sienna underline">{GRIEVANCE_OFFICER.email}</a></dd>
              </div>
              <div>
                <dt className="text-xs text-gold uppercase tracking-widest">Phone</dt>
                <dd className="text-ink">{GRIEVANCE_OFFICER.phone}</dd>
              </div>
              <div>
                <dt className="text-xs text-gold uppercase tracking-widest">Address</dt>
                <dd className="text-ink">{GRIEVANCE_OFFICER.address}</dd>
              </div>
            </dl>
            <p className="text-[11px] text-mist font-sans mt-3">Name, phone and address are fictional, for this academic demo.</p>
            <p className="text-xs text-mist font-sans mt-4">
              Or use the form and choose <em>Formal grievance</em>. Full details in the{' '}
              <Link href="/terms#grievance" className="text-sienna underline">Terms &amp; Conditions</Link>.
            </p>
          </div>

          <div className="bg-parchment border border-sand rounded-sm p-6">
            <h2 className="font-display text-2xl text-ink">Office</h2>
            <dl className="mt-3 space-y-2 text-sm font-sans">
              <div>
                <dt className="text-xs text-gold uppercase tracking-widest">Location</dt>
                <dd className="text-ink">Mumbai, Maharashtra, India</dd>
              </div>
              <div>
                <dt className="text-xs text-gold uppercase tracking-widest">Hours</dt>
                <dd className="text-ink">{GRIEVANCE_OFFICER.hours}</dd>
              </div>
              <div>
                <dt className="text-xs text-gold uppercase tracking-widest">General enquiries</dt>
                <dd><a href="mailto:hello@mrittika.in" className="text-sienna underline">hello@mrittika.in</a></dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      <section aria-labelledby="faq-heading" className="max-w-7xl mx-auto px-6 pb-16">
        <h2 id="faq-heading" className="font-display text-3xl text-ink mb-6">Frequently asked questions</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <FaqGroup title="For buyers" items={BUYER_FAQ} />
          <FaqGroup title="For vendors" items={VENDOR_FAQ} />
        </div>
      </section>
    </main>
  )
}

function FaqGroup({ title, items }: { title: string; items: { q: string; a: React.ReactNode }[] }) {
  return (
    <div>
      <h3 className="text-xs font-sans text-gold uppercase tracking-widest mb-3">{title}</h3>
      <div className="border-t border-sand">
        {items.map(item => (
          <details key={item.q} className="group border-b border-sand">
            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none py-4 font-display text-lg text-ink hover:text-sienna focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm">
              {item.q}
              <span aria-hidden="true" className="text-gold text-xl transition-transform group-open:rotate-45">+</span>
            </summary>
            <div className="pb-5 text-sm font-sans text-mist leading-relaxed">{item.a}</div>
          </details>
        ))}
      </div>
    </div>
  )
}
