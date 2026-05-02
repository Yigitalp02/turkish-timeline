/**
 * Temporary placeholder home page.
 * Phase 8 will replace this with the full Era Hub built from CMS data.
 */
import Link from 'next/link'
import { ArrowRight, BookOpen, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center px-4 py-32 sm:py-48 text-center overflow-hidden">

        {/* Subtle background pattern */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-5 dark:opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, var(--color-gold) 0 1px, transparent 0 50%)',
            backgroundSize: '24px 24px',
          }}
        />

        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-gold">
          1820 — Günümüz
        </p>

        <h1 className="font-display text-5xl font-bold tracking-tight text-ink dark:text-cream sm:text-6xl lg:text-7xl">
          Türk Tarihi
          <br />
          <span className="text-gold">Zaman Tüneli</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-fg-muted dark:text-fg-muted-dark">
          Tanzimat'tan Cumhuriyet'e, iki dünya savaşından modern Türkiye'ye uzanan
          yaklaşık iki yüz yıllık tarihi interaktif olarak keşfedin.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/donemler"
            className="inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-surface-900 hover:bg-gold-dark transition-colors"
          >
            Dönemleri Keşfet
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/kisiler"
            className="inline-flex items-center gap-2 rounded-md border border-border dark:border-border-dark px-6 py-3 text-sm font-semibold text-fg dark:text-fg-dark hover:bg-surface-muted dark:hover:bg-surface-800 transition-colors"
          >
            Tarihi Kişiler
            <Users size={16} />
          </Link>
        </div>
      </section>

      {/* ── Quick links ─────────────────────────────────────────────────── */}
      <section className="border-t border-border dark:border-border-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {[
              {
                icon: ArrowRight,
                title: 'Zaman Tüneli',
                description:
                  'Olayları kronolojik sırayla, dönem dönem inceleyin.',
                href: '/donemler',
                label: 'Dönemlere git',
              },
              {
                icon: Users,
                title: 'Tarihi Kişiler',
                description:
                  'Devlet adamları, komutanlar, entelektüeller — tüm önemli figürler.',
                href: '/kisiler',
                label: 'Kişilere git',
              },
              {
                icon: BookOpen,
                title: 'İçerik Ekle',
                description:
                  'Yönetim paneliyle yeni dönem, olay ve kişi ekleyin.',
                href: '/admin',
                label: 'Admin paneline git',
              },
            ].map(({ icon: Icon, title, description, href, label }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col gap-4 rounded-lg border border-border dark:border-border-dark bg-surface-card dark:bg-surface-800 p-6 hover:border-gold dark:hover:border-gold transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-muted dark:bg-surface-900 text-gold">
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-ink dark:text-cream group-hover:text-gold dark:group-hover:text-gold transition-colors">
                    {title}
                  </h2>
                  <p className="mt-1 text-sm text-fg-muted dark:text-fg-muted-dark leading-relaxed">
                    {description}
                  </p>
                </div>
                <span className="mt-auto text-sm font-medium text-gold group-hover:underline">
                  {label} →
                </span>
              </Link>
            ))}

          </div>
        </div>
      </section>

    </div>
  )
}
