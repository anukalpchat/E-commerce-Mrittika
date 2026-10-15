import type { Metadata } from 'next'
import LegalLayout from '@/components/LegalLayout'
import { GRIEVANCE_OFFICER } from '@/lib/legal'

export const metadata: Metadata = { title: 'Terms & Conditions' }

const sections = [
  { id: 'acceptance',    title: 'Acceptance of Terms' },
  { id: 'eligibility',   title: 'Eligibility' },
  { id: 'account',       title: 'Account Registration & Security' },
  { id: 'vendor-listings', title: 'Vendor Listings & Product Information' },
  { id: 'score-disclaimer', title: 'Sustainability Score Disclaimer' },
  { id: 'pricing',       title: 'Pricing and Payment' },
  { id: 'orders',        title: 'Order Confirmation and Cancellation' },
  { id: 'shipping',      title: 'Shipping and Delivery' },
  { id: 'returns',       title: 'Returns, Refunds and Replacement' },
  { id: 'conduct',       title: 'User Conduct' },
  { id: 'ip',            title: 'Intellectual Property' },
  { id: 'ugc',           title: 'User-Generated Content' },
  { id: 'privacy',       title: 'Privacy and Data Use' },
  { id: 'liability',     title: 'Limitation of Liability' },
  { id: 'indemnification', title: 'Indemnification' },
  { id: 'governing-law', title: 'Governing Law and Jurisdiction' },
  { id: 'modifications', title: 'Modification of Terms' },
  { id: 'termination',   title: 'Termination' },
  { id: 'grievance',     title: 'Grievance Redressal' },
]

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      subtitle="These Terms govern your use of the Mrittika platform as a buyer or vendor. By creating an account, listing a product, or placing an order, you agree to be bound by these Terms."
      lastUpdated="21 August 2026"
      sections={sections}
    >
      <div className="legal-note">
        This document is part of an academic project submitted for the E-Commerce course. The terms are illustrative drafts modeled on standard statutory and industry practice for a hypothetical Indian e-commerce marketplace and should not be treated as a substitute for review by a licensed legal professional prior to any actual commercial deployment.
      </div>

      <p>
        Mandatory affirmative acceptance (a required checkbox) is presented to every User before proceeding to payment, and separately to every Vendor before submitting a listing application. By accepting, the User or Vendor enters into a binding agreement with Mrittika.
      </p>

      <h2 id="acceptance">Acceptance of Terms</h2>
      <p>
        By creating an account, listing a product, or placing an order on Mrittika, you confirm that you have read, understood, and agree to be bound by these Terms and Conditions, together with the Privacy Policy and Disclaimer referenced herein. These Terms constitute a legally binding agreement under the Indian Contract Act, 1872.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="eligibility">Eligibility</h2>
      <p>
        You must be at least 18 years of age and competent to contract under the Indian Contract Act, 1872 to register an account, place an order, or list products as a Vendor on this platform. Accounts found to belong to a minor will be suspended pending verification. By registering, you represent and warrant that you meet these eligibility requirements.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="account">Account Registration and Security</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must:
      </p>
      <ul>
        <li>Provide accurate and complete registration information;</li>
        <li>Maintain and promptly update your account information;</li>
        <li>Notify Mrittika immediately of any unauthorized use of your account or any other breach of security;</li>
        <li>Ensure that you log out at the end of each session where applicable.</li>
      </ul>
      <p>
        Mrittika will not be liable for any loss or damage arising from your failure to comply with these obligations.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="vendor-listings">Vendor Listings and Product Information</h2>
      <p>
        Vendors are solely responsible for the accuracy, legality, and completeness of all product listings, including descriptions, pricing, images, and sustainability documentation submitted for scoring. Mrittika reserves the right to review, edit, suspend, or remove any listing that appears inaccurate, misleading, or in violation of the Prohibited Items Policy, without prior notice. Repeated violations may result in account termination.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="score-disclaimer">Sustainability Score Disclaimer</h2>
      <p>
        The sustainability score displayed against each product is an indicative assessment based on Vendor-submitted documentation and Mrittika&apos;s scoring methodology, and does not constitute an independent third-party certification, as further described in the <a href="/disclaimer#scoring">Disclaimer</a>. Users are encouraged to independently verify certifications where material to a purchase decision.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="pricing">Pricing and Payment</h2>
      <p>
        All prices are listed in Indian Rupees (INR) and are inclusive of applicable GST unless stated otherwise. Payment must be completed through the payment methods made available on the platform at the time of checkout, processed via a third-party payment gateway. <strong>Mrittika does not store your payment card or banking details.</strong>
      </p>
      <p>
        The platform operates a Tax Collected at Source (TCS) mechanism under Section 52 of the CGST Act and deducts TDS under Section 194-O of the Income Tax Act, 1961, on vendor payouts as required by law.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="orders">Order Confirmation and Cancellation</h2>
      <p>
        An order is confirmed only upon receipt of payment and issuance of an order confirmation to your registered email address. Users may cancel an order within the window specified at checkout, subject to the individual Vendor&apos;s cancellation policy displayed on the product page. Mrittika reserves the right to cancel any order arising from a pricing or listing error, with a full refund to the affected User.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="shipping">Shipping and Delivery</h2>
      <p>
        Products are shipped directly by the fulfilling Vendor. Estimated delivery timelines are indicative and provided by the Vendor. Mrittika is not liable for delays caused by the Vendor, courier partner, force majeure, or circumstances beyond reasonable control. Delivery address shared with the Vendor is limited to what is necessary for order fulfilment.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="returns">Returns, Refunds and Replacement</h2>
      <p>
        Returns and refunds are subject to the individual Vendor&apos;s return policy displayed on the product listing, in addition to any statutory right available to the User under the Consumer Protection Act, 2019. Where a return is accepted, refunds will be processed to the original payment method within the timeline specified in the Vendor&apos;s policy and applicable law.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="conduct">User Conduct</h2>
      <p>You agree not to use the platform to:</p>
      <ul>
        <li>Engage in any unlawful purpose or activity prohibited by applicable Indian law;</li>
        <li>Upload false, misleading, or defamatory content;</li>
        <li>Infringe the intellectual property of Mrittika or any third party;</li>
        <li>Submit product listings with unverified sustainability claims (&ldquo;greenwashing&rdquo;);</li>
        <li>Attempt to interfere with the platform&apos;s security or normal operation;</li>
        <li>Use dark-pattern interface techniques to manipulate other users or vendors.</li>
      </ul>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="ip">Intellectual Property</h2>
      <p>
        All platform content, branding, and the sustainability scoring methodology are the property of Mrittika, as set out in the Copyright Notice appearing in the site footer and protected under the Copyright Act, 1957. Vendors retain ownership of their submitted content but grant Mrittika a limited, non-exclusive, royalty-free license to display and use it for operating and promoting the platform.
      </p>
      <p>
        The trademark &ldquo;Mrittika&rdquo; and associated logo are trademarks of Mrittika. All other trademarks referenced on the website are the property of their respective owners.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="ugc">User-Generated Content</h2>
      <p>
        By submitting a review, rating, or other content, you grant Mrittika a non-exclusive, royalty-free license to display that content on the platform. You retain ownership of such content. Mrittika reserves the right to moderate or remove content that is defamatory, infringing, harassing, or otherwise in breach of these Terms, without prior notice.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="privacy">Privacy and Data Use</h2>
      <p>
        Your personal data is collected and processed in accordance with our <a href="/privacy">Privacy Policy</a>, which describes what data is collected, why it is collected, how long it is retained, with whom it is shared, and your rights in respect of that data. The Privacy Policy is incorporated into these Terms by reference.
      </p>
      <p>
        The platform is being built to align with the Digital Personal Data Protection Act, 2023 and applicable Rules, including phased compliance obligations commencing from 13 May 2027.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="liability">Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, Mrittika&apos;s liability arising out of your use of the platform is limited as described in the <a href="/disclaimer#liability">Disclaimer</a>. This limitation does not apply where such exclusion is not permitted under the Consumer Protection Act, 2019 or other mandatory applicable law. Nothing in these Terms excludes liability for fraud or fraudulent misrepresentation.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="indemnification">Indemnification</h2>
      <p>
        You agree to indemnify and hold Mrittika, its founders, affiliates, and team members harmless from any claim, loss, liability, or damage — including reasonable legal fees — arising from:
      </p>
      <ul>
        <li>Your breach of these Terms;</li>
        <li>Your listed products (if a Vendor), including inaccurate sustainability claims;</li>
        <li>Your violation of any applicable law or third-party right;</li>
        <li>Your use of the platform in a manner that causes harm to another User or Vendor.</li>
      </ul>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="governing-law">Governing Law and Jurisdiction</h2>
      <p>
        These Terms are governed by the laws of India. Any dispute arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts at Mumbai, Maharashtra. The platform&apos;s operations are currently limited to India-only scope.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="modifications">Modification of Terms</h2>
      <p>
        Mrittika may amend these Terms from time to time. <strong>Material changes will be notified to Users and require re-acceptance before continued use of the platform.</strong> Non-material changes (such as typographical corrections) may be made without notice. Continued use of the platform after notification of a material change and without re-acceptance constitutes acceptance of the revised Terms.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="termination">Termination</h2>
      <p>
        Mrittika reserves the right to suspend or terminate any User or Vendor account that:
      </p>
      <ul>
        <li>Violates these Terms;</li>
        <li>Engages in fraudulent or deceptive activity;</li>
        <li>Lists prohibited items or submits false sustainability documentation;</li>
        <li>Poses a risk to the platform, other users, or third parties.</li>
      </ul>
      <p>
        Termination may be with or without prior notice depending on the severity of the violation. Upon termination, your right to use the platform ceases immediately. Any pending transactions will be handled in accordance with applicable consumer protection law.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="grievance">Grievance Redressal</h2>
      <p>
        In accordance with the Consumer Protection (E-Commerce) Rules, 2020, Mrittika has appointed a Grievance Officer to receive and resolve complaints from Users and Vendors.
      </p>

      <div className="bg-parchment border border-sand rounded-sm p-6 my-6 not-prose">
        <p className="text-xs font-sans uppercase tracking-widest text-gold mb-4">Grievance Officer Details</p>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-mist mb-0.5">Name</dt>
            <dd className="font-sans text-ink font-medium">{GRIEVANCE_OFFICER.name} <span className="text-xs text-mist font-normal">(fictional, for this demo)</span></dd>
          </div>
          <div>
            <dt className="text-xs text-mist mb-0.5">Email</dt>
            <dd className="font-sans text-ink">
              <a href="mailto:grievance@mrittika.in" className="text-sienna hover:underline">
                grievance@mrittika.in
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-mist mb-0.5">Phone</dt>
            <dd className="font-sans text-ink">{GRIEVANCE_OFFICER.phone}</dd>
          </div>
          <div>
            <dt className="text-xs text-mist mb-0.5">Address</dt>
            <dd className="font-sans text-ink">{GRIEVANCE_OFFICER.address}</dd>
          </div>
          <div>
            <dt className="text-xs text-mist mb-0.5">Working Hours</dt>
            <dd className="font-sans text-ink">Monday – Friday, 10:00 AM – 6:00 PM IST</dd>
          </div>
          <div>
            <dt className="text-xs text-mist mb-0.5">Resolution Timeline</dt>
            <dd className="font-sans text-ink">Acknowledged within 48 hours · Resolved within 30 days</dd>
          </div>
        </dl>
      </div>

      <p>
        Complaints may be submitted in writing via the email address above. Please include your order number, account email, and a clear description of the issue. Mrittika will acknowledge your complaint within 48 hours of receipt and endeavour to resolve it within one month, consistent with the requirements of the Consumer Protection (E-Commerce) Rules, 2020.
      </p>
      <p>
        If your complaint is not resolved to your satisfaction within the specified period, you may escalate the matter to the appropriate consumer forum or court having jurisdiction under the Consumer Protection Act, 2019.
      </p>
    </LegalLayout>
  )
}
