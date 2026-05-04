/**
 * /kisiler — Person Index Page
 *
 * Server Component. Fetches all published persons, serialises the minimum
 * fields needed for the card grid, then hands off to <PersonsGrid>
 * (Client Component) for client-side role filtering.
 *
 * force-dynamic: no DB available during Docker build — fetch at runtime.
 */

export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Users }         from 'lucide-react'
import { getAllPublishedPersons } from '@/lib/data/persons'
import type { Media, Kisiler }   from '@/payload-types'
import { PersonsGrid, type PersonSummary } from '@/components/person/PersonsGrid'

export const metadata: Metadata = {
  title:       'Kişiler',
  description: 'Yazıt ansiklopedisindeki tüm tarihsel figürler.',
}

function resolveMedia(raw: unknown): Media | null {
  if (raw && typeof raw === 'object' && 'url' in raw) return raw as Media
  return null
}

export default async function PersonsIndexPage() {
  const persons = await getAllPublishedPersons()

  // Serialise only what PersonsGrid needs — avoids sending Lexical JSON over
  // the server→client boundary.
  const summaries: PersonSummary[] = persons.map((p: Kisiler) => {
    const portrait = resolveMedia(p.portrait)
    return {
      id:          p.id,
      full_name:   p.full_name,
      slug:        p.slug        ?? null,
      title:       p.title       ?? null,
      role:        p.role        ?? null,
      birth_year:  p.birth_year  ?? null,
      death_year:  p.death_year  ?? null,
      excerpt:     p.excerpt     ?? null,
      portraitUrl: portrait?.url ?? null,
      portraitAlt: portrait?.alt ?? null,
    }
  })

  return (
    <main className="min-h-screen bg-bg dark:bg-bg-dark">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="border-b border-border dark:border-border-dark bg-surface-muted dark:bg-surface-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-center gap-3 mb-3">
            <Users size={28} strokeWidth={1.5} className="text-gold" aria-hidden />
            <h1 className="font-display text-4xl font-bold text-ink dark:text-cream">
              Kişiler
            </h1>
          </div>
          <p className="max-w-2xl text-base text-fg-muted dark:text-fg-muted-dark">
            Yakın Türk tarihini şekillendiren siyasetçiler, askerler, diplomatlar,
            düşünürler ve sanatçılar.
          </p>

          {/* Count badge */}
          {persons.length > 0 && (
            <p className="mt-3 text-sm text-fg-muted/70 dark:text-fg-muted-dark/70">
              {persons.length} kişi profili
            </p>
          )}
        </div>
      </div>

      {/* ── Grid + filters ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <PersonsGrid persons={summaries} />
      </div>

    </main>
  )
}
