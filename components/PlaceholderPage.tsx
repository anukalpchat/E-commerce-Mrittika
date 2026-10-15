interface Section {
  title: string
  description: string
}

interface Props {
  title: string
  description: string
  sections?: Section[]
  status?: 'planned' | 'in-progress'
}

export default function PlaceholderPage({
  title,
  description,
  sections = [],
  status = 'planned',
}: Props) {
  return (
    <main className="min-h-screen bg-vellum">
      {/* Page header */}
      <div className="bg-parchment border-b border-sand">
        <div className="max-w-7xl mx-auto px-6 py-10 md:py-14">
          <div className="inline-flex items-center gap-2 mb-4">
            <span
              className={`text-xs font-sans uppercase tracking-widest px-2.5 py-1 rounded-sm ${
                status === 'planned'
                  ? 'bg-sand/60 text-mist border border-sand'
                  : 'bg-canopy/10 text-canopy border border-canopy/30'
              }`}
            >
              {status === 'planned' ? 'Scaffold — Placeholder' : 'In Progress'}
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light text-ink">{title}</h1>
          <p className="mt-3 text-sm text-mist font-sans max-w-xl">{description}</p>
        </div>
      </div>

      {/* Section outlines */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {sections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((s, i) => (
              <div
                key={i}
                className="border border-dashed border-sand rounded-sm p-6 bg-parchment/40"
              >
                <p className="text-xs text-gold font-sans uppercase tracking-widest mb-1">
                  Section {i + 1}
                </p>
                <h3 className="font-display text-lg text-ink">{s.title}</h3>
                <p className="mt-1 text-xs text-mist leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-sand rounded-sm p-10 text-center bg-parchment/40">
            <p className="font-display text-2xl text-mist/60">Content coming in a later sprint</p>
          </div>
        )}
      </div>
    </main>
  )
}
