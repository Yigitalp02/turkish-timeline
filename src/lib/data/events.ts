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
