/**
 * PersonEventsList — Server Component.
 *
 * Renders a chronological timeline of events a person participated in.
 * Each item links back to the era timeline page, anchored to the year
 * section that contains the event (/donemler/[era_slug]#year-[year]).
 *
 * The era's accent_color is used for the timeline connector dot so the
 * visual language of the era page carries over to the person profile.
 */

import Link from 'next/link'
import { Calendar } from 'lucide-react'
import type { Olaylar, Donemler } from '@/payload-types'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatTurkishDate(isoDate: string): string {
  try {
    const normalised = isoDate.includes('T') ? isoDate : `${isoDate}T00:00:00Z`
    return new Intl.DateTimeFormat('tr-TR', {
      day:      'numeric',
      month:    'long',
      year:     'numeric',
      timeZone: 'UTC',
    }).format(new Date(normalised))
  } catch {
    return isoDate
  }
}

function resolveEra(raw: unknown): Donemler | null {
  if (raw && typeof raw === 'object' && 'title' in raw) return raw as Donemler
  return null
}

const TAG_LABELS: Record<string, string> = {
  askeri:     'Askeri',
  diplomatik: 'Diplomatik',
  kulturel:   'Kültürel',
  ekonomik:   'Ekonomik',
  siyasi:     'Siyasi',
  toplumsal:  'Toplumsal',
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface PersonEventsListProps {
  events: Olaylar[]
}

export function PersonEventsList({ events }: PersonEventsListProps) {
  if (!events.length) {
    return (
      <p className="text-sm text-fg-muted dark:text-fg-muted-dark italic">
        Bu kişiye ait kayıtlı bir olay bulunmamaktadır.
      </p>
    )
  }

  return (
    <ol className="space-y-0" aria-label="Katıldığı olaylar listesi">
      {events.map((event, idx) => {
        const era      = resolveEra(event.era)
        const isLast   = idx === events.length - 1
        const yearHash = event.display_year ? `#year-${event.display_year}` : ''
        const eraHref  = era?.slug ? `/donemler/${era.slug}${yearHash}` : null
        const tags     = (event.tags ?? []).filter((t) => t in TAG_LABELS)

        return (
          <li key={event.id} className="flex gap-5 items-stretch">

            {/* ── Timeline rail ────────────────────────────────────────── */}
            <div className="flex flex-col items-center shrink-0 w-4 pt-1.5">
              {/* Dot coloured with era accent */}
              <div
                className="w-3 h-3 rounded-full border-2 shrink-0"
                style={{
                  borderColor:     era?.accent_color ?? 'var(--color-gold)',
                  backgroundColor: era?.accent_color ? `${era.accent_color}33` : 'transparent',
                }}
              />
              {/* Connector line — hidden on last item */}
              {!isLast && (
                <div className="w-px flex-1 mt-1 bg-border dark:bg-border-dark" />
              )}
            </div>

            {/* ── Content ──────────────────────────────────────────────── */}
            <div className={`pb-6 min-w-0 flex-1 ${isLast ? '' : ''}`}>

              {/* Date + tags row */}
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-fg-muted dark:text-fg-muted-dark">
                  <Calendar size={10} aria-hidden />
                  {formatTurkishDate(event.exact_date)}
                </span>

                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full px-2 py-px text-[10px] font-semibold
                               bg-surface-muted dark:bg-surface-800
                               text-fg-muted dark:text-fg-muted-dark"
                  >
                    {TAG_LABELS[tag]}
                  </span>
                ))}
              </div>

              {/* Event title */}
              {eraHref ? (
                <Link
                  href={eraHref}
                  className="font-medium text-ink dark:text-cream hover:text-gold-dark dark:hover:text-gold
                             transition-colors no-underline leading-snug"
                >
                  {event.title}
                </Link>
              ) : (
                <span className="font-medium text-ink dark:text-cream leading-snug">
                  {event.title}
                </span>
              )}

              {/* Era chip */}
              {era && (
                <div className="mt-1.5 inline-flex items-center gap-1.5">
                  <span
                    className="inline-block w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: era.accent_color ?? '#8B7355' }}
                    aria-hidden
                  />
                  {era.slug ? (
                    <Link
                      href={`/donemler/${era.slug}`}
                      className="text-[11px] text-fg-muted dark:text-fg-muted-dark
                                 hover:text-gold-dark dark:hover:text-gold transition-colors no-underline"
                    >
                      {era.title}
                    </Link>
                  ) : (
                    <span className="text-[11px] text-fg-muted dark:text-fg-muted-dark">
                      {era.title}
                    </span>
                  )}
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
