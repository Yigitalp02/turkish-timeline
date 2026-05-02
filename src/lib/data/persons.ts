/**
 * Data-fetching functions for the Kisiler (Persons) collection.
 *
 * All read functions are tagged with CACHE_TAGS.kisiler (and CACHE_TAGS.olaylar
 * where events are also involved) so that publishing in the CMS instantly busts
 * the relevant entries via revalidateTag().
 */
import { cacheTag, cacheLife } from 'next/cache'
import { getPayloadInstance } from '../payload'
import { CACHE_TAGS } from '../revalidate'
import type { Kisiler, Olaylar } from '../../payload-types'

// ── Profile page ──────────────────────────────────────────────────────────────

/**
 * Returns the full profile of a published person by slug.
 * Depth 2 populates: portrait (Media) and any nested relationships in biography.
 */
export async function getPersonBySlug(slug: string): Promise<Kisiler | null> {
  'use cache'
  cacheTag(CACHE_TAGS.kisiler)
  cacheLife('max')

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
}

// ── Hover popover (InlinePersonMentionBlock) ──────────────────────────────────

/**
 * Lightweight person summary for the hover popover card.
 * Only fetches portrait, excerpt, title, role, slug — avoids loading the full
 * Lexical biography JSON (which can be large).
 */
export async function getPersonSummary(id: number): Promise<Kisiler | null> {
  'use cache'
  cacheTag(CACHE_TAGS.kisiler)
  cacheLife('max')

  const payload = await getPayloadInstance()
  try {
    // depth: 1 populates portrait (Media); other fields are lightweight primitives
    return await payload.findByID({
      collection: 'kisiler',
      id,
      depth: 1,
      draft: false, // always return the published version
    })
  } catch {
    // findByID throws a 404-style error when the document does not exist
    return null
  }
}

// ── Person profile — related events ───────────────────────────────────────────

/**
 * Returns all published events where this person appears as a participant.
 * Sorted chronologically. Used for the "Katıldığı Olaylar" section.
 */
export async function getEventsByPerson(personId: number): Promise<Olaylar[]> {
  'use cache'
  cacheTag(CACHE_TAGS.kisiler)
  cacheTag(CACHE_TAGS.olaylar)
  cacheLife('max')

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
    depth: 1, // populate era reference (Donemler title + slug)
    limit: 0,
  })
  return result.docs
}

// ── Persons index page ─────────────────────────────────────────────────────────

/**
 * Returns all published persons sorted alphabetically by full_name.
 * Used for the /kisiler index page.
 */
export async function getAllPublishedPersons(): Promise<Kisiler[]> {
  'use cache'
  cacheTag(CACHE_TAGS.kisiler)
  cacheLife('max')

  const payload = await getPayloadInstance()
  const result = await payload.find({
    collection: 'kisiler',
    where: { _status: { equals: 'published' } },
    sort: 'full_name',
    depth: 1, // populate portrait
    limit: 0,
  })
  return result.docs
}

// ── generateStaticParams helper ───────────────────────────────────────────────

/**
 * Returns slugs for all published persons.
 * Used in `[slug]/page.tsx` → generateStaticParams().
 */
export async function getPersonStaticParams(): Promise<{ slug: string }[]> {
  'use cache'
  cacheTag(CACHE_TAGS.kisiler)
  cacheLife('max')

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
}
