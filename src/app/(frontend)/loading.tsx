/**
 * loading.tsx — automatic Suspense boundary for the Hub page.
 *
 * Next.js shows this component instantly (from the static shell) while the
 * Server Component data fetches (getAllPublishedEras + getPublishedCounts)
 * are in flight. It mirrors the real page layout precisely to avoid any
 * Cumulative Layout Shift when the real content arrives.
 */
import { EraCardSkeleton } from '@/components/era/EraCardSkeleton'

// Mirrors HeroSection ─────────────────────────────────────────────────────────
function HeroSkeleton() {
  return (
    <section className="border-b border-border dark:border-border-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 animate-pulse">
        {/* Eyebrow */}
        <div className="mb-5 h-3 w-28 rounded-full bg-stone/20 dark:bg-stone/10" />

        {/* Title — two lines */}
        <div className="space-y-3 max-w-xl">
          <div className="h-10 rounded-lg bg-stone/20 dark:bg-stone/10 w-full" />
          <div className="h-10 rounded-lg bg-stone/20 dark:bg-stone/10 w-3/4" />
        </div>

        {/* Tagline */}
        <div className="mt-6 space-y-2 max-w-md">
          <div className="h-4 rounded bg-stone/15 dark:bg-stone/10 w-full" />
          <div className="h-4 rounded bg-stone/15 dark:bg-stone/10 w-5/6" />
        </div>

        {/* CTA buttons */}
        <div className="mt-8 flex gap-3">
          <div className="h-10 w-36 rounded-md bg-stone/20 dark:bg-stone/10" />
          <div className="h-10 w-28 rounded-md bg-stone/15 dark:bg-stone/10" />
        </div>

        {/* Stats bar */}
        <div className="mt-12 flex gap-8 sm:gap-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-stone/20 dark:bg-stone/10" />
              <div className="space-y-1.5">
                <div className="h-6 w-12 rounded bg-stone/20 dark:bg-stone/10" />
                <div className="h-3 w-20 rounded bg-stone/15 dark:bg-stone/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Mirrors EraGridSection ──────────────────────────────────────────────────────
function EraGridSkeleton() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      {/* Section header */}
      <div className="mb-10 animate-pulse">
        <div className="h-8 w-52 rounded-lg bg-stone/20 dark:bg-stone/10" />
        <div className="mt-2 h-4 w-80 rounded bg-stone/15 dark:bg-stone/10" />
      </div>

      {/* Card grid — show 6 skeleton cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <EraCardSkeleton key={i} />
        ))}
      </div>
    </section>
  )
}

// ── Root export ───────────────────────────────────────────────────────────────

export default function HubLoading() {
  return (
    <div className="flex flex-col">
      <HeroSkeleton />
      <EraGridSkeleton />
    </div>
  )
}
