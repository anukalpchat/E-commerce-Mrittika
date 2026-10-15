// Indicative per-unit impact estimates for the seed catalogue, used by the impact dashboard.
// Figures come from each product's own description where it states one (e.g. "saves ~8,000 litres",
// "diverts ~500g") and are otherwise rough comparisons against the conventional alternative.
// They are NOT independently measured; the UI labels them as estimates.

export interface ProductImpact {
  plasticAvoidedG: number
  waterSavedL: number
  wasteDivertedG: number
}

const NONE: ProductImpact = { plasticAvoidedG: 0, waterSavedL: 0, wasteDivertedG: 0 }

const IMPACT_BY_SLUG: Record<string, ProductImpact> = {
  'bamboo-cutlery-set':       { plasticAvoidedG: 1000, waterSavedL: 0,    wasteDivertedG: 0 },
  'recycled-cotton-throw':    { plasticAvoidedG: 0,    waterSavedL: 8000, wasteDivertedG: 1200 },
  'terracotta-planter-set':   { plasticAvoidedG: 600,  waterSavedL: 0,    wasteDivertedG: 0 },
  'beeswax-food-wrap':        { plasticAvoidedG: 900,  waterSavedL: 0,    wasteDivertedG: 0 },
  'neem-charcoal-soap':       { plasticAvoidedG: 30,   waterSavedL: 0,    wasteDivertedG: 0 },
  'bamboo-toothbrush-pack':   { plasticAvoidedG: 80,   waterSavedL: 0,    wasteDivertedG: 0 },
  'rosehip-face-oil':         { plasticAvoidedG: 15,   waterSavedL: 0,    wasteDivertedG: 0 },
  'shampoo-bar-amla':         { plasticAvoidedG: 60,   waterSavedL: 0,    wasteDivertedG: 0 },
  'khadi-tote-bag':           { plasticAvoidedG: 300,  waterSavedL: 0,    wasteDivertedG: 0 },
  'block-print-kurta':        { plasticAvoidedG: 0,    waterSavedL: 2000, wasteDivertedG: 0 },
  'upcycled-denim-pouch':     { plasticAvoidedG: 0,    waterSavedL: 1500, wasteDivertedG: 500 },
  'cold-pressed-coconut-oil': { plasticAvoidedG: 25,   waterSavedL: 0,    wasteDivertedG: 0 },
  'wild-forest-honey':        { plasticAvoidedG: 20,   waterSavedL: 0,    wasteDivertedG: 0 },
  'millets-variety-pack':     { plasticAvoidedG: 0,    waterSavedL: 2000, wasteDivertedG: 0 },
  'coconut-shell-bowls':      { plasticAvoidedG: 150,  waterSavedL: 0,    wasteDivertedG: 300 },
  'jute-floor-rug':           { plasticAvoidedG: 0,    waterSavedL: 1200, wasteDivertedG: 0 },
  'copper-lota':              { plasticAvoidedG: 1200, waterSavedL: 0,    wasteDivertedG: 0 },
  'soy-wax-candle':           { plasticAvoidedG: 0,    waterSavedL: 0,    wasteDivertedG: 250 },
  'kantha-quilt':             { plasticAvoidedG: 0,    waterSavedL: 0,    wasteDivertedG: 2000 },
  'natural-loofah-scrubber':  { plasticAvoidedG: 60,   waterSavedL: 0,    wasteDivertedG: 0 },
  'ubtan-face-pack':          { plasticAvoidedG: 25,   waterSavedL: 0,    wasteDivertedG: 0 },
  'solid-deodorant-tin':      { plasticAvoidedG: 40,   waterSavedL: 0,    wasteDivertedG: 0 },
  'neem-wood-comb':           { plasticAvoidedG: 30,   waterSavedL: 0,    wasteDivertedG: 0 },
  'ikat-cotton-saree':        { plasticAvoidedG: 0,    waterSavedL: 1500, wasteDivertedG: 0 },
  'kantha-stitch-stole':      { plasticAvoidedG: 0,    waterSavedL: 0,    wasteDivertedG: 300 },
  'kolhapuri-chappals':       { plasticAvoidedG: 0,    waterSavedL: 0,    wasteDivertedG: 0 },
  'organic-jaggery':          { plasticAvoidedG: 10,   waterSavedL: 0,    wasteDivertedG: 0 },
  'darjeeling-green-tea':     { plasticAvoidedG: 50,   waterSavedL: 0,    wasteDivertedG: 0 },
  'wayanad-black-pepper':     { plasticAvoidedG: 20,   waterSavedL: 0,    wasteDivertedG: 0 },
  'shade-grown-arabica-coffee': { plasticAvoidedG: 15, waterSavedL: 0,    wasteDivertedG: 0 },
}

export function getProductImpact(slug: string): ProductImpact {
  return IMPACT_BY_SLUG[slug] ?? NONE
}

// Every seed vendor is India-based. Shown on listings and invoices per the E-Commerce Rules 2020.
export const COUNTRY_OF_ORIGIN = 'India'
