'use client'

/**
 * SearchButton — inline expanding search bar in the Navbar.
 *
 * Behaviour:
 *  • Click the icon → the pill animates open to show a text input.
 *  • Results appear as a fixed-position dropdown anchored below the pill.
 *  • Click outside, press Escape, or navigate away → collapses back to icon.
 *  • ⌘K / Ctrl+K toggles the bar from anywhere on the page.
 *
 * The dropdown is rendered via React.createPortal so it is never clipped by
 * the navbar's backdrop-blur / overflow context.
 */

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Search, X } from 'lucide-react'
import type { SearchResult } from '@/lib/data/search'
import { cn } from '@/lib/cn'

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildHref(result: SearchResult): string {
  if (!result.doc) return '#'
  const { relationTo, value } = result.doc
  const slug =
    value && typeof value === 'object'
      ? (value as Record<string, unknown>).slug
      : null
  if (!slug) return '#'
  return relationTo === 'kisiler' ? `/kisiler/${slug}` : `/olaylar/${slug}`
}

const BADGE = {
  kisiler: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  olaylar: 'bg-amber-100  text-amber-800  dark:bg-amber-900/30  dark:text-amber-300',
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SearchButton() {
  const [open,    setOpen]    = useState(false)
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Dropdown viewport position (fixed positioning, updated on open)
  const [dropPos, setDropPos] = useState<{ top: number; left: number; width: number } | null>(null)

  // Expanded width: capped so the bar never pushes the hamburger off-screen
  const [expandedWidth, setExpandedWidth] = useState(224)

  const pillRef     = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  // ── Position helpers ──────────────────────────────────────────────────────

  const recalcPos = useCallback(() => {
    if (!pillRef.current) return
    const r = pillRef.current.getBoundingClientRect()
    setDropPos({ top: r.bottom + 8, left: r.left, width: r.width })
  }, [])

  // ── Open / close ──────────────────────────────────────────────────────────

  const openBar = useCallback(() => {
    // Cap to available space: viewport - logo (~160px) - hamburger (36px) - gaps/padding (~40px)
    const maxW = Math.min(224, window.innerWidth - 240)
    setExpandedWidth(Math.max(maxW, 140))
    setOpen(true)
    // Measure AFTER the Framer Motion width animation finishes (~250 ms)
    setTimeout(() => {
      recalcPos()
      inputRef.current?.focus()
    }, 260)
  }, [recalcPos])

  const closeBar = useCallback(() => {
    setOpen(false)
    setQuery('')
    setResults([])
    setDropPos(null)
  }, [])

  const toggle = useCallback(() => {
    if (open) closeBar(); else openBar()
  }, [open, openBar, closeBar])

  // ── Keyboard shortcuts ────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); toggle() }
      if (e.key === 'Escape' && open) closeBar()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, toggle, closeBar])

  // ── Click outside (pill + portalled dropdown) ─────────────────────────────

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        pillRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) return
      closeBar()
    }
    // Small delay so the opening click doesn't immediately close the bar
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 50)
    return () => {
      clearTimeout(id)
      document.removeEventListener('mousedown', handler)
    }
  }, [open, closeBar])

  // ── Debounced search fetch ────────────────────────────────────────────────

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const id = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        if (res.ok) setResults(await res.json())
      } catch { setResults([]) }
      finally  { setLoading(false) }
    }, 300)
    return () => clearTimeout(id)
  }, [query])

  // ── Derived state ─────────────────────────────────────────────────────────

  const showDropdown = open && mounted && !!dropPos && (loading || query.trim() !== '')

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Expanding pill ──────────────────────────────────────────────── */}
      <div ref={pillRef} className="relative flex items-center">
        <motion.div
          animate={{ width: open ? expandedWidth : 36 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'flex items-center overflow-hidden rounded-lg h-9',
            open
              ? 'border border-border dark:border-border-dark bg-surface-muted dark:bg-surface-800'
              : 'border border-transparent',
          )}
        >
          {/* Icon / close button */}
          <button
            onClick={toggle}
            aria-label={open ? 'Aramayı kapat' : 'Ara (⌘K)'}
            aria-expanded={open}
            aria-haspopup="listbox"
            className={cn(
              'flex h-full w-9 shrink-0 items-center justify-center',
              'text-fg-muted dark:text-fg-muted-dark transition-colors duration-150',
              !open && 'hover:bg-surface-muted dark:hover:bg-surface-800 rounded-md',
              open  && 'hover:text-ink dark:hover:text-cream',
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {open
                ? <motion.span key="x"  initial={{ opacity: 0, rotate: -45 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}><X      size={16} strokeWidth={2} /></motion.span>
                : <motion.span key="s"  initial={{ opacity: 0 }}              animate={{ opacity: 1 }}             exit={{ opacity: 0 }} transition={{ duration: 0.12 }}><Search size={18} strokeWidth={1.75} /></motion.span>
              }
            </AnimatePresence>
          </button>

          {/* Text input */}
          <AnimatePresence>
            {open && (
              <motion.input
                ref={inputRef}
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, delay: 0.08 }}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ara…"
                aria-label="Arama sorgusu"
                aria-controls="search-results"
                className={cn(
                  'flex-1 min-w-0 bg-transparent text-sm outline-none pr-3',
                  'text-ink dark:text-cream',
                  'placeholder:text-fg-muted/60 dark:placeholder:text-fg-muted-dark/60',
                )}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Dropdown (portalled, fixed position) ────────────────────────── */}
      {mounted && showDropdown && dropPos && createPortal(
        <div
          ref={dropdownRef}
          id="search-results"
          role="listbox"
          aria-label="Arama sonuçları"
          style={{
            position: 'fixed',
            top:   dropPos.top,
            left:  dropPos.left,
            width: dropPos.width,
            zIndex: 60,
          }}
          className={cn(
            'overflow-hidden rounded-xl',
            'border border-border dark:border-border-dark',
            'bg-surface-card dark:bg-surface-800',
            'shadow-xl shadow-ink/10 dark:shadow-black/40',
          )}
        >
          {/* Loading */}
          {loading && !results.length && (
            <p className="px-4 py-3 text-sm text-fg-muted dark:text-fg-muted-dark animate-pulse">
              Aranıyor…
            </p>
          )}

          {/* No results */}
          {!loading && query && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-fg-muted dark:text-fg-muted-dark">
              <span className="font-semibold text-ink dark:text-cream">&ldquo;{query}&rdquo;</span>
              {' '}için sonuç yok.
            </p>
          )}

          {/* Result rows */}
          {results.length > 0 && (
            <ul>
              {results.map((result) => {
                const rel = result.doc?.relationTo ?? 'olaylar'
                return (
                  <li key={result.id} role="option" aria-selected="false">
                    <Link
                      href={buildHref(result)}
                      onClick={closeBar}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5 no-underline group',
                        'border-b border-border/40 dark:border-border-dark/40 last:border-0',
                        'hover:bg-surface-muted dark:hover:bg-surface-950/60 transition-colors',
                      )}
                    >
                      {/* Collection badge */}
                      <span className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        BADGE[rel as keyof typeof BADGE] ?? BADGE.olaylar,
                      )}>
                        {rel === 'kisiler' ? 'Kişi' : 'Olay'}
                      </span>

                      {/* Title */}
                      <span className={cn(
                        'flex-1 min-w-0 truncate text-sm font-medium',
                        'text-ink dark:text-cream',
                        'group-hover:text-gold-dark dark:group-hover:text-gold transition-colors',
                      )}>
                        {result.title}
                      </span>

                      {/* Arrow */}
                      <ArrowRight
                        size={13}
                        aria-hidden
                        className="shrink-0 text-fg-muted dark:text-fg-muted-dark opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>,
        document.body,
      )}
    </>
  )
}
