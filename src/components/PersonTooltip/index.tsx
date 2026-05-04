'use client'

/**
 * PersonTooltip — standalone Client Component.
 *
 * Renders an underlined inline person mention that reveals a rich popover card
 * on hover/focus.
 *
 * Key design decisions:
 *  • React Portal — the popover is mounted into document.body, so it is never
 *    clipped by ancestor overflow:hidden/clip containers (critical inside the
 *    Timeline scroll flow).
 *  • Framer Motion AnimatePresence — smooth fade+scale enter/exit animation.
 *  • Lazy data fetch — the /api/persons/[id]/summary endpoint is called only
 *    on first hover and cached in component state for the session lifetime.
 *    Pass `prefetchedData` to skip the fetch entirely (used by RichTextRenderer
 *    which already has populated relationship data from Payload).
 *  • Loading skeleton — shown while the API request is in flight.
 *  • Viewport-aware positioning — the portal flips above/below the trigger and
 *    clamps to viewport edges to avoid overflow.
 *  • Scroll-aware — re-reads the trigger's DOMRect on scroll/resize while the
 *    popover is open so it stays anchored to the trigger.
 */

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/cn'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PersonSummary {
  id: number
  full_name: string
  slug?: string | null
  title?: string | null
  excerpt?: string | null
  portrait?: {
    url: string
    alt?: string | null
    width?: number | null
    height?: number | null
  } | null
}

export interface PersonTooltipProps {
  personId: number
  /** Text shown inline in the content (may differ from full_name). */
  personName: string
  /**
   * Pre-populated person data from the server render.
   * When provided the API fetch is skipped entirely.
   */
  prefetchedData?: PersonSummary
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const TOOLTIP_W        = 264   // px — must match the CSS width class below
const TOOLTIP_EST_H    = 210   // px — estimated height for flip logic
const HIDE_DELAY_MS    = 140
const EDGE_MARGIN_PX   = 10

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function PersonTooltip({ personId, personName, prefetchedData }: PersonTooltipProps) {
  const [visible,  setVisible]  = useState(false)
  const [data,     setData]     = useState<PersonSummary | null>(prefetchedData ?? null)
  const [loading,  setLoading]  = useState(false)
  // Whether the component has mounted (guards against SSR createPortal call)
  const [mounted,  setMounted]  = useState(false)
  // Live DOMRect of the trigger, refreshed on hover open + scroll/resize
  const [rect,     setRect]     = useState<DOMRect | null>(null)

  const triggerRef = useRef<HTMLSpanElement>(null)
  const hideTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Ensures we only fetch once per component lifetime
  const hasFetched = useRef(Boolean(prefetchedData))

  useEffect(() => setMounted(true), [])

  // ── Helpers ────────────────────────────────────────────────────────────────

  const captureRect = useCallback(() => {
    if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect())
  }, [])

