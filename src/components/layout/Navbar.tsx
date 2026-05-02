/**
 * Top navigation bar — Server Component.
 * Interactive parts (active link highlights, mobile drawer) live in
 * NavLinks and MobileMenu which are Client Components.
 */
import Link from 'next/link'
import { Search } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { NavLinks } from './NavLinks'
import { MobileMenu } from './MobileMenu'

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
            aria-label="Kronos — Ana sayfa"
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
            <span className="font-display text-lg font-bold tracking-widest text-ink dark:text-cream">
              KRONOS
            </span>
          </Link>

          {/* Separator */}
          <div className="hidden sm:block h-5 w-px bg-border dark:bg-border-dark" aria-hidden />

          {/* Sub-title — hidden on very small screens */}
          <span className="hidden sm:block text-xs text-fg-muted dark:text-fg-muted-dark tracking-wide whitespace-nowrap">
            Türk Tarihi Zaman Tüneli
          </span>

          {/* ── Desktop nav links ─────────────────────────────────────────── */}
          <NavLinks className="hidden md:flex ml-4" />

          {/* ── Spacer ────────────────────────────────────────────────────── */}
          <div className="flex-1" />

          {/* ── Actions ───────────────────────────────────────────────────── */}
          <div className="flex items-center gap-1">
            {/* Search button — stub; Phase 10 wires up the search overlay */}
            <button
              aria-label="Ara"
              className={[
                'flex h-9 w-9 items-center justify-center rounded-md',
                'text-fg-muted dark:text-fg-muted-dark',
                'hover:bg-surface-muted dark:hover:bg-surface-800',
                'hover:text-fg dark:hover:text-fg-dark',
                'transition-colors duration-150',
              ].join(' ')}
            >
              <Search size={18} strokeWidth={1.75} />
            </button>

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
