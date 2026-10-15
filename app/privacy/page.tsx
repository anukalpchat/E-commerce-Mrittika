import type { Metadata } from 'next'
import Link from 'next/link'
import LegalLayout from '@/components/LegalLayout'
import { PRIVACY_LAST_UPDATED, PRIVACY_VERSION } from '@/lib/legal'

export const metadata: Metadata = { title: 'Privacy Policy' }

const sections = [
  { id: 'who', title: 'Who We Are' },
  { id: 'collect', title: 'Data We Collect' },
  { id: 'purpose', title: 'Why We Use It' },
  { id: 'consent', title: 'Consent and Legal Basis' },
  { id: 'sharing', title: 'Who We Share It With' },
  { id: 'payments', title: 'Payments' },
  { id: 'cookies', title: 'Cookies and Browser Storage' },
  { id: 'retention', title: 'How Long We Keep It' },
  { id: 'security', title: 'How We Protect It' },
  { id: 'rights', title: 'Your Rights' },
  { id: 'children', title: 'Children' },
  { id: 'changes', title: 'Changes to This Policy' },
  { id: 'contact', title: 'Contact and Grievances' },
]

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="What personal data Mrittika collects, why, who sees it, and how you can control it."
      lastUpdated={`${PRIVACY_LAST_UPDATED} (version ${PRIVACY_VERSION})`}
      sections={sections}
    >
      <div className="legal-note">
        This document is part of an academic project submitted for the E-Commerce course. It describes how this demonstration website
        actually handles data and is modelled on the Digital Personal Data Protection Act, 2023 (&ldquo;DPDP Act&rdquo;), whose
        obligations are being phased in through 2027. It should be reviewed by a licensed legal professional before any real
        commercial use.
      </div>

      <h2 id="who">Who We Are</h2>
      <p>
        Mrittika (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is an online marketplace for sustainable goods operated from Mumbai,
        Maharashtra, India. For the personal data described here, Mrittika is the <strong>Data Fiduciary</strong> under the DPDP Act:
        we decide why and how it is processed. Independent vendors who fulfil your orders receive limited data from us and are
        responsible for handling it lawfully.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="collect">Data We Collect</h2>
      <p>We collect only what we need to run the marketplace:</p>
      <ul>
        <li><strong>Account details</strong> — your name, email address, an optional mobile number, and your password, which we store only as a salted one-way hash (we never see or keep the password itself).</li>
        <li><strong>Delivery addresses</strong> — addresses you enter at checkout or save to your address book.</li>
        <li><strong>Orders</strong> — what you bought, prices, GST, the delivery address used, payment status and a label for the payment method (for example &ldquo;UPI · name@bank&rdquo;).</li>
        <li><strong>Wishlist</strong> — products you save for later.</li>
        <li><strong>Consent records</strong> — each time you accept our Terms or this Policy, we record the version, the time, where you gave it (registration, checkout or vendor application), your IP address and browser type, as evidence of your consent.</li>
        <li><strong>Support messages</strong> — the name, email, optional order ID and message you send through the contact form.</li>
        <li><strong>Vendor applications</strong> — for sellers: business name, location, GSTIN, business phone and the details of your practices.</li>
      </ul>
      <p>We do not collect your date of birth, government ID numbers, location tracking, or browsing behaviour on other websites.</p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="purpose">Why We Use It</h2>
      <ul>
        <li>To create and secure your account and keep you signed in.</li>
        <li>To process, deliver and support your orders, and to issue invoices.</li>
        <li>To calculate your personal impact dashboard from your paid orders. Your order history is used for this purpose and is not used to build advertising profiles.</li>
        <li>To answer your support requests and resolve grievances.</li>
        <li>To review vendor applications and keep the marketplace trustworthy.</li>
        <li>To meet legal obligations, such as keeping tax records and proof of consent.</li>
      </ul>
      <p>We do not sell your data, and we do not use it for third-party advertising.</p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="consent">Consent and Legal Basis</h2>
      <p>
        When you register, we ask you to agree to this Policy with its own checkbox, which is never pre-ticked. You give consent again
        at checkout, where you also agree to your delivery address being shared with the vendor. Some processing does not depend on
        consent because the law requires it — for example, keeping invoices for tax purposes — which the DPDP Act treats as a
        &ldquo;legitimate use&rdquo;.
      </p>
      <p>
        You may withdraw consent at any time by asking us to close your account (see <a href="#rights">Your Rights</a>). Withdrawal
        does not affect processing that already took place, or records we must keep by law.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="sharing">Who We Share It With</h2>
      <ul>
        <li><strong>Vendors</strong> — the vendor who fulfils part of your order sees your name, phone number, delivery address and the items they are shipping. They do not see your email, your other orders, or items from other vendors.</li>
        <li><strong>Payment gateway</strong> — in a live deployment, payment details would go directly to a PCI-DSS-compliant gateway (see <a href="#payments">Payments</a>).</li>
        <li><strong>Service providers</strong> — hosting and infrastructure providers that store data on our behalf under contract.</li>
        <li><strong>Authorities</strong> — when required by law, a court order, or to protect users from fraud.</li>
      </ul>
      <p>Mrittika operates only in India. We intend to store personal data on servers located in India.</p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="payments">Payments</h2>
      <p>
        <strong>On this demonstration website, payment is simulated.</strong> No payment gateway is contacted, no money moves, and the
        card, UPI or bank details you type into the demo payment window never leave your browser. We store only the outcome and a short
        label for the method.
      </p>
      <p>
        In a live deployment, payment would be handled entirely by a PCI-DSS-compliant gateway. Card numbers would be entered on the
        gateway&apos;s secure form and replaced by a token, so Mrittika would never receive or store full card details.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="cookies">Cookies and Browser Storage</h2>
      <p>We use one cookie, and it is essential:</p>
      <ul>
        <li><code>mrittika_session</code> — keeps you signed in for up to 7 days. It is marked HTTP-only so page scripts cannot read it.</li>
      </ul>
      <p>
        Your shopping cart, and the fact that you have dismissed our privacy notice, are stored in your own browser (local storage), not
        on our servers. We use no analytics, advertising or tracking cookies.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="retention">How Long We Keep It</h2>
      <ul>
        <li><strong>Account, addresses and wishlist</strong> — while your account is open; deleted when you close it.</li>
        <li><strong>Orders and invoices</strong> — as long as tax law requires (currently about six years under the CGST Act, 2017), even if you close your account.</li>
        <li><strong>Consent records</strong> — while your account is open and for the same period as order records, so we can show what you agreed to if a dispute arises.</li>
        <li><strong>Support messages</strong> — up to three years after the ticket is closed.</li>
        <li><strong>Sign-in sessions</strong> — 7 days, or until you sign out.</li>
      </ul>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="security">How We Protect It</h2>
      <ul>
        <li>Passwords are hashed with scrypt and a unique salt per user.</li>
        <li>Session tokens are random. We store only a hash of each token, so a copy of our database cannot be used to sign in as you.</li>
        <li>Vendor and admin areas check permissions on the server for every request.</li>
        <li>In a live deployment, all traffic is encrypted with HTTPS and cookies are sent only over secure connections.</li>
      </ul>
      <p>
        If a personal data breach occurs, we will inform the Data Protection Board of India and affected users as the DPDP Act and its
        Rules require.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="rights">Your Rights</h2>
      <p>Under the DPDP Act you can:</p>
      <ul>
        <li><strong>Access</strong> a summary of the personal data we hold about you and who we have shared it with.</li>
        <li><strong>Correct or update</strong> it — you can edit your name and phone under <Link href="/account">My Account</Link> yourself.</li>
        <li><strong>Erase</strong> it, by closing your account (subject to records we must keep by law).</li>
        <li><strong>Nominate</strong> someone to exercise these rights if you die or become incapacitated.</li>
        <li><strong>Raise a grievance</strong> with us, and if unresolved, with the Data Protection Board of India.</li>
      </ul>
      <p>
        To make a request, use the <Link href="/contact">contact form</Link> and choose <em>My personal data</em>, or email the
        Grievance Officer. We respond within 30 days.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="children">Children</h2>
      <p>
        Mrittika is for adults. You must be 18 or older to register, and we do not knowingly process the personal data of children. If
        you believe a child has created an account, contact us and we will delete it.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="changes">Changes to This Policy</h2>
      <p>
        Each version of this Policy has a date and version number, shown at the top of this page. If we make a material change, we will
        ask you to accept the new version rather than changing it silently.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="contact">Contact and Grievances</h2>
      <p>
        Questions or complaints about your data go to our Grievance Officer at{' '}
        <a href="mailto:grievance@mrittika.in">grievance@mrittika.in</a>, or through the <Link href="/contact">contact form</Link>.
        Complaints are acknowledged within 48 hours and resolved within 30 days. See <Link href="/contact#grievance">Grievance Officer details</Link>.
      </p>
    </LegalLayout>
  )
}
