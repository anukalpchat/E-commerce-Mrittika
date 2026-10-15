import type { Metadata } from 'next'
import Link from 'next/link'
import LegalLayout from '@/components/LegalLayout'
import { DISPATCH_WORKING_DAYS, REFUND_WORKING_DAYS, RETURN_WINDOW_DAYS, RETURNS_LAST_UPDATED } from '@/lib/legal'
import { FREE_SHIPPING_ABOVE, shippingFor } from '@/lib/orders-shared'
import { formatPrice } from '@/lib/products'

export const metadata: Metadata = { title: 'Shipping, Returns & Refunds' }

const sections = [
  { id: 'shipping', title: 'Shipping' },
  { id: 'tracking', title: 'Tracking Your Order' },
  { id: 'cancellations', title: 'Cancellations' },
  { id: 'returns', title: 'Returns' },
  { id: 'non-returnable', title: 'What Cannot Be Returned' },
  { id: 'refunds', title: 'Refunds' },
  { id: 'statutory', title: 'Your Statutory Rights' },
  { id: 'demo', title: 'About This Demo' },
]

export default function ReturnsShippingPage() {
  return (
    <LegalLayout
      title="Shipping, Returns & Refunds"
      subtitle="How orders reach you, and what happens if something is not right."
      lastUpdated={RETURNS_LAST_UPDATED}
      sections={sections}
    >
      <div className="legal-note">
        Mrittika is a marketplace: each vendor sells and ships its own products. This policy sets the minimum standard every vendor
        on Mrittika agrees to. A vendor may offer more generous terms on its product page, but never less.
      </div>

      <h2 id="shipping">Shipping</h2>
      <ul>
        <li>We deliver within India only.</li>
        <li>Orders above {formatPrice(FREE_SHIPPING_ABOVE)} ship free. Orders up to {formatPrice(FREE_SHIPPING_ABOVE)} pay a flat {formatPrice(shippingFor(0))}, shown before you pay.</li>
        <li>Vendors dispatch within {DISPATCH_WORKING_DAYS} working days of payment. We estimate delivery within 5 days of payment; remote pin codes may take longer.</li>
        <li>An order with items from several vendors arrives in separate parcels, one from each vendor.</li>
        <li>Vendors are asked to pack without plastic wherever they can.</li>
      </ul>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="tracking">Tracking Your Order</h2>
      <p>
        Every order has a page under <Link href="/account?tab=orders">My Orders</Link> showing each step — payment, dispatch by each
        vendor, and delivery — with the date and time it happened.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="cancellations">Cancellations</h2>
      <ul>
        <li>You can cancel a paid order yourself from its order page <strong>until any vendor has dispatched it</strong>. You receive a full refund.</li>
        <li>Once part of an order has shipped, it can no longer be cancelled online; use the return process instead.</li>
        <li>We never charge a cancellation fee.</li>
        <li>We may cancel an order caused by a pricing or listing error, with a full refund.</li>
      </ul>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="returns">Returns</h2>
      <p>You can return an item within <strong>{RETURN_WINDOW_DAYS} days of delivery</strong> if it is:</p>
      <ul>
        <li>damaged or defective on arrival,</li>
        <li>different from what you ordered, or</li>
        <li>materially different from its description, photos or sustainability claims.</li>
      </ul>
      <p>
        To start a return, use the <Link href="/contact">contact form</Link>, choose <em>Return or refund</em>, and add your order ID
        and a photo description of the problem. We acknowledge within 48 hours and arrange a pickup with the vendor. Return shipping is
        free when the item was faulty or wrong.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="non-returnable">What Cannot Be Returned</h2>
      <p>For hygiene and safety reasons, the following can be returned only if damaged, defective or wrong:</p>
      <ul>
        <li>food items once opened;</li>
        <li>personal-care products once the seal or wrapping is broken;</li>
        <li>one-of-a-kind or made-to-order pieces, where the listing says so.</li>
      </ul>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="refunds">Refunds</h2>
      <ul>
        <li>Refunds go to the original payment method within {REFUND_WORKING_DAYS} working days of a cancellation, or of the vendor receiving a returned item.</li>
        <li>You receive the full price you paid, including shipping when the return is due to a fault or error.</li>
        <li>Your order page shows when a refund has been issued.</li>
      </ul>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="statutory">Your Statutory Rights</h2>
      <p>
        This policy is in addition to your rights under the Consumer Protection Act, 2019 and the Consumer Protection (E-Commerce)
        Rules, 2020, and does not limit them. If you are unhappy with how a return or refund was handled, you can raise a formal
        grievance with our <Link href="/contact#grievance">Grievance Officer</Link>.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="demo">About This Demo</h2>
      <p>
        Mrittika is an academic project. Payment is simulated, so cancellations and refunds update the order&apos;s status but no money
        is returned, and no parcels are actually shipped.
      </p>
    </LegalLayout>
  )
}
