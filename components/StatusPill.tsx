const TONES = {
  good: 'bg-canopy/10 text-canopy border-canopy/40',
  waiting: 'bg-amber-50 text-amber-900 border-amber-300',
  bad: 'bg-sienna/10 text-sienna border-sienna/40',
  muted: 'bg-sand/40 text-mist border-sand',
}

export type Tone = keyof typeof TONES

export default function StatusPill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-block text-[11px] font-sans uppercase tracking-widest px-2 py-0.5 rounded-sm border whitespace-nowrap ${TONES[tone]}`}>
      {children}
    </span>
  )
}
