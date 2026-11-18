// Editable firm content. Every value marked PLACEHOLDER must be replaced with
// information supplied by the firm before launch (PROJECT_INSTRUCTIONS.md §6.4).

export const site = {
  name: 'OA Architecture',
  tagline: 'Architecture & Design',

  hero: {
    headline: 'Architecture of Silence.',
    intro:
      'PLACEHOLDER — a short introduction to the studio: who it is, where it works and what it builds.',
  },

  about: {
    headline: 'Defining the Silent Modernity.',
    presentation:
      'PLACEHOLDER — firm presentation. Describe the studio, its founding and its fields of practice.',
    history:
      'PLACEHOLDER — history and background of the firm. Add key dates and milestones supplied by the firm.',
    philosophy:
      'PLACEHOLDER — the architectural philosophy that guides the studio’s work.',
    approach: [
      { title: 'Site & Context', text: 'PLACEHOLDER — how the studio reads each site.' },
      { title: 'Material & Light', text: 'PLACEHOLDER — the role of materials and light.' },
      { title: 'Precision & Delivery', text: 'PLACEHOLDER — how projects are documented and delivered.' },
    ],
    // Leave empty until the firm provides team information
    team: [] as { name: string; role: string; photoUrl?: string }[],
  },

  services: [
    { title: 'Architectural Design', text: 'PLACEHOLDER — description of this service.' },
    { title: 'Interior Architecture', text: 'PLACEHOLDER — description of this service.' },
    { title: 'BIM & Technical Documentation', text: 'PLACEHOLDER — description of this service.' },
    { title: 'Urban & Landscape Planning', text: 'PLACEHOLDER — description of this service.' },
  ],

  contact: {
    address: 'PLACEHOLDER — office street address, city, country',
    phone: 'PLACEHOLDER — +000 00 000 000',
    email: 'PLACEHOLDER — contact@example.com',
    // Google Maps embed URL; leave empty to hide the map
    mapEmbedUrl: '',
  },

  social: [
    { label: 'Instagram', href: '' },
    { label: 'LinkedIn', href: '' },
    { label: 'Behance', href: '' },
  ],
}
