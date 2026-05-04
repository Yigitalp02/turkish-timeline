'use client'

/**
 * EventCardShell — Client Component.
 *
 * Handles all interactive behaviour of an event card:
 *   • Expand / collapse for long rich-text content.
 *   • Participant avatar row (wraps PersonTooltip for hover cards).
 *
 * The rich-text content (RichTextRenderer output — a Server Component) is
 * passed as `children` from the parent Server Component EventCard. This is
 * the recommended Next.js pattern for mixing server-rendered content with
 * client-side interactivity without prop-serialisation issues.
 */

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import { PersonTooltip } from '@/components/PersonTooltip'
import { cn } from '@/lib/cn'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ParticipantSummary {
  id: number
  full_name: string
  slug?: string | null
  title?: string | null
  excerpt?: string | null
  portraitUrl?: string | null
  portraitAlt?: string | null
}

export interface EventCardShellProps {
  title: string
  slug?: string | null
  formattedDate: string
  tags?: string[] | null
  accentColor?: string | null
  participants: ParticipantSummary[]
  /** RichTextRenderer output, passed from the Server Component parent. */
  children: React.ReactNode
}

// ─────────────────────────────────────────────────────────────────────────────
// Tag metadata
// ─────────────────────────────────────────────────────────────────────────────

const TAG_META: Record<string, { label: string; classes: string }> = {
  askeri:     { label: 'Askeri',      classes: 'bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-300' },
  diplomatik: { label: 'Diplomatik',  classes: 'bg-sky-100    text-sky-800    dark:bg-sky-900/30    dark:text-sky-300' },
  kulturel:   { label: 'Kültürel',   classes: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  ekonomik:   { label: 'Ekonomik',   classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
  siyasi:     { label: 'Siyasi',     classes: 'bg-amber-100  text-amber-800  dark:bg-amber-900/30  dark:text-amber-300' },
  toplumsal:  { label: 'Toplumsal',  classes: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
}

// Content is collapsed when taller than this threshold (px)
const COLLAPSE_THRESHOLD = 300

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function EventCardShell({
  title,
  slug,
  formattedDate,
  tags,
  accentColor,
  participants,
  children,
}: EventCardShellProps) {
  const [expanded,   setExpanded]   = useState(false)
  const [needsClamp, setNeedsClamp] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // Detect whether the content is tall enough to warrant collapsing
  useEffect(() => {
    const el = contentRef.current
    if (el) setNeedsClamp(el.scrollHeight > COLLAPSE_THRESHOLD)
  }, [])

  const activeTags = (tags ?? []).filter((t) => t in TAG_META)
  const eventHref  = slug ? `/olaylar/${slug}` : null

  return (
    <article
      className={cn(
        'relative my-5 rounded-xl overflow-hidden',
        'border border-border dark:border-border-dark',
        'bg-surface-card dark:bg-surface-800',
        'shadow-sm hover:shadow-md transition-shadow duration-200',
      )}
    >
      {/* ── Accent left border ────────────────────────────────────────────── */}
      <div
        className="absolute inset-y-0 left-0 w-1 rounded-l-xl"
        style={{ backgroundColor: accentColor ?? 'var(--color-gold)' }}
      />

      <div className="pl-5 pr-5 pt-5 pb-4">

        {/* ── Header row: date + tags ────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-fg-muted dark:text-fg-muted-dark">
            <Calendar size={11} strokeWidth={2} />
            {formattedDate}
          </span>

          {activeTags.map((tag) => {
            const meta = TAG_META[tag]!
            return (
              <span
                key={tag}
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                  meta.classes,
                )}
              >
                {meta.label}
              </span>
            )
          })}
        </div>

        {/* ── Title ─────────────────────────────────────────────────────── */}
        {eventHref ? (
          <Link
            href={eventHref}
            className="group block font-display text-xl font-bold text-ink dark:text-cream
                       hover:text-gold-dark dark:hover:text-gold transition-colors no-underline"
          >
            {title}
          </Link>
        ) : (
          <h3 className="font-display text-xl font-bold text-ink dark:text-cream">
            {title}
          </h3>
        )}

        {/* ── Participants row ───────────────────────────────────────────── */}
        {participants.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {participants.map((p) => (
              <span key={p.id} className="inline-flex items-center gap-1.5">
                {/* Portrait or initials avatar */}
                {p.portraitUrl ? (
                  <Image
                    src={p.portraitUrl}
                    alt={p.portraitAlt ?? p.full_name}
                    width={22}
                    height={22}
                    className="rounded-full object-cover ring-1 ring-border dark:ring-border-dark"
                  />
                ) : (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full
                                   bg-stone/20 dark:bg-stone/30 text-[10px] font-bold text-stone
                                   dark:text-stone-light ring-1 ring-border dark:ring-border-dark">
                    {p.full_name.charAt(0)}
                  </span>
                )}

                {/* PersonTooltip inline mention */}
                <PersonTooltip
                  personId={p.id}
                  personName={p.full_name}
                  prefetchedData={{
                    id:        p.id,
                    full_name: p.full_name,
                    slug:      p.slug      ?? null,
                    title:     p.title     ?? null,
                    excerpt:   p.excerpt   ?? null,
                    portrait:  p.portraitUrl
                      ? { url: p.portraitUrl, alt: p.portraitAlt ?? null }
                      : null,
                  }}
                />
              </span>
            ))}
          </div>
        )}

        {/* ── Rich-text content (server-rendered, passed as children) ──── */}
        <div className="relative mt-4">
          <div
            ref={contentRef}
            style={!expanded && needsClamp ? { maxHeight: COLLAPSE_THRESHOLD } : undefined}
            className="overflow-hidden"
          >
            {children}
          </div>

          {/* Gradient fade when collapsed */}
          {needsClamp && !expanded && (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t
                         from-[#fff] dark:from-[#1e1e1e] to-transparent"
            />
          )}
        </div>

        {/* ── Expand / collapse button ───────────────────────────────────── */}
        {needsClamp && (
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className={cn(
              'mt-3 inline-flex items-center gap-1.5',
              'text-xs font-semibold text-gold hover:text-gold-dark dark:hover:text-gold-light',
              'transition-colors',
            )}
          >
            {expanded ? (
              <>
                <ChevronUp size={13} />
                Daha az göster
              </>
            ) : (
              <>
                <ChevronDown size={13} />
                Devamını oku
              </>
            )}
          </button>
        )}
      </div>
    </article>
  )
}
