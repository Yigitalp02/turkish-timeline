/**
 * /kisiler/[person_slug] — Person Profile Page
 *
 * Server Component. Fetches the person by slug, then their events.
 * Renders the PersonHero, biography via RichTextRenderer, and the
 * chronological "Katıldığı Olaylar" timeline.
 */

import type { Metadata }  from 'next'
import { notFound }       from 'next/navigation'
import { BookOpen, Clock } from 'lucide-react'
import { getPersonBySlug, getEventsByPerson, getPersonStaticParams } from '@/lib/data/persons'
import { safeStaticParams } from '@/lib/safeStaticParams'
import type { Media } from '@/payload-types'
import { PersonHero }       from '@/components/person/PersonHero'
import { PersonEventsList } from '@/components/person/PersonEventsList'
import { RichTextRenderer } from '@/components/RichTextRenderer'

// ─────────────────────────────────────────────────────────────────────────────
// Static generation
// ─────────────────────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return safeStaticParams(getPersonStaticParams)
}

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ person_slug: string }>
}): Promise<Metadata> {
  const { person_slug } = await params
  const person = await getPersonBySlug(person_slug)
  if (!person) return {}

  return {
    title:       person.full_name,
    description: person.excerpt ?? undefined,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function resolveMedia(raw: unknown): Media | null {
  if (raw && typeof raw === 'object' && 'url' in raw) return raw as Media
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default async function PersonPage({
  params,
}: {
  params: Promise<{ person_slug: string }>
}) {
  const { person_slug } = await params

  // Fetch person first (need ID for events query)
  const person = await getPersonBySlug(person_slug)
  if (!person) notFound()

  // Fetch events in which this person participated
  const events = await getEventsByPerson(person.id)

  const portrait = resolveMedia(person.portrait)

  return (
    <main className="min-h-screen bg-bg dark:bg-bg-dark">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <PersonHero
        full_name={person.full_name}
        title={person.title}
        role={person.role}
        birth_year={person.birth_year}
        death_year={person.death_year}
        excerpt={person.excerpt}
        portraitUrl={portrait?.url ?? null}
        portraitAlt={portrait?.alt ?? null}
      />

      {/* ── Content area ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* ── Biography ─────────────────────────────────────────────────── */}
        {person.biography && (
          <section aria-labelledby="biography-heading">
            <h2
              id="biography-heading"
              className="mb-6 flex items-center gap-2 font-display text-2xl font-bold text-ink dark:text-cream"
            >
              <BookOpen size={22} strokeWidth={1.75} className="text-gold" aria-hidden />
              Biyografi
            </h2>

            <RichTextRenderer
              content={person.biography as Record<string, unknown>}
            />
          </section>
        )}

        {/* ── Participated events ───────────────────────────────────────── */}
        <section aria-labelledby="events-heading">
          <h2
            id="events-heading"
            className="mb-6 flex items-center gap-2 font-display text-2xl font-bold text-ink dark:text-cream"
          >
            <Clock size={22} strokeWidth={1.75} className="text-gold" aria-hidden />
            Katıldığı Olaylar
            {events.length > 0 && (
              <span className="ml-1 rounded-full bg-surface-muted dark:bg-surface-800
                               px-2.5 py-0.5 text-sm font-normal text-fg-muted dark:text-fg-muted-dark">
                {events.length}
              </span>
            )}
          </h2>

          <PersonEventsList events={events} />
        </section>

      </div>
    </main>
  )
}
