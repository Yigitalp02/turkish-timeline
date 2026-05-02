/**
 * Data-fetching functions for the Donemler (Eras) collection.
 *
 * All functions use Next.js 16's "use cache" directive with cacheTag so that
 * the revalidateTag() calls in src/lib/revalidate.ts bust exactly these entries
 * when an era or event is published.
 */
import { cacheTag, cacheLife } from 'next/cache'
import { getPayloadInstance } from '../payload'
import { CACHE_TAGS } from '../revalidate'
import type { Donemler, Olaylar } from '../../payload-types'

// ── Hub page ──────────────────────────────────────────────────────────────────

/** Returns every published era ordered by start_year ascending. */
export async function getAllPublishedEras(): Promise<Donemler[]> {
  'use cache'
  cacheTag(CACHE_TAGS.donemler)
  cacheLife('max')

  const payload = await getPayloadInstance()
  const result = await payload.find({
    collection: 'donemler',
    where: { _status: { equals: 'published' } },
    sort: 'start_year',
    depth: 1, // populate cover_image (Media) and key_figures (Kisiler)
    limit: 0,
  })
  return result.docs
}

// ── Era detail / Timeline page ─────────────────────────────────────────────────

/** Returns a single published era by its slug, or null if not found. */
export async function getEraBySlug(slug: string): Promise<Donemler | null> {
  'use cache'
  cacheTag(CACHE_TAGS.donemler)
  cacheLife('max')

  const payload = await getPayloadInstance()
  const result = await payload.find({
    collection: 'donemler',
    where: {
      and: [
        { slug: { equals: slug } },
        { _status: { equals: 'published' } },
      ],
    },
    depth: 2, // populate cover_image, key_figures → their portraits
    limit: 1,
  })
  return result.docs[0] ?? null
}

/**
 * Returns an era together with all its published events, sorted chronologically.
 * Events have participants (Kisiler) fully populated to depth 2 so the timeline
 * can render participant portraits and excerpts without additional requests.
 */
export async function getEraWithEvents(slug: string): Promise<{
  era: Donemler
  events: Olaylar[]
} | null> {
  'use cache'
  cacheTag(CACHE_TAGS.donemler)
  cacheTag(CACHE_TAGS.olaylar)
  cacheLife('max')

  const payload = await getPayloadInstance()

  const eraResult = await payload.find({
    collection: 'donemler',
    where: {
      and: [
        { slug: { equals: slug } },
        { _status: { equals: 'published' } },
      ],
    },
    depth: 2,
    limit: 1,
  })

  const era = eraResult.docs[0]
  if (!era) return null

  const eventsResult = await payload.find({
    collection: 'olaylar',
    where: {
      and: [
        { era: { equals: era.id } },
        { _status: { equals: 'published' } },
      ],
    },
    // Primary sort: exact_date asc; secondary: sort_order asc (tie-break on same date)
    sort: ['exact_date', 'sort_order'],
    depth: 2, // populate participants → their portraits, era reference
    limit: 0, // return all events (no pagination on the timeline page)
  })

  return { era, events: eventsResult.docs }
}

// ── generateStaticParams helper ───────────────────────────────────────────────

/**
 * Returns the slugs of all published eras.
 * Used in `[slug]/page.tsx` → generateStaticParams().
 */
export async function getEraStaticParams(): Promise<{ slug: string }[]> {
  'use cache'
  cacheTag(CACHE_TAGS.donemler)
  cacheLife('max')

  const payload = await getPayloadInstance()
  const result = await payload.find({
    collection: 'donemler',
    where: { _status: { equals: 'published' } },
    select: { slug: true },
    limit: 0,
  })

  return result.docs
    .filter((d): d is Donemler & { slug: string } => Boolean(d.slug))
    .map((d) => ({ slug: d.slug }))
}
