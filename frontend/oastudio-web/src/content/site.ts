// Editable firm content. Every value marked PLACEHOLDER must be replaced with
// information supplied by the firm before launch (PROJECT_INSTRUCTIONS.md §6.4).
// Translatable copy (hero, about, services) lives in src/i18n/translations.ts.

// Studio photos on Cloudinary; f_auto,q_auto serves WebP/AVIF at a sensible size
const cloudinary = (path: string, width: number, crop = '') =>
  `https://res.cloudinary.com/ggqgsc8v/image/upload/${crop}f_auto,q_auto,w_${width}/${path}`

export const site = {
  name: 'OA Architecture',
  images: {
    heroFallback: cloudinary('v1794966558/oastudio/projects/duo-residences/3.jpg', 2400), // DUO Residences at dusk
    studio: cloudinary('v1794966607/oastudio/projects/villa-moonlight/5.jpg', 1400), // Villa Moonlight living room
    // Villa Oikos arches; crop drops the top band (logo) and right edge (signature)
    aboutPortrait: cloudinary('v1794966613/oastudio/projects/villa-oikos/1.jpg', 1000, 'c_crop,w_0.75,h_0.8,g_south_west/c_fill,ar_3:4/'),
    adminLogin: cloudinary('v1794966595/oastudio/projects/villa-lumiere/1.jpg', 2400), // Villa Lumière at night
  },

  contact: {
    address: "4éme Etage, Bureau n2, Immeuble el Baraka, Bd Dr Taieb Hachicha, M'saken 4070",
    phone: '+216 52 685 812',
    email: 'oa.studio@outlook.com',
    // International format, digits only, for https://wa.me/<number>
    whatsapp: '21652685812',
    // Google Maps embed URL; leave empty to hide the map
    // Pin = studio's Google Maps place (maps.app.goo.gl/zawdf9XQVJfs4We49)
    mapEmbedUrl: 'https://maps.google.com/maps?q=35.7339612,10.5757821&z=17&output=embed',
  },

  social: [
    { label: 'Instagram', href: 'https://www.instagram.com/oa.architecturedesign/' },
    { label: 'Facebook', href: 'https://www.facebook.com/Oussama.Attia.Architecte' },
    { label: 'LinkedIn', href: '' },
    { label: 'Behance', href: '' },
  ],
}
