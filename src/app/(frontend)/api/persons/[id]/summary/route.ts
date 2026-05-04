/**
 * GET /api/persons/[id]/summary
 *
 * Returns a lightweight person card payload for the InlinePersonMention hover
 * popover.  Called client-side by the popover component when a user hovers or
 * taps an inline person mention in the rich-text renderer.
 *
 * Response shape:
 *   { id, full_name, excerpt, title, role, slug, portrait }
 *
 * Returns 404 JSON when the person is not found or not published.
 */
import { type NextRequest, NextResponse } from 'next/server'
import { getPersonSummary } from '@/lib/data/persons'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const numericId = Number(id)

  if (!Number.isInteger(numericId) || numericId <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const person = await getPersonSummary(numericId)

  if (!person) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(person, {
    headers: {
      // Allow the browser to cache the card for 1 h.
      // The Next.js data cache (unstable_cache + revalidateTag) ensures the
      // underlying Payload query is always fresh after a CMS publish, so this
      // only affects repeat hover requests within the same browser session.
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
