import Link from 'next/link'

interface TocSection {
  id: string
  title: string
}

interface Props {
  title: string
  subtitle?: string
  lastUpdated: string
  sections: TocSection[]
  children: React.ReactNode
}

export default function LegalLayout({ title, subtitle, lastUpdated, sections, children }: Props) {
  return (
    <main className="min-h-screen bg-vellum">
      {/* Page hero */}
      <div className="bg-parchment border-b border-sand">
        <div className="max-w-7xl mx-auto px-6 py-10 md:py-14">
          <div className="flex items-center gap-2 text-xs text-mist font-sans mb-3">
            <Link href="/" className="hover:text-sienna transition-colors">Home</Link>
            <span>›</span>
            <span>Legal</span>
            <span>›</span>
            <span className="text-ink">{title}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light text-ink leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-sm text-mist font-sans max-w-2xl">{subtitle}</p>
          )}
          <div className="mt-4 flex items-center gap-3">
            <div className="h-px w-8 bg-gold opacity-40" />
            <p className="text-xs text-mist font-sans">Last updated: {lastUpdated}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-14">
          {/* Sidebar ToC — desktop only */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-8">
              <p className="text-xs font-sans uppercase tracking-widest text-gold mb-4">Contents</p>
              <nav className="space-y-0.5">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="group flex items-start gap-2 text-sm text-mist hover:text-sienna transition-colors py-1.5 border-l-2 border-sand pl-3 hover:border-sienna"
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <article className="flex-1 min-w-0 prose-legal">
            {children}
          </article>
        </div>
      </div>
    </main>
  )
}
