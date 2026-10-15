import Link from 'next/link'

const shopLinks = [
  { label: 'All Categories', href: '/categories' },
  { label: 'Shop by Impact', href: '/search' },
  { label: 'Sustainability Guide', href: '/sustainability' },
  { label: 'Journal', href: '/journal' },
  { label: 'Become a Vendor', href: '/vendor/register' },
]

const legalLinks = [
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Disclaimer', href: '/disclaimer' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Shipping, Returns & Refunds', href: '/returns-shipping' },
  { label: 'Grievance Redressal', href: '/contact#grievance' },
]

const companyLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact & FAQ', href: '/contact' },
  { label: 'Admin', href: '/admin' },
]

export default function Footer() {
  return (
    <footer className="bg-forest text-sand">
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <span className="font-display text-2xl font-light text-gold tracking-wide">Mrittika</span>
          <p className="mt-3 text-xs leading-relaxed text-mist max-w-xs">
            A curated marketplace for verified sustainable goods — connecting conscious buyers with ethical Indian vendors through a transparent scoring engine.
          </p>
          <p className="mt-4 text-xs text-mist/70">Mumbai, Maharashtra · mrittika.in</p>
        </div>

        {/* Shop */}
        <div>
          <h4 className="text-xs font-sans uppercase tracking-widest text-gold mb-4">Shop</h4>
          <ul className="space-y-2.5">
            {shopLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-xs text-sand hover:text-vellum transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-xs font-sans uppercase tracking-widest text-gold mb-4">Company</h4>
          <ul className="space-y-2.5">
            {companyLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-xs text-sand hover:text-vellum transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-xs font-sans uppercase tracking-widest text-gold mb-4">Legal</h4>
          <ul className="space-y-2.5">
            {legalLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-xs text-sand hover:text-vellum transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Copyright strip */}
      <div className="border-t border-canopy/30">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10 bg-gold opacity-30" />
            <span className="text-gold text-xs opacity-60">◆</span>
            <div className="h-px w-10 bg-gold opacity-30" />
          </div>
          <p className="text-xs text-mist leading-relaxed max-w-3xl mx-auto">
            © 2026 Mrittika. All Rights Reserved. All content on this website — including text, graphics, logos,
            images, the sustainability scoring methodology, and underlying software code — is the property of
            Mrittika or its content and vendor partners and is protected under the Copyright Act, 1957, and
            applicable international treaties. Product images, descriptions, and brand marks submitted by
            registered vendors remain the property of the respective vendor and are displayed under a limited
            license granted for the purpose of listing and promoting their products.
          </p>
          <p className="mt-3 text-xs text-mist/50">
            Academic project — E-Commerce course · Soham Sawant (A052) · Anukalp Chaturvedi (A007) · Shubham Murkunde (F025)
          </p>
        </div>
      </div>
    </footer>
  )
}
