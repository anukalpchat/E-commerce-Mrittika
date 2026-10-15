// Mrittika's sustainability scoring method. The guide page, product pages and admin review all read from here.

export interface ScoringPillar {
  name: string
  weight: number
  looksAt: string[]
}

export const SCORING_PILLARS: ScoringPillar[] = [
  {
    name: 'Materials & Sourcing',
    weight: 35,
    looksAt: ['Share of organic, recycled, upcycled or regenerative inputs', 'Traceability of raw materials to region or farm', 'Certifications covering the materials'],
  },
  {
    name: 'Manufacturing Process',
    weight: 25,
    looksAt: ['Energy and water use compared with the conventional process', 'Chemical use, dyes and effluent handling', 'Handmade or small-batch production'],
  },
  {
    name: 'Packaging',
    weight: 15,
    looksAt: ['Plastic-free or reusable packaging', 'Compostable or recyclable materials', 'Minimal packaging volume'],
  },
  {
    name: 'Social Impact',
    weight: 25,
    looksAt: ['Fair pay and working conditions', 'Support for artisans, cooperatives and women-led groups', 'Preservation of traditional crafts (GI, handloom)'],
  },
]

/** Products scoring below this are not listed; reviewers reject them with a note instead. */
export const MINIMUM_LISTING_SCORE = 60

export const SCORE_BANDS = [
  { min: 90, label: 'Exemplary', text: 'Leading practice across every pillar, backed by strong documentation.' },
  { min: 75, label: 'Strong', text: 'Clearly better than the conventional alternative, with minor gaps.' },
  { min: MINIMUM_LISTING_SCORE, label: 'Developing', text: 'Meaningful improvements in some pillars; listed with room to grow.' },
]

export function scoreBand(score: number): string {
  return SCORE_BANDS.find(b => score >= b.min)?.label ?? 'Not listed'
}
