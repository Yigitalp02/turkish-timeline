'use client'

/**
 * PersonsGrid — Client Component.
 *
 * Receives a pre-serialised list of person summaries from the Server Component
 * index page and provides client-side role-filter tabs + a responsive card grid.
 *
 * All data is passed as plain props — no client fetching.
 */

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/cn'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PersonSummary {
  id: number
  full_name: string
  slug?: string | null
  title?: string | null
  role?: string | null
  birth_year?: number | null
  death_year?: number | null
  excerpt?: string | null
  portraitUrl?: string | null
  portraitAlt?: string | null
}

interface PersonsGridProps {
  persons: PersonSummary[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Role metadata
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_META: Record<string, { label: string; badge: string }> = {
  politikaci:       { label: 'Politikacı',      badge: 'bg-sky-100    text-sky-800    dark:bg-sky-900/30    dark:text-sky-300' },
  'askeri-komutan': { label: 'Askeri Komutan',  badge: 'bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-300' },
  diplomat:         { label: 'Diplomat',         badge: 'bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-300' },
  entelektuel:      { label: 'Entelektüel',     badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  sanatci:          { label: 'Sanatçı',         badge: 'bg-pink-100   text-pink-800   dark:bg-pink-900/30   dark:text-pink-300' },
  diger:            { label: 'Diğer',            badge: 'bg-stone/10   text-stone      dark:text-stone-light' },
}

// ─────────────────────────────────────────────────────────────────────────────
// Person card
// ─────────────────────────────────────────────────────────────────────────────

function PersonCard({ person }: { person: PersonSummary }) {
  const href     = person.slug ? `/kisiler/${person.slug}` : null
  const roleMeta = person.role ? (ROLE_META[person.role] ?? null) : null
  const years    =
    person.birth_year || person.death_year
      ? `${person.birth_year ?? '?'} — ${person.death_year ? String(person.death_year) : ''}`
      : null

  const card = (
    <div className={cn(
      'group flex flex-col overflow-hidden rounded-xl h-full',
      'border border-border dark:border-border-dark',
      'bg-surface-card dark:bg-surface-800',
      'hover:shadow-xl hover:border-gold/30 dark:hover:border-gold/20',
      'transition-all duration-300',
      href && 'cursor-pointer',
    )}>
      {/* ── Portrait ───────────────────────────────────────────────────── */}
      <div className="relative aspect-[3/4] bg-surface-muted dark:bg-surface-950 overflow-hidden">
        {person.portraitUrl ? (
          <Image
            src={person.portraitUrl}
            alt={person.portraitAlt ?? person.full_name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          // Initials placeholder
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-6xl font-bold text-stone/20 dark:text-stone/30 select-none">
              {person.full_name.charAt(0)}
            </span>
          </div>
        )}

        {/* Bottom gradient for readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t
                        from-surface-card/80 dark:from-surface-800/80 to-transparent pointer-events-none" />

        {/* Role badge overlay */}
        {roleMeta && (
          <div className="absolute top-2 left-2">
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm', roleMeta.badge)}>
              {roleMeta.label}
            </span>
          </div>
        )}
      </div>

      {/* ── Info ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-0.5 p-3 flex-1">
        <p className="font-display text-sm font-bold leading-tight text-ink dark:text-cream
                      group-hover:text-gold-dark dark:group-hover:text-gold transition-colors">
          {person.full_name}
        </p>

        {person.title && (
          <p className="text-[11px] text-fg-muted dark:text-fg-muted-dark leading-tight line-clamp-2">
            {person.title}
          </p>
        )}

        {years && (
          <p className="mt-auto pt-1 font-mono text-[10px] text-fg-muted/60 dark:text-fg-muted-dark/60">
            {years}
          </p>
        )}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="no-underline block h-full" aria-label={`${person.full_name} profilini görüntüle`}>
        {card}
      </Link>
    )
  }
  return card
}

// ─────────────────────────────────────────────────────────────────────────────
// Main grid component
// ─────────────────────────────────────────────────────────────────────────────

export function PersonsGrid({ persons }: PersonsGridProps) {
  const [activeRole, setActiveRole] = useState<string>('all')

  if (!persons.length) {
    return (
      <p className="py-20 text-center text-fg-muted dark:text-fg-muted-dark">
        Henüz yayınlanmış kişi profili bulunmamaktadır.
      </p>
    )
  }

  // Build filter tabs from roles that actually exist in this dataset
  const presentRoles = [...new Set(persons.map((p) => p.role).filter(Boolean))] as string[]
  const tabs = ['all', ...presentRoles]

  const filtered =
    activeRole === 'all'
      ? persons
      : persons.filter((p) => p.role === activeRole)

  return (
    <div>
      {/* ── Role filter tabs ─────────────────────────────────────────────── */}
      {tabs.length > 2 && (
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Role göre filtrele">
          {tabs.map((role) => {
            const isActive = role === activeRole
            const meta     = role !== 'all' ? (ROLE_META[role] ?? null) : null
            return (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                aria-pressed={isActive}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-gold text-surface-900 shadow-sm'
                    : 'bg-surface-muted dark:bg-surface-800 text-fg-muted dark:text-fg-muted-dark hover:text-ink dark:hover:text-cream',
                )}
              >
                {role === 'all' ? `Tümü (${persons.length})` : (meta?.label ?? role)}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Cards grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </div>

      {/* Empty state after filtering */}
      {filtered.length === 0 && (
        <p className="py-16 text-center text-fg-muted dark:text-fg-muted-dark text-sm">
          Bu kategoride kişi bulunamadı.
        </p>
      )}
    </div>
  )
}
