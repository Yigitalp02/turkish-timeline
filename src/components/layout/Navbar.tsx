/**
 * Top navigation bar — Server Component.
 * Interactive parts (active link highlights, mobile drawer) live in
 * NavLinks and MobileMenu which are Client Components.
 */
import Link from 'next/link'
import { ThemeToggle }  from '@/components/ui/ThemeToggle'
import { NavLinks }     from './NavLinks'
import { MobileMenu }   from './MobileMenu'
import { SearchButton } from '@/components/search/SearchButton'

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 w-full">
      {/* Glass surface */}
      <div
        className={[
          'border-b border-border dark:border-border-dark',
          'bg-surface/80 dark:bg-surface-900/80',
          'backdrop-blur-md',
          'supports-[backdrop-filter]:bg-surface/70',
          'supports-[backdrop-filter]:dark:bg-surface-900/70',
        ].join(' ')}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">

          {/* ── Logo ─────────────────────────────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 group"
            aria-label="Yazıt — Ana sayfa"
          >
            {/* Decorative crescent-star mark */}
            <span
              className={[
                'flex h-7 w-7 items-center justify-center rounded-sm',
                'bg-gold text-surface-900',
                'text-xs font-display font-bold leading-none',
                'group-hover:bg-gold-dark transition-colors duration-150',
              ].join(' ')}
              aria-hidden
            >
              ✦
            </span>
            {/* "YAZIT:" in display font + subtitle as one compound name */}
            <span className="flex items-baseline gap-1.5">
              <span className="font-display text-lg font-bold tracking-widest text-ink dark:text-cream">
                YAZIT
              </span>
              <span className="font-display text-lg font-bold tracking-widest text-gold" aria-hidden>
                :
              </span>
              <span className="hidden sm:inline text-xs text-fg-muted dark:text-fg-muted-dark tracking-wide whitespace-nowrap">
                Türk Tarihi Zaman Tüneli
              </span>
            </span>
          </Link>

          {/* ── Desktop nav links ─────────────────────────────────────────── */}
          <NavLinks className="hidden md:flex ml-4" />

          {/* ── Spacer ────────────────────────────────────────────────────── */}
          <div className="flex-1" />

          {/* ── Actions ───────────────────────────────────────────────────── */}
          <div className="flex items-center gap-1">
            <SearchButton />

            {/* Theme toggle — hidden on mobile (available inside drawer) */}
            <ThemeToggle className="hidden md:flex" />

            {/* Hamburger — mobile only */}
            <MobileMenu />
          </div>

        </div>
      </div>
    </header>
  )
}
