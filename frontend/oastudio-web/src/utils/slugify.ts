// "Villa Lumière — Phase 2" -> "villa-lumiere-phase-2"; matches the backend slug rule ^[a-z0-9]+(-[a-z0-9]+)*$
export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const isValidSlug = (slug: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
