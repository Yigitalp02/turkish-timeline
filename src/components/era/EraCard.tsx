'use client'

/**
 * EraCard — a visually rich card linking to a historical era's timeline page.
 *
 * Interaction model:
 *  • The whole card is a link (keyboard + pointer accessible).
 *  • Framer Motion scales the card up on hover and lifts the shadow.
 *  • The short_description fades up from hidden on hover via CSS group-hover.
 *  • The cover_image (next/image fill) zooms gently on hover via CSS transform.
 *
 * Fallback: if no cover_image is uploaded, a gradient from accent_color is used.
 */

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/cn'
import type { Donemler, Media } from '@/payload-types'

interface EraCardProps {
  era: Donemler
  /** Index in the grid — used to stagger entrance animation */
  index?: number
}

// ── Animation variants ────────────────────────────────────────────────────────

const cardVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Resolve the populated Media object (depth >= 1) or return null. */
function resolveImage(raw: Donemler['cover_image']): Media | null {
  if (raw && typeof raw === 'object' && 'url' in raw) return raw as Media
  return null
}

/**
 * Build a gradient overlay string from the era's accent colour.
 * The bottom of the card fades fully to the accent colour; the top is transparent.
 */
function buildOverlay(hex = '#1A1208'): string {
  return `linear-gradient(
    to top,
    ${hex}F0 0%,
    ${hex}AA 30%,
    ${hex}44 60%,
    transparent 100%
  )`
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EraCard({ era, index = 0 }: EraCardProps) {
  const image    = resolveImage(era.cover_image)
  const accent   = era.accent_color ?? '#1A1208'
  const slug     = era.slug ?? '#'

  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ scale: 1.025, y: -4 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-shadow duration-300"
      style={{ aspectRatio: '4 / 3' }}
    >
      {/* ── Background ────────────────────────────────────────────────── */}
      {image?.url ? (
        <Image
          src={image.url}
          alt={image.alt || era.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          priority={index < 3}
        />
      ) : (
        /* Fallback: solid accent colour block with subtle noise-like pattern */
        <div
          className="absolute inset-0"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
      )}

      {/* ── Gradient overlay ──────────────────────────────────────────── */}
      <div
        className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-90"
        style={{ background: buildOverlay(accent) }}
        aria-hidden
      />

      {/* ── Entire card is a link ─────────────────────────────────────── */}
      <Link
        href={`/donemler/${slug}`}
        className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 rounded-xl"
        aria-label={`${era.title} dönemine git (${era.start_year}–${era.end_year})`}
      />

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-5 sm:p-6">

        {/* Year range badge */}
        <span className="inline-block rounded-full border border-white/30 bg-white/10 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm mb-3">
          {era.start_year} — {era.end_year}
        </span>

        {/* Era title */}
        <h2 className="font-display text-xl font-bold leading-tight text-white drop-shadow-sm sm:text-2xl">
          {era.title}
        </h2>

        {/* Short description — revealed on hover */}
        {era.short_description && (
          <p
            className={cn(
              'mt-2 text-sm leading-relaxed text-white/80',
              'max-h-0 overflow-hidden opacity-0',
              'transition-all duration-300 ease-out',
              'group-hover:max-h-20 group-hover:opacity-100',
            )}
          >
            {era.short_description}
          </p>
        )}

        {/* "Keşfet" CTA */}
        <div
          className={cn(
            'mt-3 flex items-center gap-1.5 text-xs font-semibold text-gold-light',
            'translate-y-2 opacity-0 transition-all duration-300',
            'group-hover:translate-y-0 group-hover:opacity-100',
          )}
          aria-hidden
        >
          Dönemleri İncele
          <ArrowRight size={13} strokeWidth={2.5} />
        </div>

      </div>
    </motion.article>
  )
}
