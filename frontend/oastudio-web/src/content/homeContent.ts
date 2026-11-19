// Landing page content the admin can edit (Atelier control → Home page).
// The saved document comes from /api/public/site/home; anything missing falls back to these defaults,
// so the page works before the admin has saved anything.
import { en, fr, type Dictionary, type Lang } from '../i18n/translations.ts'
import { site } from './site.ts'

export type Localized = Record<Lang, string>

export const SECTION_IDS = ['hero', 'featured', 'founder', 'studio', 'services', 'cta', 'map'] as const
export type SectionId = (typeof SECTION_IDS)[number]

export interface HomeContent {
  sections: { id: SectionId; visible: boolean }[]
  hero: { headline: Localized; intro: Localized; imageUrl: string; caption: Localized; captionLink: string }
  // Empty projectIds = the three newest published projects
  featured: { eyebrow: Localized; title: Localized; projectIds: number[] }
  founder: { eyebrow: Localized; name: string; role: Localized; bio: Localized; photoUrl: string }
  studio: { eyebrow: Localized; headline: Localized; text: Localized; imageUrl: string }
  services: { eyebrow: Localized; title: Localized; items: { title: Localized; text: Localized }[] }
  cta: { eyebrow: Localized; title: Localized; button: Localized }
}

const both = (pick: (d: Dictionary) => string): Localized => ({ fr: pick(fr), en: pick(en) })

export const defaultHomeContent: HomeContent = {
  sections: SECTION_IDS.map((id) => ({ id, visible: true })),
  hero: {
    headline: both((d) => d.hero.headline),
    intro: both((d) => d.hero.intro),
    imageUrl: site.images.heroFallback,
    caption: both((d) => d.hero.caption),
    captionLink: '/projects/duo-residences',
  },
  featured: { eyebrow: both((d) => d.home.portfolio), title: both((d) => d.home.featured), projectIds: [] },
  founder: {
    eyebrow: both((d) => d.aboutPage.founder),
    name: site.founder.name,
    role: both((d) => d.aboutPage.founderRole),
    bio: both((d) => d.aboutPage.founderBio),
    photoUrl: site.founder.photoUrl,
  },
  studio: {
    eyebrow: both((d) => d.home.theStudio),
    headline: both((d) => d.about.headline),
    text: both((d) => d.about.presentation),
    imageUrl: site.images.studio,
  },
  services: {
    eyebrow: both((d) => d.home.expertise),
    title: both((d) => d.home.services),
    items: en.services.map((s, i) => ({ title: { fr: fr.services[i].title, en: s.title }, text: { fr: fr.services[i].text, en: s.text } })),
  },
  cta: { eyebrow: both((d) => d.home.begin), title: both((d) => d.home.ctaTitle), button: both((d) => d.home.cta) },
}

type Saved = { [K in keyof HomeContent]?: Partial<HomeContent[K]> }

/** Fills gaps in the saved document with defaults; keeps the admin's section order and adds sections it doesn't know yet. */
export function withDefaults(saved: Saved | null | undefined): HomeContent {
  const s = saved ?? {}
  const known = (s.sections ?? []).filter(
    (x, i, all): x is { id: SectionId; visible: boolean } =>
      !!x && SECTION_IDS.includes(x.id as SectionId) && all.findIndex((y) => y?.id === x.id) === i,
  )
  const missing = SECTION_IDS.filter((id) => !known.some((x) => x.id === id)).map((id) => ({ id, visible: true }))
  const d = defaultHomeContent
  return {
    sections: [...known.map((x) => ({ id: x.id, visible: x.visible !== false })), ...missing],
    hero: { ...d.hero, ...s.hero },
    featured: { ...d.featured, ...s.featured },
    founder: { ...d.founder, ...s.founder },
    studio: { ...d.studio, ...s.studio },
    services: { ...d.services, ...s.services },
    cta: { ...d.cta, ...s.cta },
  }
}

/** Text in the visitor's language, falling back to the other language when one was left empty. */
export const tr = (text: Localized | undefined, lang: Lang) => text?.[lang] || text?.fr || text?.en || ''
