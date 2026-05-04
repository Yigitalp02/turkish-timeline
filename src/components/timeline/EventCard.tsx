/**
 * EventCard — Server Component.
 *
 * Extracts and serialises the subset of Olaylar data needed by EventCardShell
 * (Client Component), then renders RichTextRenderer as `children` so the rich
 * text is server-rendered and passed through the server→client boundary safely.
 *
 * Why the split?
 *   • RichTextRenderer is a Server Component — it must stay on the server.
 *   • Expand/collapse interactivity needs client state.
 *   • The Next.js "children as RSC" pattern lets us keep both.
 */

import type { Olaylar, Kisiler, Media } from '@/payload-types'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { EventCardShell, type ParticipantSummary } from './EventCardShell'

// ── Date formatting ───────────────────────────────────────────────────────────

function formatTurkishDate(isoDate: string): string {
  try {
    // Payload stores dates as ISO strings; normalise to midnight UTC to avoid
    // day-shift problems caused by local timezone offsets.
    const normalized = isoDate.includes('T') ? isoDate : `${isoDate}T00:00:00Z`
    return new Intl.DateTimeFormat('tr-TR', {
      day:      'numeric',
      month:    'long',
      year:     'numeric',
      timeZone: 'UTC',
    }).format(new Date(normalized))
  } catch {
    return isoDate
  }
}

// ── Type helpers ──────────────────────────────────────────────────────────────

function resolveMedia(raw: unknown): Media | null {
  if (raw && typeof raw === 'object' && 'url' in raw) return raw as Media
  return null
}

function resolveKisiler(raw: unknown): Kisiler | null {
  if (raw && typeof raw === 'object' && 'full_name' in raw) return raw as Kisiler
  return null
}

// ── Component ─────────────────────────────────────────────────────────────────

interface EventCardProps {
  event: Olaylar
  accentColor?: string | null
}

export function EventCard({ event, accentColor }: EventCardProps) {
  // Build the serialisable participant summaries (plain objects only)
  const participants: ParticipantSummary[] = (event.participants ?? [])
    .map(resolveKisiler)
    .filter((p): p is Kisiler => p !== null)
    .map((p) => {
      const portrait = resolveMedia(p.portrait)
      return {
        id:          p.id,
        full_name:   p.full_name,
        slug:        p.slug        ?? null,
        title:       p.title       ?? null,
        excerpt:     p.excerpt     ?? null,
        portraitUrl: portrait?.url ?? null,
        portraitAlt: portrait?.alt ?? null,
      }
    })

  return (
    <EventCardShell
      title={event.title}
      slug={event.slug ?? null}
      formattedDate={formatTurkishDate(event.exact_date)}
      tags={event.tags ?? null}
      accentColor={accentColor}
      participants={participants}
    >
      {event.content ? (
        <RichTextRenderer
          content={event.content as Record<string, unknown>}
          className="prose-sm"
        />
      ) : null}
    </EventCardShell>
  )
}
