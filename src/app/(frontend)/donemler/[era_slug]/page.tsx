/**
 * /donemler/[era_slug] — Era Timeline Page
 *
 * Server Component. Fetches the era and all its published events, groups them
 * by year, then renders the three-column timeline layout:
 *   Left  : <YearRadar>  — IntersectionObserver-driven year navigation
 *   Center: year sections with <EventCard>s
 *   Right : <EraActors>  — key-figure sidebar with role filter
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getEraWithEvents, getEraStaticParams } from '@/lib/data/eras'
import { safeStaticParams } from '@/lib/safeStaticParams'
import { groupEventsByYear } from '@/lib/groupEventsByYear'
import type { Kisiler, Media } from '@/payload-types'
import { EraHero }    from '@/components/timeline/EraHero'
import { YearRadar }  from '@/components/timeline/YearRadar'
import { EventCard }  from '@/components/timeline/EventCard'
import { EraActors, type ActorSummary } from '@/components/timeline/EraActors'

// ─────────────────────────────────────────────────────────────────────────────
// Static generation
// ─────────────────────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return safeStaticParams(getEraStaticParams)
}

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ era_slug: string }>
}): Promise<Metadata> {
  const { era_slug } = await params
  const data = await getEraWithEvents(era_slug)
  if (!data) return {}

  const { era } = data
  return {
    title:       `${era.title} | Yazıt`,
    description: era.short_description ?? undefined,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function resolveMedia(raw: unknown): Media | null {
  if (raw && typeof raw === 'object' && 'url' in raw) return raw as Media
  return null
}

function resolveKisiler(raw: unknown): Kisiler | null {
  if (raw && typeof raw === 'object' && 'full_name' in raw) return raw as Kisiler
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default async function EraPage({
  params,
}: {
  params: Promise<{ era_slug: string }>
}) {
  const { era_slug } = await params
  const data = await getEraWithEvents(era_slug)
  if (!data) notFound()

  const { era, events } = data

  // Group events by year (sorted ascending)
  const yearGroups = groupEventsByYear(events)
  const years      = [...yearGroups.keys()]

  // Resolve cover image
  const coverImage = resolveMedia(era.cover_image)

  // Build serialisable actor summaries for the Client Component sidebar
  const actors: ActorSummary[] = (era.key_figures ?? [])
    .map(resolveKisiler)
    .filter((p): p is Kisiler => p !== null)
    .map((p) => {
      const portrait = resolveMedia(p.portrait)
      return {
        id:          p.id,
        full_name:   p.full_name,
        slug:        p.slug        ?? null,
        title:       p.title       ?? null,
        role:        p.role        ?? null,
        portraitUrl: portrait?.url ?? null,
        portraitAlt: portrait?.alt ?? null,
      }
    })

  return (
    <main className="min-h-screen bg-bg dark:bg-bg-dark">

      {/* ── Hero header ─────────────────────────────────────────────────── */}
      <EraHero
        title={era.title}
        startYear={era.start_year}
        endYear={era.end_year}
        shortDescription={era.short_description}
        coverImageUrl={coverImage?.url ?? null}
        coverImageAlt={coverImage?.alt ?? null}
        accentColor={era.accent_color}
      />

      {/* ── Three-column layout ──────────────────────────────────────────── */}
      <div className="mx-auto max-w-screen-xl lg:grid lg:grid-cols-[220px_1fr_220px] lg:items-start">

        {/* ── Left sidebar — Year Radar ─────────────────────────────────── */}
        <aside className="hidden lg:block sticky top-16 self-start max-h-[calc(100vh-64px)] overflow-y-auto
                          border-r border-border dark:border-border-dark">
          <YearRadar years={years} accentColor={era.accent_color} />
        </aside>

        {/* ── Center column — Event feed ────────────────────────────────── */}
        <div className="min-w-0 px-4 sm:px-6 py-8">

          {events.length === 0 ? (
            <div className="py-20 text-center text-fg-muted dark:text-fg-muted-dark">
              <p className="text-lg font-medium">Bu döneme ait henüz olay eklenmedi.</p>
              <p className="mt-1 text-sm">CMS&apos;den olay ekleyerek başlayabilirsiniz.</p>
            </div>
          ) : (
            years.map((year) => (
              <section
                key={year}
                id={`year-${year}`}
                data-year={year}
                className="mb-12 scroll-mt-20"
              >
                {/* ── Sticky year divider ────────────────────────────────── */}
                <div className="sticky top-16 z-10 -mx-4 sm:-mx-6 mb-4 px-4 sm:px-6 py-2
                                bg-bg/90 dark:bg-bg-dark/90 backdrop-blur-sm
                                border-b border-border dark:border-border-dark">
                  <span
                    className="font-display text-2xl font-bold"
                    style={{ color: era.accent_color ?? undefined }}
                  >
                    {year}
                  </span>
                </div>

                {/* ── Event cards for this year ──────────────────────────── */}
                {(yearGroups.get(year) ?? []).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    accentColor={era.accent_color}
                  />
                ))}
              </section>
            ))
          )}
        </div>

        {/* ── Right sidebar — Era Actors ────────────────────────────────── */}
        <aside className="hidden lg:block sticky top-16 self-start max-h-[calc(100vh-64px)] overflow-y-auto
                          border-l border-border dark:border-border-dark">
          <EraActors actors={actors} />
        </aside>
      </div>
    </main>
  )
}
