// Same rules as the backend's CloudinaryService, checked before uploading to save a round trip
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function imageFileError(file: { type: string; size: number; name: string }): string | null {
  if (!IMAGE_TYPES.includes(file.type.toLowerCase())) return `${file.name}: only JPG, PNG and WebP images are allowed.`
  if (file.size === 0) return `${file.name}: the file is empty.`
  if (file.size > MAX_IMAGE_BYTES) return `${file.name}: images must not exceed 10 MB.`
  return null
}

// New display orders after moving the item at `from` to `to`; returns only the items whose order changed
export function reorder<T extends { id: number; displayOrder: number }>(items: T[], from: number, to: number) {
  const next = [...items]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
    .map((item, index) => ({ item, displayOrder: index }))
    .filter(({ item, displayOrder }) => item.displayOrder !== displayOrder)
}
