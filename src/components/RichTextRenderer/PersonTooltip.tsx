'use client'

/**
 * PersonTooltip adapter for RichTextRenderer.
 *
 * The RichTextRenderer receives fully-populated Kisiler/Media objects from
 * Payload (depth >= 1), so we don't need to fetch anything.  This thin
 * adapter converts those rich server-side props into the `prefetchedData`
 * shape expected by the base <PersonTooltip> component, which skips the
 * /api/persons/[id]/summary call entirely.
 *
 * All portal, animation, and positioning logic lives in the base component.
 */

import { PersonTooltip as PersonTooltipBase } from '@/components/PersonTooltip'

export interface PersonTooltipProps {
  personId: number
  displayName: string
  slug?: string
  title?: string
  excerpt?: string
  portraitUrl?: string
  portraitAlt?: string
}

export function PersonTooltip({
  personId,
  displayName,
  slug,
  title,
  excerpt,
  portraitUrl,
  portraitAlt,
}: PersonTooltipProps) {
  return (
    <PersonTooltipBase
      personId={personId}
      personName={displayName}
      prefetchedData={{
        id:       personId,
        full_name: displayName,
        slug:     slug   ?? null,
        title:    title  ?? null,
        excerpt:  excerpt ?? null,
        portrait: portraitUrl
          ? { url: portraitUrl, alt: portraitAlt ?? null }
          : null,
      }}
    />
  )
}