  const show = useCallback(async () => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    captureRect()
    setVisible(true)

    if (!hasFetched.current) {
      hasFetched.current = true
      setLoading(true)
      try {
        const res = await fetch(`/api/persons/${personId}/summary`)
        if (res.ok) setData(await res.json())
      } catch {
        // Silently fail — tooltip still shows the person's inline name
      } finally {
        setLoading(false)
      }
    }
  }, [personId, captureRect])

  const hide = useCallback(() => {
    hideTimer.current = setTimeout(() => setVisible(false), HIDE_DELAY_MS)
  }, [])

  // Keep the popover anchored during scroll / resize
  useEffect(() => {
    if (!visible) return
    const update = () => captureRect()
    window.addEventListener('scroll', update, { capture: true, passive: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [visible, captureRect])

  // ── Portal positioning ─────────────────────────────────────────────────────

  const getPortalStyle = (): React.CSSProperties => {
    if (!rect) return { position: 'fixed', opacity: 0, pointerEvents: 'none' }

    // Flip above the trigger if there isn't enough room below
    const above = rect.bottom + TOOLTIP_EST_H > window.innerHeight - EDGE_MARGIN_PX

    // Clamp left to keep tooltip inside the viewport
    const left = Math.min(
      Math.max(rect.left, EDGE_MARGIN_PX),
      window.innerWidth - TOOLTIP_W - EDGE_MARGIN_PX,
    )

    return {
      position: 'fixed',
      left,
      width: TOOLTIP_W,
      zIndex: 9999,
      ...(above
        // Align tooltip bottom to trigger top
        ? { bottom: window.innerHeight - rect.top + 8 }
        // Align tooltip top to trigger bottom
        : { top: rect.bottom + 8 }),
    }
  }

  // ── Animation variants ─────────────────────────────────────────────────────

  const variants = {
    hidden: { opacity: 0, y: 6, scale: 0.96 },
    show:   { opacity: 1, y: 0, scale: 1 },
  }

  const href = data?.slug ? `/kisiler/${data.slug}` : null

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Inline trigger ─────────────────────────────────────────────────── */}
      <span
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        aria-haspopup="dialog"
        className={cn(
          'font-medium text-gold-dark dark:text-gold',
          'underline underline-offset-2 decoration-gold-dark/40 dark:decoration-gold/40',
          'hover:text-gold dark:hover:text-gold-light hover:decoration-gold',
          'transition-colors cursor-default',
        )}
      >
        {personName}
      </span>

      {/* ── Portal popover — escapes any overflow:hidden ancestor ───────────── */}
      {mounted && createPortal(
        <AnimatePresence>
          {visible && (
            // Outer div handles fixed positioning; inner motion.div handles animation
            <div style={getPortalStyle()}>
              <motion.div
                role="dialog"
                aria-label={`${data?.full_name ?? personName} hakkında özet bilgi`}
                variants={variants}
                initial="hidden"
                animate="show"
                exit="hidden"
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={show}
                onMouseLeave={hide}
                className={cn(
                  'overflow-hidden rounded-xl',
                  'border border-border dark:border-border-dark',
                  'bg-surface-card dark:bg-surface-800',
                  'shadow-2xl shadow-ink/10 dark:shadow-black/40',
                )}
              >
                {/* ── Portrait strip ──────────────────────────────────────── */}
                {data?.portrait?.url && (
                  <div className="relative h-28 overflow-hidden bg-surface-muted dark:bg-surface-950">
                    <Image
                      src={data.portrait.url}
                      alt={data.portrait.alt ?? data.full_name}
                      fill
                      className="object-cover object-top"
                      sizes={`${TOOLTIP_W}px`}
                    />
                    {/* Gradient so text below isn't jarring */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface-card/70 dark:to-surface-800/70" />
                  </div>
                )}

                {/* ── Card body ───────────────────────────────────────────── */}
                <div className="p-4">

                  {/* Loading skeleton */}
                  {loading && !data && (
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 w-3/4 rounded-md bg-surface-muted dark:bg-surface-700" />
                      <div className="h-3 w-1/2 rounded-md bg-surface-muted dark:bg-surface-700" />
                      <div className="mt-3 space-y-1.5">
                        <div className="h-2.5 w-full rounded bg-surface-muted dark:bg-surface-700" />
                        <div className="h-2.5 w-5/6 rounded bg-surface-muted dark:bg-surface-700" />
                        <div className="h-2.5 w-4/6 rounded bg-surface-muted dark:bg-surface-700" />
                      </div>
                    </div>
                  )}

                  {/* Populated content */}
                  {!loading || data ? (
                    <>
                      <p className="font-display text-sm font-bold leading-tight text-ink dark:text-cream">
                        {data?.full_name ?? personName}
                      </p>

                      {data?.title && (
                        <p className="mt-0.5 text-xs text-fg-muted dark:text-fg-muted-dark">
                          {data.title}
                        </p>
                      )}

                      {data?.excerpt && (
                        <p className="mt-2.5 text-xs leading-relaxed text-fg-muted dark:text-fg-muted-dark line-clamp-3">
                          {data.excerpt}
                        </p>
                      )}

                      {href && (
                        <Link
                          href={href}
                          className={cn(
                            'mt-3 inline-flex items-center gap-1',
                            'text-xs font-semibold text-gold no-underline',
                            'hover:text-gold-dark dark:hover:text-gold-light transition-colors',
                          )}
                        >
                          Tam profili gör
                          <span aria-hidden>→</span>
                        </Link>
                      )}
                    </>
                  ) : null}

                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}
