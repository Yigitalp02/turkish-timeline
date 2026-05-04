/**
 * Data-fetching functions for the Olaylar (Events) collection.
 *
 * getEraWithEvents() in eras.ts covers the common case of fetching an era
 * together with its events in one shot. This module exposes getEventsByEra()
 * as a standalone function for cases where only events are needed.
 */
import { unstable_cache } from 'next/cache'
import { getPayloadInstance } from '../payload'
import { CACHE_TAGS } from '../revalidate'
import type { Olaylar } from '../../payload-types'

// ── Event detail page ─────────────────────────────────────────────────────────

/** Returns a single published event by slug. Depth 2 populates era + participants. */
export const getEventBySlug = unstable_cache(
  async (slug: string): Promise<Olaylar | null> => {
    const payload = await getPayloadInstance()
    const result  = await payload.find({
      collection: 'olaylar',
      where: {
        and: [
          { slug:    { equals: slug      } },
          { _status: { equals: 'published' } },
        ],
      },
      depth: 2,
      limit: 1,
    })
    return result.docs[0] ?? null
  },
  [CACHE_TAGS.olaylar, 'by-slug'],
  { tags: [CACHE_TAGS.olaylar] },
)

/** Slugs of all published events — used in generateStaticParams. */
export const getEventStaticParams = unstable_cache(
  async (): Promise<{ event_slug: string }[]> => {
    const payload = await getPayloadInstance()
    const result  = await payload.find({
      collection: 'olaylar',
      where: { _status: { equals: 'published' } },
      select: { slug: true },
      limit: 0,
    })
    return result.docs
      .filter((o): o is Olaylar & { slug: string } => Boolean(o.slug))
      .map((o) => ({ event_slug: o.slug }))
  },
  [CACHE_TAGS.olaylar, 'static-params'],
  { tags: [CACHE_TAGS.olaylar] },
)

/**
 * Returns all published events for a given era ID, ordered chronologically.
 * Participants (Kisiler) are populated to depth 2.
 *
 * Prefer getEraWithEvents(slug) when you need both the era and its events —
 * it avoids a separate round-trip for the era itself.
 */
export const getEventsByEra = unstable_cache(
  async (eraId: number): Promise<Olaylar[]> => {
    const payload = await getPayloadInstance()
    const result = await payload.find({
      collection: 'olaylar',
      where: {
        and: [
          { era: { equals: eraId } },
          { _status: { equals: 'published' } },
        ],
      },
      sort: ['exact_date', 'sort_order'],
      depth: 2,
      limit: 0,
    })
    return result.docs
  },
  [CACHE_TAGS.olaylar, 'by-era'],
  { tags: [CACHE_TAGS.olaylar] },
)
