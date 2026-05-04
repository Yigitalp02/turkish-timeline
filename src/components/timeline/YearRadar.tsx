'use client'

/**
 * YearRadar — left sticky sidebar.
 *
 * Receives the list of years rendered in the center column and uses an
 * IntersectionObserver to track which year section is currently in the
 * viewport. The active year is highlighted; clicking any year button
 * smoothly scrolls the page to the corresponding section.
 *
 * Year sections in the center column must have:
 *   id={`year-${year}`}  data-year={year}
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

interface YearRadarProps {
  years: number[]
  /** Accent colour of the era, used for the active-year highlight. */
  accentColor?: string | null
}

export function YearRadar({ years, accentColor }: YearRadarProps) {
  const [activeYear, setActiveYear] = useState<number>(years[0] ?? 0)
  // Track which year sections are currently intersecting
  const visibilityMap = useRef<Map<number, boolean>>(new Map())

  // ── IntersectionObserver ─────────────────────────────────────────────────

  useEffect(() => {
    if (!years.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const year = Number(entry.target.getAttribute('data-year'))
          if (year) visibilityMap.current.set(year, entry.isIntersecting)
        })

        // Highlight the topmost currently-visible year section
        const visible = years.filter((y) => visibilityMap.current.get(y))
        if (visible.length) {
          setActiveYear(Math.min(...visible))
        }
      },
      {
        // Trigger when the top of a section enters the upper portion of the
        // viewport (below the navbar at ~64 px). A section is "active" when
        // it occupies the top 50% of the screen.
        rootMargin: '-64px 0px -50% 0px',
        threshold: 0,
      },
    )

    years.forEach((year) => {
      const el = document.getElementById(`year-${year}`)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [years])

  // ── Scroll-to-year ────────────────────────────────────────────────────────

  const scrollToYear = useCallback((year: number) => {
    document.getElementById(`year-${year}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, [])

  if (!years.length) return null

  return (
    <nav
      aria-label="Yıl navigasyonu"
      className="flex flex-col gap-0.5 py-6 px-3"
    >
      <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-fg-muted dark:text-fg-muted-dark">
        Yıllar
      </p>

      {years.map((year) => {
        const isActive = year === activeYear
        return (
          <button
            key={year}
            onClick={() => scrollToYear(year)}
            aria-current={isActive ? 'true' : undefined}
            className={cn(
              'w-full rounded-lg px-3 py-1.5 text-left font-mono text-sm transition-all duration-150',
              isActive
                ? 'font-bold'
                : 'text-fg-muted dark:text-fg-muted-dark hover:text-ink dark:hover:text-cream hover:bg-surface-muted dark:hover:bg-surface-800',
            )}
            style={
              isActive
                ? {
                    backgroundColor: accentColor ? `${accentColor}18` : undefined,
                    color: accentColor ?? undefined,
                  }
                : undefined
            }
          >
            {year}
          </button>
        )
      })}
    </nav>
  )
}
