import type { Metadata } from 'next'
import LegalLayout from '@/components/LegalLayout'

export const metadata: Metadata = { title: 'Disclaimer' }

const sections = [
  { id: 'general',        title: 'General Information' },
  { id: 'intermediary',   title: 'Marketplace / Intermediary Status' },
  { id: 'scoring',        title: 'Sustainability Scoring' },
  { id: 'no-advice',      title: 'No Professional Advice' },
  { id: 'liability',      title: 'Limitation of Liability' },
  { id: 'external-links', title: 'External Links' },
  { id: 'pricing',        title: 'Pricing and Availability' },
]

export default function DisclaimerPage() {
  return (
    <LegalLayout
      title="Website Disclaimer"
      subtitle="Please read this disclaimer carefully before using the Mrittika platform."
      lastUpdated="21 August 2026"
      sections={sections}
    >
      <div className="legal-note">
        This document is part of an academic project submitted for the E-Commerce course. The content is modeled on standard statutory and industry practice for a hypothetical Indian e-commerce marketplace and should not be treated as a substitute for review by a licensed legal professional prior to any actual commercial deployment.
      </div>

      <h2 id="general">General Information</h2>
      <p>
        The information provided on the Mrittika website is for general informational purposes only. While Mrittika strives to keep all product listings, descriptions, and sustainability information accurate and current, Mrittika makes no representation or warranty of any kind, express or implied, about the completeness, accuracy, reliability, or availability of any product, service, or related content on the website.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="intermediary">Marketplace / Intermediary Status</h2>
      <p>
        Mrittika operates as an online marketplace facilitating transactions between independent third-party vendors (&ldquo;Vendors&rdquo;) and buyers (&ldquo;Users&rdquo;). Mrittika is not the manufacturer, seller of record, or owner of the products listed on the platform unless expressly stated otherwise.
      </p>
      <p>
        All product listings, descriptions, pricing, images, and claims are provided by the respective Vendor, who is solely responsible for the accuracy of such information and for compliance with applicable law, including the Legal Metrology Act, 2009 and, where applicable, the Food Safety and Standards Act, 2006.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="scoring">Sustainability Scoring</h2>
      <p>
        The sustainability score and impact metrics displayed against each product are generated using a proprietary methodology developed by Mrittika, based on information and documentation submitted by the Vendor at the time of listing.
      </p>
      <p>
        While Mrittika undertakes reasonable review of submitted documentation, the sustainability score is an <strong>indicative assessment and not an independent third-party certification</strong>. Mrittika does not guarantee the ongoing accuracy of Vendor-submitted claims and encourages Users to independently verify certifications where material to a purchase decision.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="no-advice">No Professional Advice</h2>
      <p>
        Nothing on this website constitutes legal, financial, environmental, or other professional advice. The sustainability scoring methodology and related educational content are provided for informational purposes only and should not be relied upon as a substitute for professional guidance.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="liability">Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by applicable law, Mrittika, its founders, employees, and affiliates shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of:
      </p>
      <ul>
        <li>Access to or use of the website;</li>
        <li>Any transaction conducted with a Vendor through the platform;</li>
        <li>Any inaccuracy in product listings, descriptions, or sustainability claims provided by a Vendor;</li>
        <li>Temporary unavailability of the platform due to technical or maintenance reasons.</li>
      </ul>
      <p>
        This limitation does not apply where such liability cannot be excluded under the Consumer Protection Act, 2019 or other mandatory applicable law.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="external-links">External Links</h2>
      <p>
        This website may contain links to third-party websites, including Vendor storefronts or informational resources. Mrittika does not endorse and is not responsible for the content, accuracy, or practices of any linked third-party website. The inclusion of any link does not imply Mrittika&apos;s endorsement of the linked site.
      </p>

      <div className="divider-gold" aria-hidden="true">◆</div>

      <h2 id="pricing">Pricing and Availability</h2>
      <p>
        Prices, discounts, and product availability displayed on the website are subject to change without prior notice and may occasionally contain typographical or technical errors. Mrittika reserves the right to correct such errors and to cancel any order arising from a pricing or listing error, with a full refund to the affected User.
      </p>
    </LegalLayout>
  )
}
