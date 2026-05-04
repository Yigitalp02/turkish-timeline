'use client'

/**
 * EraActors — right sticky sidebar.
 *
 * Displays the era's key historical figures with role-filter tabs.
 * Receives plain serialisable actor summaries from the Server Component page.
 */

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/cn'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ActorSummary {
  id: number
  full_name: string
  slug?: string | null
  title?: string | null
  role?: string | null
  portraitUrl?: string | null
  portraitAlt?: string | null
}

interface EraActorsProps {
  actors: ActorSummary[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Role metadata
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  politikaci:       'Politikacı',
  'askeri-komutan': 'Askeri',
  diplomat:         'Diplomat',
  entelektuel:      'Entelektüel',
  sanatci:          'Sanatçı',
  diger:            'Diğer',
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function EraActors({ actors }: EraActorsProps) {
  const [activeRole, setActiveRole] = useState<string>('all')

  if (!actors.length) return null

  // Build available role tabs from actors present in this era
  const presentRoles = [...new Set(actors.map((a) => a.role).filter(Boolean))] as string[]
  const tabs = ['all', ...presentRoles]

  const filtered =
    activeRole === 'all'
      ? actors
      : actors.filter((a) => a.role === activeRole)

  return (
    <aside className="flex flex-col gap-0 py-6 px-3">
      <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-fg-muted dark:text-fg-muted-dark">
        Dönemin Figürleri
      </p>

      {/* ── Role filter tabs ────────────────────────────────────────────── */}
      {tabs.length > 2 && (
        <div className="mb-3 flex flex-wrap gap-1 px-1">
          {tabs.map((role) => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={cn(
                'rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors',
                activeRole === role
                  ? 'bg-gold/15 text-gold-dark dark:text-gold'
                  : 'text-fg-muted dark:text-fg-muted-dark hover:bg-surface-muted dark:hover:bg-surface-800',
              )}
            >
              {role === 'all' ? 'Tümü' : (ROLE_LABELS[role] ?? role)}
            </button>
          ))}
        </div>
      )}

      {/* ── Actor list ──────────────────────────────────────────────────── */}
      <ul className="space-y-1">
        {filtered.map((actor) => {
          const href = actor.slug ? `/kisiler/${actor.slug}` : null
          const roleName = actor.role ? (ROLE_LABELS[actor.role] ?? actor.role) : null

          const inner = (
            <span className="flex items-center gap-2.5 w-full rounded-lg px-2 py-2
                             hover:bg-surface-muted dark:hover:bg-surface-800 transition-colors group">
              {/* Portrait or initial bubble */}
              {actor.portraitUrl ? (
                <Image
                  src={actor.portraitUrl}
                  alt={actor.portraitAlt ?? actor.full_name}
                  width={36}
                  height={36}
                  className="rounded-full object-cover shrink-0
                             ring-1 ring-border dark:ring-border-dark"
                />
              ) : (
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center
                                 rounded-full bg-stone/15 dark:bg-stone/25
                                 text-sm font-bold text-stone dark:text-stone-light
                                 ring-1 ring-border dark:ring-border-dark">
                  {actor.full_name.charAt(0)}
                </span>
              )}

              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink dark:text-cream
                                 group-hover:text-gold-dark dark:group-hover:text-gold transition-colors">
                  {actor.full_name}
                </span>
                {(actor.title || roleName) && (
                  <span className="block truncate text-[11px] text-fg-muted dark:text-fg-muted-dark">
                    {actor.title ?? roleName}
                  </span>
                )}
              </span>
            </span>
          )

          return (
            <li key={actor.id}>
              {href ? (
                <Link href={href} className="no-underline block">
                  {inner}
                </Link>
              ) : (
                inner
              )}
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
