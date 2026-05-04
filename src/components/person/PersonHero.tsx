'use client'

/**
 * PersonHero — Client Component.
 *
 * Renders the full-width profile hero (portrait + key metadata).
 * Uses an IntersectionObserver on the person's name to detect when the
 * hero has scrolled out of view, then animates in a compact sticky mini-header
 * beneath the main Navbar so the reader always knows who they're reading about.
 */

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/cn'

// ─────────────────────────────────────────────────────────────────────────────
// Role metadata (shared within this file)
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_META: Record<string, { label: string; classes: string }> = {
  politikaci:       { label: 'Politikacı',      classes: 'bg-sky-100    text-sky-800    dark:bg-sky-900/30    dark:text-sky-300' },
  'askeri-komutan': { label: 'Askeri Komutan',  classes: 'bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-300' },
  diplomat:         { label: 'Diplomat',         classes: 'bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-300' },
  entelektuel:      { label: 'Entelektüel',     classes: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  sanatci:          { label: 'Sanatçı',         classes: 'bg-pink-100   text-pink-800   dark:bg-pink-900/30   dark:text-pink-300' },
  diger:            { label: 'Diğer',            classes: 'bg-stone/10   text-stone      dark:text-stone-light' },
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface PersonHeroProps {
  full_name: string
  title?: string | null
  role?: string | null
  birth_year?: number | null
  death_year?: number | null
  excerpt?: string | null
  portraitUrl?: string | null
  portraitAlt?: string | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function PersonHero({
  full_name,
  title,
  role,
  birth_year,
  death_year,
  excerpt,
  portraitUrl,
  portraitAlt,
}: PersonHeroProps) {
  const [showMini, setShowMini] = useState(false)
  const nameRef = useRef<HTMLDivElement>(null)

  // Watch whether the hero name block is visible; show mini-header when it isn't
  useEffect(() => {
    const el = nameRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setShowMini(!entry.isIntersecting),
      // rootMargin top = -Navbar height (56 px) so the transition fires as soon
      // as the name disappears behind the navbar, not before.
      { threshold: 0, rootMargin: '-56px 0px 0px 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const roleMeta  = role ? (ROLE_META[role] ?? null) : null
  const lifeYears =
    birth_year || death_year
      ? `${birth_year ?? '?'} — ${death_year ? String(death_year) : 'günümüz'}`
      : null

  return (
    <>
      {/* ── Sticky mini-header ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showMini && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={cn(
              'fixed top-14 inset-x-0 z-20',
              'border-b border-border dark:border-border-dark',
              'bg-surface/90 dark:bg-surface-900/90 backdrop-blur-md',
            )}
          >
            <div className="mx-auto flex h-12 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
              {portraitUrl && (
                <Image
                  src={portraitUrl}
                  alt=""
                  width={28}
                  height={28}
                  className="rounded-full object-cover object-top ring-1 ring-border dark:ring-border-dark"
                  aria-hidden
                />
              )}
              <p className="font-display text-sm font-bold text-ink dark:text-cream">
                {full_name}
              </p>
              {roleMeta && (
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', roleMeta.classes)}>
                  {roleMeta.label}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main hero ────────────────────────────────────────────────────── */}
      <div className="border-b border-border dark:border-border-dark bg-surface-muted dark:bg-surface-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row items-start gap-8 sm:gap-12">

            {/* Portrait */}
            {portraitUrl && (
              <div className="shrink-0 self-start">
                <div className={cn(
                  'relative w-36 sm:w-44 overflow-hidden rounded-xl',
                  'border border-border dark:border-border-dark shadow-lg',
                  'aspect-[3/4]',
                )}>
                  <Image
                    src={portraitUrl}
                    alt={portraitAlt ?? full_name}
                    fill
                    priority
                    sizes="(max-width: 640px) 144px, 176px"
                    className="object-cover object-top"
                  />
                </div>
              </div>
            )}

            {/* Metadata block — observed for sticky header trigger */}
            <div className="flex-1 min-w-0" ref={nameRef}>

              {/* Role badge */}
              {roleMeta && (
                <span className={cn(
                  'inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold mb-3',
                  roleMeta.classes,
                )}>
                  {roleMeta.label}
                </span>
              )}

              {/* Full name */}
              <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight text-ink dark:text-cream">
                {full_name}
              </h1>

              {/* Official title */}
              {title && (
                <p className="mt-2 text-base sm:text-lg text-fg-muted dark:text-fg-muted-dark">
                  {title}
                </p>
              )}

              {/* Life years */}
              {lifeYears && (
                <p className="mt-1.5 font-mono text-sm text-fg-muted/60 dark:text-fg-muted-dark/60 tracking-wider">
                  {lifeYears}
                </p>
              )}

              {/* Excerpt — quoted lead-in */}
              {excerpt && (
                <p className="mt-5 max-w-2xl border-l-2 border-gold pl-4 text-base leading-relaxed text-fg dark:text-fg-dark">
                  {excerpt}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
