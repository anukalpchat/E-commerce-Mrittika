import type { Metadata } from 'next'
import Link from 'next/link'
import StatusPill from '@/components/StatusPill'
import { formatDateTime } from '@/lib/format'
import { getCurrentUser } from '@/lib/server/auth'
import { getVendorByUserId } from '@/lib/server/catalog'
import { DEFAULT_COMMISSION_RATE, Vendor, VENDOR_STATUS_LABELS } from '@/lib/vendor-shared'
import VendorApplicationForm from './VendorApplicationForm'

export const metadata: Metadata = { title: 'Sell on Mrittika' }
export const dynamic = 'force-dynamic'

const STEPS = [
  { title: 'Apply', text: 'Tell us about your business, GSTIN and sustainability practices.' },
  { title: 'Review', text: 'Our team checks your documents and practices, usually within 3 working days.' },
  { title: 'List', text: 'Add products with materials, certifications and impact claims. Each listing is reviewed and scored.' },
  { title: 'Sell', text: `Ship orders from your dashboard. Mrittika keeps a ${DEFAULT_COMMISSION_RATE}% commission on each sale.` },
]

export default function VendorRegisterPage() {
  const user = getCurrentUser()
  const vendor = user ? getVendorByUserId(user.id) : null

  return (
    <main className="min-h-screen bg-vellum">
      <div className="bg-forest text-vellum">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <p className="text-gold font-sans text-xs uppercase tracking-widest mb-3">Sell on Mrittika</p>
          <h1 className="font-display text-4xl md:text-5xl font-light max-w-2xl leading-tight">
            Reach buyers who care how things are made.
          </h1>
          <ol className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="border border-canopy/40 rounded-sm p-5">
                <p className="text-gold font-display text-2xl">{i + 1}. {s.title}</p>
                <p className="text-sand text-xs font-sans mt-2 leading-relaxed">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {!user ? (
          <SignInFirst />
        ) : user.role === 'admin' ? (
          <Notice title="You are signed in as an admin">
            Admin accounts cannot apply as vendors. Sign out and use a separate account.
          </Notice>
        ) : vendor && vendor.status !== 'rejected' ? (
          <ApplicationStatus vendor={vendor} />
        ) : (
          <>
            {vendor?.status === 'rejected' && (
              <div className="mb-6 border border-sienna/40 bg-sienna/5 rounded-sm p-4 text-sm font-sans text-ink">
                <p className="font-medium text-sienna">Your previous application was not approved.</p>
                {vendor.reviewNote && <p className="mt-1">Reason: {vendor.reviewNote}</p>}
                <p className="mt-1 text-mist">Update the details below and resubmit.</p>
              </div>
            )}
            <h2 className="font-display text-3xl text-ink mb-2">Vendor application</h2>
            <p className="text-sm text-mist font-sans mb-6">
              Applying as <span className="text-ink">{user.email}</span>. This becomes your vendor login and contact email.
            </p>
            <VendorApplicationForm previous={vendor} />
          </>
        )}
      </div>
    </main>
  )
}

function SignInFirst() {
  return (
    <Notice title="Create an account to apply">
      Vendors sign in with a normal Mrittika account. Once your application is approved, the same login opens your vendor dashboard.
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/auth?tab=register&next=/vendor/register" className="font-sans text-xs uppercase tracking-widest bg-gold text-forest px-6 py-3 hover:bg-sand">
          Create Account
        </Link>
        <Link href="/auth?next=/vendor/register" className="font-sans text-xs uppercase tracking-widest border border-sand text-ink px-6 py-3 hover:border-gold">
          Sign In
        </Link>
      </div>
    </Notice>
  )
}

function ApplicationStatus({ vendor }: { vendor: Vendor }) {
  const tone = vendor.status === 'approved' ? 'good' : vendor.status === 'pending' ? 'waiting' : 'bad'
  return (
    <div className="bg-parchment border border-sand rounded-sm p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-3xl text-ink">{vendor.businessName}</h2>
        <StatusPill tone={tone}>{VENDOR_STATUS_LABELS[vendor.status]}</StatusPill>
      </div>
      <p className="text-sm text-mist font-sans mt-2">
        Applied {formatDateTime(vendor.createdAt)} · {vendor.city}, {vendor.state} · GSTIN {vendor.gstin ?? 'not on file'}
      </p>
      {vendor.status === 'pending' && (
        <p className="mt-5 text-sm font-sans text-ink">
          Thanks — our team is reviewing your application. You can keep shopping with this account meanwhile.
        </p>
      )}
      {vendor.status === 'approved' && (
        <div className="mt-5">
          <p className="text-sm font-sans text-ink">You are approved to sell on Mrittika.</p>
          <Link href="/vendor/dashboard" className="inline-block mt-4 font-sans text-xs uppercase tracking-widest bg-gold text-forest px-6 py-3 hover:bg-sand">
            Open Vendor Dashboard
          </Link>
        </div>
      )}
      {vendor.status === 'suspended' && (
        <p className="mt-5 text-sm font-sans text-sienna">
          Your vendor account is suspended{vendor.reviewNote ? `: ${vendor.reviewNote}` : '.'} Your products are hidden from the shop. Contact us to resolve this.
        </p>
      )}
    </div>
  )
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-parchment border border-sand rounded-sm p-8">
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      <div className="mt-2 text-sm text-mist font-sans leading-relaxed">{children}</div>
    </div>
  )
}
