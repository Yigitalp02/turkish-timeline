/**
 * Hub Page — site root, /
 *
 * Server Component. Fetches all published eras + aggregate counts in parallel,
 * renders the Hero section and the Era card grid.
 *
 * force-dynamic: prevents Next.js from trying to statically render this page
 * at Docker build time (when no DB is available).  The data layer still uses
 * unstable_cache so individual DB queries are cached at runtime.
 */

// eslint-disable-next-line import/no-unused-modules
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, CalendarDays, Users } from 'lucide-react'
import { getAllPublishedEras } from '@/lib/data/eras'
import { getPublishedCounts } from '@/lib/data/stats'
import { EraCard } from '@/components/era/EraCard'

// ── SEO ───────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Yazıt — Türk Tarihi Zaman Tüneli',
  description:
    'Tanzimat\'tan günümüze Türk tarihini dönemlere ayrılmış interaktif bir zaman tünelinde keşfedin.',
  openGraph: {
    title: 'Yazıt — Türk Tarihi Zaman Tüneli',
    description:
      'Tanzimat\'tan günümüze Türk tarihini dönemlere ayrılmış interaktif bir zaman tünelinde keşfedin.',
  },
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HubPage() {
  // Parallel data fetching — both are cached under their respective tags
  const [eras, counts] = await Promise.all([
    getAllPublishedEras(),
    getPublishedCounts(),
  ])

  return (
    <div className="flex flex-col">
      <HeroSection counts={counts} eraCount={eras.length} />
      <EraGridSection eras={eras} />
    </div>
  )
}

// ── Hero Section ──────────────────────────────────────────────────────────────

interface HeroProps {
  counts: { eras: number; events: number; persons: number }
  eraCount: number
}

function HeroSection({ counts }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border dark:border-border-dark">
      {/* Decorative diagonal grid pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04] dark:opacity-[0.07]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, var(--color-gold) 0 1px, transparent 0 50%)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Decorative bottom glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-1/2 -z-10 h-48 w-[600px] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl dark:bg-gold/5"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        {/* Eyebrow */}
        <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-gold">
          1820 — Günümüz
        </p>

        {/* Main title */}
        <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-ink dark:text-cream sm:text-5xl lg:text-6xl max-w-3xl">
          Türk Tarihini
          <br />
          <span className="text-gold">Dönem Dönem</span> Keşfet
        </h1>

        {/* Tagline */}
        <p className="mt-6 max-w-xl text-base leading-relaxed text-fg-muted dark:text-fg-muted-dark sm:text-lg">
          Tanzimat Fermanı&rsquo;ndan Cumhuriyet&rsquo;in kuruluşuna, Soğuk Savaş
          yıllarından günümüze — olaylar, kişiler ve dönüm noktaları.
        </p>

        {/* CTA row */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="#donemler"
            className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-surface-900 hover:bg-gold-dark transition-colors"
          >
            <CalendarDays size={15} />
            Dönemlere Git
          </Link>
          <Link
            href="/kisiler"
            className="inline-flex items-center gap-2 rounded-md border border-border dark:border-border-dark px-5 py-2.5 text-sm font-semibold text-fg dark:text-fg-dark hover:bg-surface-muted dark:hover:bg-surface-800 transition-colors"
          >
            <Users size={15} />
            Kişiler
          </Link>
        </div>

        {/* ── Stats bar ────────────────────────────────────────────────── */}
        <div className="mt-12 flex flex-wrap items-center gap-8 sm:gap-12">
          {[
            { icon: BookOpen, value: counts.eras,    label: 'Tarihsel Dönem' },
            { icon: CalendarDays, value: counts.events,  label: 'Belgelenmiş Olay' },
            { icon: Users,      value: counts.persons, label: 'Tarihi Kişi' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gold/10 text-gold">
                <Icon size={17} strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-2xl font-bold font-display text-ink dark:text-cream leading-none">
                  {value > 0 ? value.toLocaleString('tr-TR') : '—'}
                </p>
                <p className="text-xs text-fg-muted dark:text-fg-muted-dark mt-0.5">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Era Grid Section ──────────────────────────────────────────────────────────

function EraGridSection({ eras }: { eras: Awaited<ReturnType<typeof getAllPublishedEras>> }) {
  return (
    <section id="donemler" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">

      {/* Section header */}
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink dark:text-cream sm:text-3xl">
            Tarihsel Dönemler
          </h2>
          <p className="mt-1.5 text-sm text-fg-muted dark:text-fg-muted-dark">
            Bir dönemi seçerek o döneme ait tüm olayları zaman tünelinde inceleyin.
          </p>
        </div>

        {eras.length > 0 && (
          <span className="shrink-0 rounded-full bg-surface-muted dark:bg-surface-800 px-3 py-1 text-xs font-semibold text-fg-muted dark:text-fg-muted-dark">
            {eras.length} dönem
          </span>
        )}
      </div>

      {/* Grid or empty state */}
      {eras.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {eras.map((era, i) => (
            <EraCard key={era.id} era={era} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}

    </section>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border dark:border-border-dark py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted dark:bg-surface-800 mb-4">
        <BookOpen size={24} className="text-fg-muted dark:text-fg-muted-dark" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-lg font-semibold text-ink dark:text-cream">
        Henüz dönem yok
      </h3>
      <p className="mt-2 max-w-xs text-sm text-fg-muted dark:text-fg-muted-dark">
        Yönetim panelinden ilk tarihi dönemi ekleyin ve durumunu
        &ldquo;Yayınlandı&rdquo; olarak ayarlayın.
      </p>
      <a
        href="/admin/collections/donemler/create"
        className="mt-6 inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-surface-900 hover:bg-gold-dark transition-colors"
      >
        İlk Dönemi Ekle
      </a>
    </div>
  )
}
