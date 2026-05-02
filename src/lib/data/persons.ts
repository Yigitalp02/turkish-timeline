/**
 * Data-fetching functions for the Kisiler (Persons) collection.
 *
 * All read functions are wrapped with unstable_cache and tagged so that
 * publishing in the CMS (via the afterChange ISR hooks) instantly busts
 * the relevant entries via revalidateTag().
 */
import { unstable_cache } from 'next/cache'
import { getPayloadInstance } from '../payload'
import { CACHE_TAGS } from '../revalidate'
import type { Kisiler, Olaylar } from '../../payload-types'

// ── Profile page ──────────────────────────────────────────────────────────────

/**
 * Returns the full profile of a published person by slug.
 * Depth 2 populates: portrait (Media) and any nested relationships in biography.
 */
export const getPersonBySlug = unstable_cache(
  async (slug: string): Promise<Kisiler | null> => {
    const payload = await getPayloadInstance()
    const result = await payload.find({
      collection: 'kisiler',
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
  [CACHE_TAGS.kisiler, 'by-slug'],
  { tags: [CACHE_TAGS.kisiler] },
)

// ── Hover popover (InlinePersonMentionBlock) ──────────────────────────────────

/**
 * Lightweight person summary for the hover popover card.
 * Only portrait, excerpt, title, role, slug — avoids the full Lexical biography.
 */
export const getPersonSummary = unstable_cache(
  async (id: number): Promise<Kisiler | null> => {
    const payload = await getPayloadInstance()
    try {
      return await payload.findByID({
        collection: 'kisiler',
        id,
        depth: 1, // populate portrait (Media)
        draft: false,
      })
    } catch {
      return null
    }
  },
  [CACHE_TAGS.kisiler, 'summary'],
  { tags: [CACHE_TAGS.kisiler] },
)

// ── Person profile — related events ───────────────────────────────────────────

/**
 * Returns all published events where this person appears as a participant.
 * Sorted chronologically. Used for the "Katıldığı Olaylar" section.
 */
export const getEventsByPerson = unstable_cache(
  async (personId: number): Promise<Olaylar[]> => {
    const payload = await getPayloadInstance()
    const result = await payload.find({
      collection: 'olaylar',
      where: {
        and: [
          { participants: { contains: personId } },
          { _status: { equals: 'published' } },
        ],
      },
      sort: 'exact_date',
      depth: 1,
      limit: 0,
    })
    return result.docs
  },
  [CACHE_TAGS.kisiler, CACHE_TAGS.olaylar, 'events-by-person'],
  { tags: [CACHE_TAGS.kisiler, CACHE_TAGS.olaylar] },
)

// ── Persons index page ─────────────────────────────────────────────────────────

/**
 * Returns all published persons sorted alphabetically by full_name.
 * Used for the /kisiler index page.
 */
export const getAllPublishedPersons = unstable_cache(
  async (): Promise<Kisiler[]> => {
    const payload = await getPayloadInstance()
    const result = await payload.find({
      collection: 'kisiler',
      where: { _status: { equals: 'published' } },
      sort: 'full_name',
      depth: 1,
      limit: 0,
    })
    return result.docs
  },
  [CACHE_TAGS.kisiler, 'all'],
  { tags: [CACHE_TAGS.kisiler] },
)

// ── generateStaticParams helper ───────────────────────────────────────────────

/**
 * Returns slugs for all published persons.
 * Used in `[slug]/page.tsx` → generateStaticParams().
 */
export const getPersonStaticParams = unstable_cache(
  async (): Promise<{ slug: string }[]> => {
    const payload = await getPayloadInstance()
    const result = await payload.find({
      collection: 'kisiler',
      where: { _status: { equals: 'published' } },
      select: { slug: true },
      limit: 0,
    })
    return result.docs
      .filter((k): k is Kisiler & { slug: string } => Boolean(k.slug))
      .map((k) => ({ slug: k.slug }))
  },
  [CACHE_TAGS.kisiler, 'static-params'],
  { tags: [CACHE_TAGS.kisiler] },
)
