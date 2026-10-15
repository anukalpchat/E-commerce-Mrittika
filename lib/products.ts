export type Category = 'home-living' | 'personal-care' | 'fashion' | 'food'

export interface Product {
  slug: string
  name: string
  vendor: string
  vendorLocation: string
  category: Category
  categoryLabel: string
  price: number        // INR, inclusive of GST
  gstRate: number      // percentage
  sustainabilityScore: number  // 0–100
  shortDescription: string
  description: string
  materials: string[]
  certifications: string[]
  inStock: boolean
  stockCount: number
  imageColor: string   // tailwind bg color fallback
  imageUrl: string     // Unsplash CDN URL
  tags: string[]
  /** Set for catalogue entries read from the database; the static seed list below omits it. */
  countryOfOrigin?: string
}

export const products: Product[] = [
  // HOME & LIVING
  {
    slug: 'bamboo-cutlery-set',
    name: 'Bamboo Cutlery Travel Set',
    vendor: 'Vanavasi Crafts',
    vendorLocation: 'Coorg, Karnataka',
    category: 'home-living',
    categoryLabel: 'Home & Living',
    price: 549,
    gstRate: 12,
    sustainabilityScore: 92,
    shortDescription: 'Reusable bamboo fork, knife, spoon, chopsticks & straw in a jute pouch.',
    description: 'Hand-harvested Moso bamboo, naturally antimicrobial and fully biodegradable. Each set is carved by artisans in Coorg\'s forest cooperatives and includes a pull-string jute carry pouch. Perfect for travel, office, and school — replace 500+ single-use plastic items a year.',
    materials: ['Moso bamboo', 'Jute'],
    certifications: ['FSC Bamboo', 'Artisan Cooperative Certified'],
    inStock: true,
    stockCount: 84,
    imageColor: 'bg-amber-100',
    imageUrl: '/products/bamboo-cutlery-set.jpg',
    tags: ['zero-waste', 'reusable', 'plastic-free'],
  },
  {
    slug: 'recycled-cotton-throw',
    name: 'Recycled Cotton Throw Blanket',
    vendor: 'Karunakar Textiles',
    vendorLocation: 'Panipat, Haryana',
    category: 'home-living',
    categoryLabel: 'Home & Living',
    price: 1799,
    gstRate: 5,
    sustainabilityScore: 88,
    shortDescription: 'Woven from 100% post-consumer recycled cotton. Machine washable.',
    description: 'Made in Panipat\'s century-old "shoddy" weaving tradition using reclaimed cotton from garment factory offcuts. Each throw saves approximately 8,000 litres of water versus virgin cotton. Available in earthy tones naturally dyed with pomegranate rind and indigo.',
    materials: ['100% Recycled cotton (post-consumer)'],
    certifications: ['GRS (Global Recycled Standard)', 'GOTS'],
    inStock: true,
    stockCount: 31,
    imageColor: 'bg-stone-200',
    imageUrl: '/products/recycled-cotton-throw.jpg',
    tags: ['recycled', 'water-saving', 'handwoven'],
  },
  {
    slug: 'terracotta-planter-set',
    name: 'Terracotta Planter Set (3 pcs)',
    vendor: 'Mitti Kala Kendra',
    vendorLocation: 'Khurja, Uttar Pradesh',
    category: 'home-living',
    categoryLabel: 'Home & Living',
    price: 899,
    gstRate: 12,
    sustainabilityScore: 95,
    shortDescription: 'Unglazed terracotta planters with drainage holes. Sizes S/M/L.',
    description: 'Wheel-thrown by master potters at Khurja\'s oldest cooperative using local clay, zero synthetic additives. Unglazed terracotta breathes and self-regulates moisture — roots stay healthier. Set includes 4", 6", and 8" pots with matching saucers.',
    materials: ['Local terracotta clay'],
    certifications: ['Geographical Indication (GI) — Khurja Pottery'],
    inStock: true,
    stockCount: 57,
    imageColor: 'bg-orange-100',
    imageUrl: '/products/terracotta-planter-set.jpg',
    tags: ['handmade', 'natural', 'zero-chemical'],
  },
  {
    slug: 'beeswax-food-wrap',
    name: 'Beeswax Food Wraps — 3 Pack',
    vendor: 'Honeybee Naturals',
    vendorLocation: 'Nashik, Maharashtra',
    category: 'home-living',
    categoryLabel: 'Home & Living',
    price: 649,
    gstRate: 5,
    sustainabilityScore: 91,
    shortDescription: 'Reusable beeswax-coated cloth wraps replacing cling film. S/M/L sizes.',
    description: 'Organic cotton infused with locally sourced beeswax, jojoba oil, and tree resin. Use body warmth to mould around bowls, cheese, cut fruit. Compostable at end of life. Each pack replaces up to 600 square metres of cling film over its 12-month lifespan.',
    materials: ['Organic cotton', 'Beeswax', 'Jojoba oil', 'Tree resin'],
    certifications: ['USDA Organic Cotton', 'Cruelty-Free'],
    inStock: true,
    stockCount: 112,
    imageColor: 'bg-yellow-50',
    imageUrl: '/products/beeswax-food-wrap.jpg',
    tags: ['plastic-free', 'reusable', 'compostable'],
  },

  // PERSONAL CARE
  {
    slug: 'neem-charcoal-soap',
    name: 'Neem & Activated Charcoal Soap',
    vendor: 'Aranya Botanicals',
    vendorLocation: 'Auroville, Tamil Nadu',
    category: 'personal-care',
    categoryLabel: 'Personal Care',
    price: 299,
    gstRate: 18,
    sustainabilityScore: 89,
    shortDescription: 'Cold-process bar soap with neem leaf, activated charcoal & coconut oil.',
    description: 'Hand-batched in small lots at Auroville\'s community workshop. Cold-process method preserves natural glycerin and plant actives. Neem is organically farmed on-site; charcoal sourced from coconut shells. Packaged in seed paper that grows basil when planted.',
    materials: ['Organic neem leaf', 'Activated coconut charcoal', 'Cold-pressed coconut oil', 'Shea butter'],
    certifications: ['Ecocert COSMOS Natural', 'Cruelty-Free', 'Vegan'],
    inStock: true,
    stockCount: 203,
    imageColor: 'bg-slate-200',
    imageUrl: '/products/neem-charcoal-soap.jpg',
    tags: ['vegan', 'plastic-free', 'organic'],
  },
  {
    slug: 'bamboo-toothbrush-pack',
    name: 'Bamboo Toothbrush — 4 Pack',
    vendor: 'Dantakatha',
    vendorLocation: 'Bangalore, Karnataka',
    category: 'personal-care',
    categoryLabel: 'Personal Care',
    price: 349,
    gstRate: 18,
    sustainabilityScore: 94,
    shortDescription: 'Biodegradable bamboo handle with BPA-free nylon bristles.',
    description: 'Handles made from organically grown Moso bamboo — harvested at 5 years for optimal density. Bristles are BPA-free nylon (pull out before composting the handle). Replaces 4 plastic toothbrushes that would otherwise persist 400+ years in landfill. Compostable kraft packaging.',
    materials: ['Moso bamboo', 'BPA-free nylon bristles'],
    certifications: ['FSC Bamboo', 'Plastic-Free Packaging'],
    inStock: true,
    stockCount: 445,
    imageColor: 'bg-emerald-50',
    imageUrl: '/products/bamboo-toothbrush-pack.jpg',
    tags: ['plastic-free', 'biodegradable', 'zero-waste'],
  },
  {
    slug: 'rosehip-face-oil',
    name: 'Himalayan Rosehip Face Oil 30ml',
    vendor: 'Pahadi Local',
    vendorLocation: 'Pithoragarh, Uttarakhand',
    category: 'personal-care',
    categoryLabel: 'Personal Care',
    price: 1249,
    gstRate: 18,
    sustainabilityScore: 87,
    shortDescription: 'Cold-pressed wild rosehip seed oil. No additives, dark glass bottle.',
    description: 'Wild-harvested from high-altitude rosehips (3,000m+) in Uttarakhand by local women\'s cooperatives. Single-ingredient cold-press retains natural vitamins A, C and essential fatty acids. Bottled in UV-protective amber glass — no plastic dropper, zero synthetic additives.',
    materials: ['100% Wild rosehip seed oil (Rosa canina)'],
    certifications: ['Ecocert COSMOS Organic', 'Women\'s Cooperative Certified'],
    inStock: true,
    stockCount: 68,
    imageColor: 'bg-rose-100',
    imageUrl: '/products/rosehip-face-oil.jpg',
    tags: ['organic', 'wild-harvested', 'single-ingredient'],
  },
  {
    slug: 'shampoo-bar-amla',
    name: 'Amla & Shikakai Shampoo Bar',
    vendor: 'Aranya Botanicals',
    vendorLocation: 'Auroville, Tamil Nadu',
    category: 'personal-care',
    categoryLabel: 'Personal Care',
    price: 399,
    gstRate: 18,
    sustainabilityScore: 90,
    shortDescription: 'Lathers like liquid shampoo. Zero plastic. ~80 washes per bar.',
    description: 'Traditional Ayurvedic herbs reformulated as a concentrated solid bar — amla for shine, shikakai for cleanse, brahmi for scalp health. Replaces two 250ml plastic bottles. Sulfate-free, safe for colour-treated hair, pH-balanced. Wrapped in compostable paper.',
    materials: ['Amla', 'Shikakai', 'Brahmi', 'Coconut oil', 'Shea butter'],
    certifications: ['Ecocert COSMOS Natural', 'SLS-Free', 'Plastic-Free Packaging'],
    inStock: true,
    stockCount: 156,
    imageColor: 'bg-amber-50',
    imageUrl: '/products/shampoo-bar-amla.jpg',
    tags: ['plastic-free', 'ayurvedic', 'zero-waste'],
  },

  // FASHION
  {
    slug: 'khadi-tote-bag',
    name: 'Hand-Spun Khadi Tote Bag',
    vendor: 'Gramodyog Udyog',
    vendorLocation: 'Wardha, Maharashtra',
    category: 'fashion',
    categoryLabel: 'Fashion',
    price: 799,
    gstRate: 5,
    sustainabilityScore: 97,
    shortDescription: 'Sturdy natural khadi tote spun & woven by village artisans.',
    description: 'Produced at a Gandhian village enterprise near Sevagram. Every metre of cloth is hand-spun on a charkha and hand-woven on a pit loom — zero electricity in production. Natural indigo dye. Reinforced handles carry 15kg comfortably. Supports 23 artisan families.',
    materials: ['Hand-spun khadi cotton', 'Natural indigo dye'],
    certifications: ['KVIC Certified Khadi', 'GI — Khadi'],
    inStock: true,
    stockCount: 39,
    imageColor: 'bg-indigo-100',
    imageUrl: '/products/khadi-tote-bag.jpg',
    tags: ['handmade', 'artisan', 'plastic-free', 'khadi'],
  },
  {
    slug: 'block-print-kurta',
    name: 'Ajrakh Block-Print Kurta (Unisex)',
    vendor: 'Khamir Crafts',
    vendorLocation: 'Bhuj, Gujarat',
    category: 'fashion',
    categoryLabel: 'Fashion',
    price: 2499,
    gstRate: 5,
    sustainabilityScore: 93,
    shortDescription: 'Ajrakh hand-block printed on organic cotton. Natural dyes only.',
    description: 'Made using the 400-year-old Ajrakh resist-print tradition from Kutch. Fabric is organic-certified cotton washed in nearby river water (returned via treatment plant). All dyes are botanical — indigo, pomegranate, madder, turmeric. Each piece takes 7 days to complete, 14 printing steps.',
    materials: ['GOTS Organic cotton', 'Natural botanical dyes'],
    certifications: ['GOTS', 'GI — Ajrakh', 'Crafts Council of India'],
    inStock: true,
    stockCount: 18,
    imageColor: 'bg-blue-100',
    imageUrl: '/products/block-print-kurta.jpg',
    tags: ['handmade', 'natural-dyes', 'artisan', 'slow-fashion'],
  },
  {
    slug: 'upcycled-denim-pouch',
    name: 'Upcycled Denim Pouch Set',
    vendor: 'ReWeave Studio',
    vendorLocation: 'Tirupur, Tamil Nadu',
    category: 'fashion',
    categoryLabel: 'Fashion',
    price: 699,
    gstRate: 12,
    sustainabilityScore: 85,
    shortDescription: 'Three pouches cut from deadstock denim. Zero new fabric used.',
    description: 'Cut and stitched from deadstock denim sourced from Tirupur export surplus — fabric that would otherwise be incinerated. Each set diverts approximately 500g of textile waste. YKK zippers, organic cotton lining. No two sets are identical — slight variations are proof of origin.',
    materials: ['Deadstock denim (100% cotton)', 'Organic cotton lining', 'YKK metal zipper'],
    certifications: ['Upcycled Certified', 'SA8000 Factory'],
    inStock: true,
    stockCount: 62,
    imageColor: 'bg-sky-100',
    imageUrl: '/products/upcycled-denim-pouch.jpg',
    tags: ['upcycled', 'zero-waste', 'circular'],
  },

  // FOOD
  {
    slug: 'cold-pressed-coconut-oil',
    name: 'Cold-Pressed Coconut Oil 500ml',
    vendor: 'Keraliya Organics',
    vendorLocation: 'Thrissur, Kerala',
    category: 'food',
    categoryLabel: 'Food',
    price: 449,
    gstRate: 5,
    sustainabilityScore: 91,
    shortDescription: 'Wood-pressed virgin coconut oil from certified organic farms.',
    description: 'Extracted within 4 hours of cracking using a traditional wooden ghani press (marachekku). No heat, no chemicals — retains natural lauric acid content. Sourced from 14 small organic farms in Thrissur district with Fairtrade-equivalent pricing. Glass bottle, metal lid.',
    materials: ['Organic coconut (Cocos nucifera)'],
    certifications: ['India Organic', 'PGS-India', 'Fairtrade Equivalent Pricing'],
    inStock: true,
    stockCount: 89,
    imageColor: 'bg-yellow-100',
    imageUrl: '/products/cold-pressed-coconut-oil.jpg',
    tags: ['organic', 'cold-pressed', 'glass-packaged'],
  },
  {
    slug: 'wild-forest-honey',
    name: 'Wild Forest Honey 400g',
    vendor: 'Vanyajeevi Collective',
    vendorLocation: 'Bastar, Chhattisgarh',
    category: 'food',
    categoryLabel: 'Food',
    price: 699,
    gstRate: 0,
    sustainabilityScore: 96,
    shortDescription: 'Cliff-harvested raw forest honey by Gond tribal hunters.',
    description: 'Harvested twice a year by Gond community honey hunters who have practiced sustainable cliff harvesting for centuries. Bees are entirely wild — no apiaries, no sugar feeding. Raw, unheated, unfiltered. Each batch has slightly different colour and flavour based on seasonal forest bloom. Supports forest conservation through direct income.',
    materials: ['Raw wild forest honey (Apis dorsata)'],
    certifications: ['Tribe India Fair Trade', 'Organic India Certified', 'No Adulteration Certified (AGMARK)'],
    inStock: true,
    stockCount: 44,
    imageColor: 'bg-amber-200',
    imageUrl: '/products/wild-forest-honey.jpg',
    tags: ['tribal', 'wild-harvested', 'raw', 'fair-trade'],
  },
  {
    slug: 'millets-variety-pack',
    name: 'Heirloom Millet Variety Pack — 5 × 250g',
    vendor: 'Sahaja Samrudha',
    vendorLocation: 'Mysuru, Karnataka',
    category: 'food',
    categoryLabel: 'Food',
    price: 599,
    gstRate: 0,
    sustainabilityScore: 98,
    shortDescription: 'Foxtail, finger, barnyard, kodo & little millet. Heirloom varieties.',
    description: 'Five heirloom millet varieties sourced from farmers who grow them without irrigation, chemical fertilisers, or pesticides — only open-pollinated seeds saved year to year. Millet farming uses 70% less water than rice and fixes nitrogen naturally. Includes recipe booklet. Packed in 100% home-compostable pouches.',
    materials: ['Foxtail millet', 'Finger millet', 'Barnyard millet', 'Kodo millet', 'Little millet'],
    certifications: ['PGS-India Organic', 'ICAR Heirloom Seed Registry'],
    inStock: true,
    stockCount: 73,
    imageColor: 'bg-lime-100',
    imageUrl: '/products/millets-variety-pack.jpg',
    tags: ['heirloom', 'organic', 'water-saving', 'biodiversity'],
  },
]

export const categories = [
  { slug: 'home-living', label: 'Home & Living', description: 'Sustainable tableware, textiles & décor', imageColor: 'bg-amber-100', count: products.filter(p => p.category === 'home-living').length },
  { slug: 'personal-care', label: 'Personal Care', description: 'Natural skincare, hair & body', imageColor: 'bg-rose-100', count: products.filter(p => p.category === 'personal-care').length },
  { slug: 'fashion', label: 'Fashion', description: 'Artisan textiles, bags & accessories', imageColor: 'bg-indigo-100', count: products.filter(p => p.category === 'fashion').length },
  { slug: 'food', label: 'Food', description: 'Organic, wild-harvested & heirloom foods', imageColor: 'bg-lime-100', count: products.filter(p => p.category === 'food').length },
]

export function getProduct(slug: string): Product | undefined {
  return products.find(p => p.slug === slug)
}

export function getProductsByCategory(category: Category): Product[] {
  return products.filter(p => p.category === category)
}

export function formatPrice(paise: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(paise)
}

export function getBasePrice(product: Product): number {
  return Math.round(product.price / (1 + product.gstRate / 100))
}

export function getGSTAmount(product: Product): number {
  return product.price - getBasePrice(product)
}
