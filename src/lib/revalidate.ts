import { revalidateTag, revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

/**
 * Canonical cache tag constants.
 * Import these in data-fetching functions (Phase 6) so the tags used for
 * caching always match the tags used for invalidation here.
 */
export const CACHE_TAGS = {
  donemler: 'donemler',
  kisiler: 'kisiler',
  olaylar: 'olaylar',
} as const

// ── afterChange hooks ─────────────────────────────────────────────────────────
// Guard: only revalidate when a document is actually published.
// Payload fires afterChange on every save — including draft saves — so without
// this guard every keystroke in the editor would bust the cache.

export const revalidateDonemler: CollectionAfterChangeHook = ({ doc }) => {
  if (doc._status !== 'published') return

  revalidateTag(CACHE_TAGS.donemler, 'max')
  revalidatePath('/')                                  // Era cards on the Hub page

  if (doc.slug) {
    revalidatePath(`/donemler/${doc.slug}`)            // The specific timeline page
  }

  console.log(`[ISR] ✓ donemler revalidated → /donemler/${doc.slug ?? ''}`)
}

export const revalidateKisiler: CollectionAfterChangeHook = ({ doc }) => {
  if (doc._status !== 'published') return

  revalidateTag(CACHE_TAGS.kisiler, 'max')
  revalidatePath('/kisiler')                           // Persons index page

  if (doc.slug) {
    revalidatePath(`/kisiler/${doc.slug}`)             // The specific profile page
  }

  console.log(`[ISR] ✓ kisiler revalidated → /kisiler/${doc.slug ?? ''}`)
}

export const revalidateOlaylar: CollectionAfterChangeHook = ({ doc }) => {
  if (doc._status !== 'published') return

  revalidateTag(CACHE_TAGS.olaylar, 'max')

  // Revalidate the parent era's timeline page.
  // doc.era is either a populated Donemler object (if depth >= 1) or a raw ID.
  const era = doc.era
  const eraSlug =
    era !== null && typeof era === 'object' && 'slug' in era
      ? (era as { slug?: string }).slug
      : null

  if (eraSlug) {
    revalidatePath(`/donemler/${eraSlug}`)
    console.log(`[ISR] ✓ olaylar revalidated → /donemler/${eraSlug}`)
  } else {
    // Era wasn't populated — fall back to busting the whole donemler tag
    revalidateTag(CACHE_TAGS.donemler, 'max')
    console.log('[ISR] ✓ olaylar revalidated → donemler tag (era slug unavailable)')
  }
}

// ── afterDelete hooks ─────────────────────────────────────────────────────────
// Deletions must also clear the cache; afterChange does not fire on delete.

export const revalidateDonemlerOnDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidateTag(CACHE_TAGS.donemler, 'max')
  revalidatePath('/')
  if (doc?.slug) revalidatePath(`/donemler/${doc.slug}`)
  console.log(`[ISR] ✓ donemler deleted → cache cleared`)
}

export const revalidateKisilerOnDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidateTag(CACHE_TAGS.kisiler, 'max')
  revalidatePath('/kisiler')
  if (doc?.slug) revalidatePath(`/kisiler/${doc.slug}`)
  console.log(`[ISR] ✓ kisiler deleted → cache cleared`)
}

export const revalidateOlaylarOnDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidateTag(CACHE_TAGS.olaylar, 'max')
  const era = doc?.era
  const eraSlug =
    era !== null && typeof era === 'object' && 'slug' in era
      ? (era as { slug?: string }).slug
      : null
  if (eraSlug) revalidatePath(`/donemler/${eraSlug}`)
  console.log(`[ISR] ✓ olaylar deleted → cache cleared`)
}
