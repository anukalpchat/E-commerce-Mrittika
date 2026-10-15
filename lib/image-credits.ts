// Sources for product photos added from openly licensed collections (found via Openverse).
// CC BY photos must credit the creator; product pages show this credit under the image.
// All catalogue photos are illustrative stock images, not photos of the exact item sold.

export interface ImageCredit {
  title: string
  creator: string
  license: string
  url: string
}

const CREDITS: Record<string, ImageCredit> = {
  '/products/coconut-shell-bowls.jpg': { title: 'Macadamia nuts in the coconut \'bowl\'', creator: 'Tatters ✾', license: 'CC BY 2.0', url: 'https://www.flickr.com/photos/62938898@N00/863763645' },
  '/products/jute-floor-rug.jpg': { title: 'Binding Two Rugs Together', creator: 'emily @ go haus go', license: 'CC BY 2.0', url: 'https://www.flickr.com/photos/60849758@N05/8595486600' },
  '/products/copper-lota.jpg': { title: 'Water brass mug lord Shiva', creator: '', license: 'CC0 1.0', url: 'https://www.rawpixel.com/image/6029935/photo-image-background-public-domain-wood' },
  '/products/soy-wax-candle.jpg': { title: 'Free soy candle lit glass', creator: '', license: 'CC0 1.0', url: 'https://www.rawpixel.com/image/5918423/photo-image-public-domain-wooden-glass' },
  '/products/kantha-quilt.jpg': { title: 'Kantha (bed cover), West Bengal — Honolulu Museum of Art', creator: 'Hiart', license: 'CC0 1.0', url: 'https://commons.wikimedia.org/w/index.php?curid=60289159' },
  '/products/natural-loofah-scrubber.jpg': { title: '2022-11-17_13-06-59_JO_day5_Al-Karak_city_JH', creator: 'Juhele_CZ', license: 'CC0 1.0', url: 'https://www.flickr.com/photos/96541566@N06/52638552517' },
  '/products/ubtan-face-pack.jpg': { title: 'Turmeric Root vs Turmeric Powder', creator: 'formulatehealth', license: 'CC BY 2.0', url: 'https://www.flickr.com/photos/189590028@N07/50396528903' },
  '/products/solid-deodorant-tin.jpg': { title: 'Adventures in making lip balm', creator: 'saiberiac', license: 'CC BY 2.0', url: 'https://www.flickr.com/photos/22806462@N03/32472416024' },
  '/products/neem-wood-comb.jpg': { title: 'Nakamise-dori, wooden combs', creator: 'DavideGorla', license: 'CC BY 2.0', url: 'https://www.flickr.com/photos/66321334@N00/7326865382' },
  '/products/ikat-cotton-saree.jpg': { title: 'COTTON SAMBALPURI IKAT SAREE', creator: 'RubyGoes', license: 'CC BY 2.0', url: 'https://www.flickr.com/photos/61997808@N00/4630977703' },
  '/products/kantha-stitch-stole.jpg': { title: 'SILK KANTHA STOLE', creator: 'RubyGoes', license: 'CC BY 2.0', url: 'https://www.flickr.com/photos/61997808@N00/5292270669' },
  '/products/kolhapuri-chappals.jpg': { title: 'A person holding a pair of handcrafted leather sandals (Known as Kolhapuri Payta', creator: 'Pritam Sonone', license: 'CC0 1.0', url: 'https://wordpress.org/photos/photo/160678607c/' },
  '/products/organic-jaggery.jpg': { title: '(1) Jaggery Gud Punjab India', creator: 'Giridhar Appaji Nag Y', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/w/index.php?curid=29908723' },
  '/products/darjeeling-green-tea.jpg': { title: 'Green tea 3 appearances', creator: 'Alessandro Martini', license: 'CC0 1.0', url: 'https://commons.wikimedia.org/w/index.php?curid=15435152' },
  '/products/wayanad-black-pepper.jpg': { title: 'peppercorn pyramid', creator: 'jlodder', license: 'CC BY 2.0', url: 'https://www.flickr.com/photos/45040421@N06/26611981037' },
  '/products/shade-grown-arabica-coffee.jpg': { title: 'Coffee beans - roasted', creator: 'AndreasPoike', license: 'CC BY 2.0', url: 'https://www.flickr.com/photos/88798523@N02/14749262442' },
}

export function getImageCredit(imageUrl: string): ImageCredit | undefined {
  return CREDITS[imageUrl]
}
