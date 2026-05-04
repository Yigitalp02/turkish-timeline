/**
 * /donemler — Eras Index Page
 *
 * Lists all published historical eras as a grid of EraCards.
 * Reuses the same EraCard component and data function as the Hub page.
 *
 * force-dynamic: no DB available during Docker build — fetch at runtime.
 */

export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Layers }        from 'lucide-react'
import { getAllPublishedEras } from '@/lib/data/eras'
import { EraCard }            from '@/components/era/EraCard'
import { EraCardSkeleton }    from '@/components/era/EraCardSkeleton'

export const metadata: Metadata = {
  title:       'Dönemler',
  description: 'Yazıt ansiklopedisindeki tüm tarihsel dönemler.',
}

export default async function ErasIndexPage() {
  const eras = await getAllPublishedEras()

  return (
    <main className="min-h-screen bg-bg dark:bg-bg-dark">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="border-b border-border dark:border-border-dark bg-surface-muted dark:bg-surface-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-center gap-3 mb-3">
            <Layers size={28} strokeWidth={1.5} className="text-gold" aria-hidden />
            <h1 className="font-display text-4xl font-bold text-ink dark:text-cream">
              Dönemler
            </h1>
          </div>
          <p className="max-w-2xl text-base text-fg-muted dark:text-fg-muted-dark">
            Yakın Türk tarihinin kronolojik dönemleri — her dönem kendi zaman
            tüneli ve ansiklopedisiyle.
          </p>
          {eras.length > 0 && (
            <p className="mt-3 text-sm text-fg-muted/70 dark:text-fg-muted-dark/70">
              {eras.length} dönem
            </p>
          )}
        </div>
      </div>

      {/* ── Era grid ──────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {eras.length === 0 ? (
          <p className="py-20 text-center text-fg-muted dark:text-fg-muted-dark">
            Henüz yayınlanmış bir dönem bulunmamaktadır.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {eras.map((era, i) => (
              <EraCard key={era.id} era={era} index={i} />
            ))}
          </div>
        )}
      </div>

    </main>
  )
}
