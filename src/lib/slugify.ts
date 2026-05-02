import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Converts a string to a URL-safe slug, handling Turkish and Ottoman characters.
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/â/g, 'a') // Ottoman/archaic
    .replace(/î/g, 'i')
    .replace(/û/g, 'u')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Payload beforeChange hook factory.
 * Auto-generates the slug field from the given source field.
 * Only fills the slug if it is currently empty — allows manual overrides.
 */
export const populateSlug = (sourceField: string): CollectionBeforeChangeHook => {
  return ({ data }) => {
    if (data[sourceField] && !data.slug) {
      return {
        ...data,
        slug: slugify(data[sourceField] as string),
      }
    }
    return data
  }
}

/**
 * Payload beforeChange hook for Olaylar.
 * Auto-populates display_year from exact_date if display_year is not set.
 */
export const populateDisplayYear: CollectionBeforeChangeHook = ({ data }) => {
  if (data.exact_date && !data.display_year) {
    const year = new Date(data.exact_date as string).getFullYear()
    return { ...data, display_year: year }
  }
  return data
}
