// Journal articles, written by the Mrittika team. Kept in code because the site has no CMS.

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'products'; slugs: string[] }

export interface Article {
  slug: string
  title: string
  excerpt: string
  tag: string
  publishedAt: string
  readMinutes: number
  body: Block[]
}

export const ARTICLES: Article[] = [
  {
    slug: 'plastic-free-bathroom-swaps',
    title: 'Five plastic-free swaps for your bathroom',
    excerpt: 'The bathroom is where most households meet the most single-use plastic. These five swaps are the easiest place to start.',
    tag: 'Guides',
    publishedAt: '2026-10-08',
    readMinutes: 4,
    body: [
      { type: 'p', text: 'Shampoo bottles, toothbrushes, shower puffs, deodorant sticks, soap wrappers — the bathroom shelf is one of the densest sources of plastic in most homes, and almost all of it is designed to be thrown away. The good news is that every one of these has a plastic-free alternative that works just as well.' },
      { type: 'h2', text: '1. Swap the toothbrush handle' },
      { type: 'p', text: 'A bamboo handle does exactly what a plastic one does. The bristles are still nylon in most brushes, so pull them out with pliers before composting the handle.' },
      { type: 'h2', text: '2. Swap bottled shampoo for a bar' },
      { type: 'p', text: 'Shampoo bars are concentrated, so a single bar typically replaces two or more bottles. Keep it on a draining dish between uses so it lasts.' },
      { type: 'h2', text: '3. Swap the shower puff for a loofah' },
      { type: 'p', text: 'A natural loofah is the dried fibre of a gourd. It exfoliates gently, dries quickly, and can go in the compost when it wears out.' },
      { type: 'h2', text: '4. Swap the deodorant stick for a tin' },
      { type: 'p', text: 'Balm deodorants come in metal tins that can be refilled or recycled. Apply a pea-sized amount with your fingertips.' },
      { type: 'h2', text: '5. Swap liquid soap for a bar' },
      { type: 'p', text: 'Bar soap needs no pump and no bottle. Cold-process bars, made in small batches, also keep the glycerin that commercial processes often remove.' },
      { type: 'products', slugs: ['bamboo-toothbrush-pack', 'shampoo-bar-amla', 'natural-loofah-scrubber', 'solid-deodorant-tin', 'neem-charcoal-soap'] },
      { type: 'p', text: 'You do not need to swap everything at once. Replace each item when the one you have runs out — that is the most sustainable way to switch.' },
    ],
  },
  {
    slug: 'what-a-gi-tag-tells-you',
    title: 'What a GI tag tells you — and what it does not',
    excerpt: 'Kolhapuri chappals, Khurja pottery and Darjeeling tea all carry Geographical Indication tags. Here is what that label actually guarantees.',
    tag: 'Explainers',
    publishedAt: '2026-09-24',
    readMinutes: 5,
    body: [
      { type: 'p', text: 'A Geographical Indication (GI) is a legal mark for products whose quality or reputation comes from where they are made. In India, GIs are registered under the Geographical Indications of Goods (Registration and Protection) Act, 1999. Darjeeling tea was the first product in India to be registered.' },
      { type: 'h2', text: 'What a GI protects' },
      { type: 'ul', items: [
        'The name: only producers from the registered region, following the registered method, may use it.',
        'Traditional knowledge: the craft or recipe tied to that place.',
        'Livelihoods: genuine makers are protected from cheaper imitations using the same name.',
      ] },
      { type: 'h2', text: 'What a GI does not promise' },
      { type: 'p', text: 'A GI is about origin and authenticity, not environmental performance. A GI-tagged product is not automatically organic, plastic-free or low-impact. That is why, on Mrittika, a GI tag raises a product’s Social Impact pillar — it supports traditional crafts and the communities behind them — but it does not stand in for evidence about materials, processes or packaging.' },
      { type: 'h2', text: 'GI products on Mrittika' },
      { type: 'products', slugs: ['kolhapuri-chappals', 'terracotta-planter-set', 'ikat-cotton-saree', 'darjeeling-green-tea'] },
    ],
  },
  {
    slug: 'how-to-read-a-sustainability-score',
    title: 'How to read a Mrittika sustainability score',
    excerpt: 'What the number on every product means, who decides it, and why we call it an estimate.',
    tag: 'Explainers',
    publishedAt: '2026-09-10',
    readMinutes: 3,
    body: [
      { type: 'p', text: 'Every product on Mrittika shows a score out of 100. Vendors do not set it. When a vendor submits a product, they list its materials, certifications and impact claims, and a Mrittika reviewer scores it against four weighted pillars: Materials & Sourcing (35%), Manufacturing Process (25%), Packaging (15%) and Social Impact (25%).' },
      { type: 'h2', text: 'The bands' },
      { type: 'ul', items: [
        '90–100, Exemplary: leading practice across every pillar.',
        '75–89, Strong: clearly better than the conventional alternative.',
        '60–74, Developing: meaningful improvements, with room to grow.',
        'Below 60: not listed. The vendor gets feedback instead.',
      ] },
      { type: 'h2', text: 'Why it is an estimate' },
      { type: 'p', text: 'The score is based on documentation the vendor provides and our review of it. It is not a lab test or an independent audit, and we say so wherever it appears. What it does give you is consistency: the same method applied to every product, so a 92 means the same thing for a soap as it does for a saree.' },
      { type: 'p', text: 'If a vendor changes what a product claims, it leaves the shop until it is reviewed again — so the score you see always matches the listing you are reading.' },
    ],
  },
  {
    slug: 'caring-for-natural-materials',
    title: 'Caring for natural materials: jute, copper and terracotta',
    excerpt: 'Natural materials last for years when they are looked after. A short care guide for three of our most popular.',
    tag: 'Guides',
    publishedAt: '2026-08-27',
    readMinutes: 4,
    body: [
      { type: 'p', text: 'The most sustainable product is the one you do not have to replace. Natural materials age well, but they need slightly different care from the synthetics they replace.' },
      { type: 'h2', text: 'Jute' },
      { type: 'ul', items: [
        'Vacuum regularly; grit wears the fibres faster than footsteps do.',
        'Blot spills straight away and spot-clean with a little mild soap. Avoid soaking, which can weaken and discolour jute.',
        'Rotate rugs every few months so they wear and fade evenly.',
      ] },
      { type: 'h2', text: 'Copper' },
      { type: 'ul', items: [
        'Copper darkens naturally as it oxidises; this is harmless.',
        'To restore the shine, rub with lemon and salt, then rinse and dry well. No chemical cleaner is needed.',
        'Dry copper vessels after washing to avoid water spots.',
      ] },
      { type: 'h2', text: 'Terracotta' },
      { type: 'ul', items: [
        'Unglazed terracotta is porous, which is what lets plant roots breathe.',
        'White marks on the outside are mineral deposits from water; scrub them off with a stiff brush and a little vinegar.',
        'Bring pots indoors before frost in colder regions; absorbed water can crack them when it freezes.',
      ] },
      { type: 'products', slugs: ['jute-floor-rug', 'copper-lota', 'terracotta-planter-set'] },
    ],
  },
]

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find(a => a.slug === slug)
}
