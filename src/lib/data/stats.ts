/**
 * Aggregated count queries for the Hero section stats bar.
 * All three counts are fetched in parallel and cached together under
 * all three collection tags — any publish action busts this entry.
 */
import { unstable_cache } from 'next/cache'
import { getPayloadInstance } from '../payload'
import { CACHE_TAGS } from '../revalidate'

export interface SiteStats {
  eras: number
  events: number
  persons: number
}

export const getPublishedCounts = unstable_cache(
  async (): Promise<SiteStats> => {
    const payload = await getPayloadInstance()

    const published = { _status: { equals: 'published' } } as const

    const [erasRes, eventsRes, personsRes] = await Promise.all([
      payload.find({ collection: 'donemler', where: published, limit: 0 }),
      payload.find({ collection: 'olaylar',  where: published, limit: 0 }),
      payload.find({ collection: 'kisiler',  where: published, limit: 0 }),
    ])

    return {
      eras:    erasRes.totalDocs,
      events:  eventsRes.totalDocs,
      persons: personsRes.totalDocs,
    }
  },
  [CACHE_TAGS.donemler, CACHE_TAGS.olaylar, CACHE_TAGS.kisiler, 'counts'],
  { tags: [CACHE_TAGS.donemler, CACHE_TAGS.olaylar, CACHE_TAGS.kisiler] },
)
