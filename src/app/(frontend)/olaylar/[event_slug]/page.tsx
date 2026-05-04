/**
 * /olaylar/[event_slug] — Event Detail Page
 *
 * Server Component. Fetches the event by slug (depth 2 → era + participants
 * are fully populated), then renders a clean reading-focused layout:
 *
 *   Breadcrumb  →  Era title chip + year
 *   Tags row    →  Date badge
 *   H1 title
 *   Participants row
 *   ─────────────────
 *   RichTextRenderer (full article content)
 */

import type { Metadata } from 'next'
import Link              from 'next/link'
import Image             from 'next/image'
import { notFound }      from 'next/navigation'
import { Calendar, ChevronLeft, ArrowUpRight } from 'lucide-react'
import { getEventBySlug, getEventStaticParams } from '@/lib/data/events'
import { safeStaticParams } from '@/lib/safeStaticParams'
import type { Donemler, Kisiler, Media }        from '@/payload-types'
import { RichTextRenderer }                     from '@/components/RichTextRenderer'
import { PersonTooltip }                        from '@/components/PersonTooltip'
import { cn } from '@/lib/cn'

// ─────────────────────────────────────────────────────────────────────────────
// Static generation
// ─────────────────────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return safeStaticParams(getEventStaticParams)
}

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ event_slug: string }>
}): Promise<Metadata> {
  const { event_slug } = await params
  const event = await getEventBySlug(event_slug)
  if (!event) return {}
  return {
    title:       event.title,
    description: `${event.title} — Yakın Türk tarihinden bir olay.`,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function resolveEra(raw: unknown): Donemler | null {
  if (raw && typeof raw === 'object' && 'title' in raw) return raw as Donemler
  return null
}

function resolveKisiler(raw: unknown): Kisiler | null {
  if (raw && typeof raw === 'object' && 'full_name' in raw) return raw as Kisiler
  return null
}

function resolveMedia(raw: unknown): Media | null {
  if (raw && typeof raw === 'object' && 'url' in raw) return raw as Media
  return null
}

function formatTurkishDate(isoDate: string): string {
  try {
    const normalised = isoDate.includes('T') ? isoDate : `${isoDate}T00:00:00Z`
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
    }).format(new Date(normalised))
  } catch {
    return isoDate
  }
}

