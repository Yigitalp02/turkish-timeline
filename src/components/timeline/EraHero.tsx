'use client'

/**
 * EraHero — full-width cover image with accent-colour gradient overlay.
 *
 * Receives plain serializable props from the Server Component page so it can
 * be a Client Component (needed for Framer Motion).
 */

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'

interface EraHeroProps {
  title: string
  startYear: number
  endYear: number
  shortDescription?: string | null
  coverImageUrl?: string | null
  coverImageAlt?: string | null
  /** CSS hex colour, e.g. "#8B1A1A". Falls back to a neutral warm tone. */
  accentColor?: string | null
}

export function EraHero({
  title,
  startYear,
  endYear,
  shortDescription,
  coverImageUrl,
  coverImageAlt,
  accentColor = '#6b5744',
}: EraHeroProps) {
  const accent = accentColor ?? '#6b5744'

  return (
    <div className="relative h-72 sm:h-[28rem] overflow-hidden bg-ink">
      {/* Cover image */}
      {coverImageUrl && (
        <Image
          src={coverImageUrl}
          alt={coverImageAlt ?? title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      )}

      {/* Accent-coloured gradient overlay — darkens the image and adds brand colour */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom,
            ${accent}33 0%,
            ${accent}99 60%,
            ${accent}ee 100%)`,
        }}
      />

      {/* Back breadcrumb */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full bg-black/20 backdrop-blur-sm
                     px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white
                     hover:bg-black/30 transition-colors no-underline"
        >
          <ChevronLeft size={13} />
          Ana Sayfa
        </Link>
      </div>

      {/* Text content — animated entrance */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-x-0 bottom-0 px-6 pb-8 sm:px-10 sm:pb-10 max-w-4xl"
      >
        {/* Year range badge */}
        <p className="mb-3 font-mono text-xs font-semibold tracking-[0.18em] text-white/60 uppercase">
          {startYear} — {endYear}
        </p>

        <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight text-white drop-shadow-sm">
          {title}
        </h1>

        {shortDescription && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="mt-3 max-w-2xl text-sm sm:text-base text-white/75 leading-relaxed"
          >
            {shortDescription}
          </motion.p>
        )}
      </motion.div>
    </div>
  )
}
