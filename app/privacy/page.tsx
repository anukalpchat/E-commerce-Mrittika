import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-vellum">
      <div className="bg-parchment border-b border-sand">
        <div className="max-w-7xl mx-auto px-6 py-10 md:py-14">
          <div className="flex items-center gap-2 text-xs text-mist font-sans mb-3">
            <Link href="/" className="hover:text-sienna transition-colors">Home</Link>
            <span>›</span>
            <span>Legal</span>
            <span>›</span>
            <span className="text-ink">Privacy Policy</span>
          </div>
          <div className="flex items-start gap-3">
            <h1 className="font-display text-4xl md:text-5xl font-light text-ink">Privacy Policy</h1>
            <span className="badge-pending mt-3">Pending</span>
          </div>
          <p className="mt-3 text-sm text-mist font-sans max-w-xl">
            The Privacy Policy for Mrittika has been referenced throughout the Legal Framework but has not yet been drafted. It will be completed in the next sprint.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="max-w-2xl">
          <div className="border border-dashed border-gold/40 rounded-sm p-8 bg-parchment/40">
            <p className="text-xs font-sans uppercase tracking-widest text-gold mb-4">What this policy will cover</p>
            <ul className="space-y-3 text-sm text-mist prose-legal">
              <li>Categories of personal data collected (account data, order history, browsing history for impact dashboard, reviews)</li>
              <li>Purpose limitation — data collected for the impact dashboard used only for that stated purpose</li>
              <li>Data minimisation — only data genuinely necessary for order fulfilment and impact tracking</li>
              <li>Third-party data sharing — delivery address shared with fulfilling Vendor; payment data handled by PCI-DSS-compliant gateway</li>
              <li>Data-principal rights — access, correction, and deletion requests (aligned with DPDP Act, 2023)</li>
              <li>Consent design — no pre-ticked boxes, no bundled dual-purpose consent</li>
              <li>Data retention periods</li>
              <li>Contact details for data-related queries</li>
            </ul>

            <div className="mt-6 pt-5 border-t border-sand">
              <p className="text-xs text-mist">
                Regulatory context: The Digital Personal Data Protection Act, 2023 and DPDP Rules, 2025 are in phased
                enforcement — Phase 1 provisions (including the Data Protection Board of India) took effect
                13 November 2025. Full substantive compliance obligations commence 13 May 2027. Mrittika is
                building DPDP-aligned practices from the outset rather than retrofitting later.
              </p>
            </div>
          </div>

          <p className="mt-6 text-sm text-mist">
            For data-related queries in the interim, contact the Grievance Officer at{' '}
            <a href="mailto:grievance@mrittika.in" className="text-sienna hover:underline">
              grievance@mrittika.in
            </a>
            . See also:{' '}
            <Link href="/terms#privacy" className="text-sienna hover:underline">
              Privacy & Data Use clause in the Terms & Conditions
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  )
}
