/**
 * Data-fetching functions for the Donemler (Eras) collection.
 *
 * Each function is wrapped with unstable_cache so results are stored in
 * Next.js's Data Cache and invalidated by revalidateTag() calls fired from
 * the Payload afterChange / afterDelete hooks in src/lib/revalidate.ts.
 *
 * unstable_cache is the stable alternative to the "use cache" directive and
 * works correctly alongside Payload CMS without requiring experimental flags.
 */
import { unstable_cache } from 'next/cache'
import { getPayloadInstance } from '../payload'
import { CACHE_TAGS } from '../revalidate'
import type { Donemler, Olaylar } from '../../payload-types'

// ── Hub page ──────────────────────────────────────────────────────────────────

/** Returns every published era ordered by start_year ascending. */
export const getAllPublishedEras = unstable_cache(
  async (): Promise<Donemler[]> => {
    const payload = await getPayloadInstance()
    const result = await payload.find({
      collection: 'donemler',
      where: { _status: { equals: 'published' } },
      sort: 'start_year',
      depth: 1, // populate cover_image (Media) and key_figures (Kisiler)
      limit: 0,
    })
    return result.docs
  },
  [CACHE_TAGS.donemler, 'all'],
  { tags: [CACHE_TAGS.donemler] },
)

// ── Era detail / Timeline page ─────────────────────────────────────────────────

/** Returns a single published era by its slug, or null if not found. */
export const getEraBySlug = unstable_cache(
  async (slug: string): Promise<Donemler | null> => {
    const payload = await getPayloadInstance()
    const result = await payload.find({
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
    return result.docs[0] ?? null
  },
  [CACHE_TAGS.donemler, 'by-slug'],
  { tags: [CACHE_TAGS.donemler] },
)

/**
 * Returns an era together with all its published events, sorted chronologically.
 * Events have participants (Kisiler) fully populated to depth 2 so the timeline
 * can render participant portraits and excerpts without additional requests.
 */
export const getEraWithEvents = unstable_cache(
  async (slug: string): Promise<{ era: Donemler; events: Olaylar[] } | null> => {
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
      // Primary sort: exact_date asc; secondary: sort_order asc
      sort: ['exact_date', 'sort_order'],
      depth: 2,
      limit: 0,
    })

    return { era, events: eventsResult.docs }
  },
  [CACHE_TAGS.donemler, CACHE_TAGS.olaylar, 'with-events'],
  { tags: [CACHE_TAGS.donemler, CACHE_TAGS.olaylar] },
)

// ── generateStaticParams helper ───────────────────────────────────────────────

/**
 * Returns the slugs of all published eras.
 * Used in `[slug]/page.tsx` → generateStaticParams().
 */
export const getEraStaticParams = unstable_cache(
  async (): Promise<{ slug: string }[]> => {
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
  },
  [CACHE_TAGS.donemler, 'static-params'],
  { tags: [CACHE_TAGS.donemler] },
)