const TAG_META: Record<string, { label: string; classes: string }> = {
  askeri:     { label: 'Askeri',     classes: 'bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-300' },
  diplomatik: { label: 'Diplomatik', classes: 'bg-sky-100    text-sky-800    dark:bg-sky-900/30    dark:text-sky-300' },
  kulturel:   { label: 'Kültürel',  classes: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  ekonomik:   { label: 'Ekonomik',  classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
  siyasi:     { label: 'Siyasi',    classes: 'bg-amber-100  text-amber-800  dark:bg-amber-900/30  dark:text-amber-300' },
  toplumsal:  { label: 'Toplumsal', classes: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default async function EventPage({
  params,
}: {
  params: Promise<{ event_slug: string }>
}) {
  const { event_slug } = await params
  const event = await getEventBySlug(event_slug)
  if (!event) notFound()

  const era          = resolveEra(event.era)
  const participants = (event.participants ?? [])
    .map(resolveKisiler)
    .filter((p): p is Kisiler => p !== null)

  const activeTags   = (event.tags ?? []).filter((t) => t in TAG_META)
  const formattedDate = formatTurkishDate(event.exact_date)

  // Back link goes to the era timeline, anchored to this event's year section
  const yearHash  = event.display_year ? `#year-${event.display_year}` : ''
  const eraHref   = era?.slug ? `/donemler/${era.slug}${yearHash}` : '/donemler'

  return (
    <main className="min-h-screen bg-bg dark:bg-bg-dark">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <nav className="mb-8 flex items-center gap-2 text-sm" aria-label="Gezinme yolu">
          <Link
            href={eraHref}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5
                       bg-surface-muted dark:bg-surface-800
                       text-fg-muted dark:text-fg-muted-dark
                       hover:text-ink dark:hover:text-cream
                       hover:bg-surface-card dark:hover:bg-surface-700
                       transition-colors no-underline text-xs font-medium"
          >
            <ChevronLeft size={13} />
            {era ? era.title : 'Dönemler'}
          </Link>

          {era && (
            <>
              <span className="text-border dark:text-border-dark" aria-hidden>/</span>
              <span className="text-xs text-fg-muted dark:text-fg-muted-dark truncate max-w-[200px]">
                {event.title}
              </span>
            </>
          )}
        </nav>

        {/* ── Era chip + date row ─────────────────────────────────────────── */}
        <div className="mb-4 flex flex-wrap items-center gap-3">

          {/* Era chip */}
          {era && (
            <Link
              href={`/donemler/${era.slug}`}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1',
                'text-xs font-semibold text-white no-underline',
                'hover:opacity-90 transition-opacity',
              )}
              style={{ backgroundColor: era.accent_color ?? '#6b5744' }}
            >
              {era.title}
              <ArrowUpRight size={11} strokeWidth={2.5} />
            </Link>
          )}

          {/* Date */}
          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-fg-muted dark:text-fg-muted-dark">
            <Calendar size={12} aria-hidden />
            {formattedDate}
          </span>
        </div>

        {/* ── Tags ────────────────────────────────────────────────────────── */}
        {activeTags.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {activeTags.map((tag) => {
              const meta = TAG_META[tag]!
              return (
                <span
                  key={tag}
                  className={cn('rounded-full px-3 py-0.5 text-xs font-semibold', meta.classes)}
                >
                  {meta.label}
                </span>
              )
            })}
          </div>
        )}

        {/* ── Event title ─────────────────────────────────────────────────── */}
        <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight text-ink dark:text-cream mb-6">
          {event.title}
        </h1>

        {/* ── Participants ─────────────────────────────────────────────────── */}
        {participants.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-fg-muted dark:text-fg-muted-dark uppercase tracking-wider">
              Katılanlar
            </span>
            {participants.map((p) => {
              const portrait = resolveMedia(p.portrait)
              return (
                <span key={p.id} className="inline-flex items-center gap-2">
                  {portrait?.url ? (
                    <Image
                      src={portrait.url}
                      alt={portrait.alt ?? p.full_name}
                      width={28}
                      height={28}
                      className="rounded-full object-cover object-top
                                 ring-1 ring-border dark:ring-border-dark"
                    />
                  ) : (
                    <span className="inline-flex h-7 w-7 items-center justify-center
                                     rounded-full bg-stone/20 dark:bg-stone/30
                                     text-xs font-bold text-stone dark:text-stone-light
                                     ring-1 ring-border dark:ring-border-dark">
                      {p.full_name.charAt(0)}
                    </span>
                  )}
                  <PersonTooltip
                    personId={p.id}
                    personName={p.full_name}
                    prefetchedData={{
                      id:        p.id,
                      full_name: p.full_name,
                      slug:      p.slug     ?? null,
                      title:     p.title    ?? null,
                      excerpt:   p.excerpt  ?? null,
                      portrait:  portrait?.url
                        ? { url: portrait.url, alt: portrait.alt ?? null }
                        : null,
                    }}
                  />
                </span>
              )
            })}
          </div>
        )}

        {/* ── Divider ─────────────────────────────────────────────────────── */}
        <hr className="border-border dark:border-border-dark mb-8" />

        {/* ── Content ─────────────────────────────────────────────────────── */}
        {event.content ? (
          <RichTextRenderer content={event.content as Record<string, unknown>} />
        ) : (
          <p className="text-fg-muted dark:text-fg-muted-dark italic">
            Bu olaya ait içerik henüz eklenmemiştir.
          </p>
        )}

        {/* ── Bottom navigation ────────────────────────────────────────────── */}
        <div className="mt-12 pt-8 border-t border-border dark:border-border-dark">
          <Link
            href={eraHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-gold
                       hover:text-gold-dark dark:hover:text-gold-light transition-colors no-underline"
          >
            <ChevronLeft size={16} />
            {era ? `${era.title} zaman tüneline dön` : 'Dönemlere dön'}
          </Link>
        </div>

      </div>
    </main>
  )
}
