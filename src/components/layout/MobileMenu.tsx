'use client'

import { Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { NavLinks } from './NavLinks'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
        aria-expanded={open}
        aria-controls="mobile-drawer"
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-md md:hidden',
          'text-fg-muted dark:text-fg-muted-dark',
          'hover:bg-surface-muted dark:hover:bg-surface-800',
          'hover:text-fg dark:hover:text-fg-dark',
          'transition-colors duration-150',
        )}
      >
        {open ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm md:hidden"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        id="mobile-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigasyon menüsü"
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-72 md:hidden',
          'flex flex-col',
          'bg-surface dark:bg-surface-900',
          'border-l border-border dark:border-border-dark',
          'shadow-2xl',
          'transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border dark:border-border-dark">
          <span className="font-display text-lg font-semibold text-gold tracking-wide">
            KRONOS
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Kapat"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md',
              'text-fg-muted dark:text-fg-muted-dark',
              'hover:bg-surface-muted dark:hover:bg-surface-800',
              'transition-colors',
            )}
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavLinks vertical onNavigate={() => setOpen(false)} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border dark:border-border-dark">
          <span className="text-xs text-fg-muted dark:text-fg-muted-dark">
            Türk Tarihi Zaman Tüneli
          </span>
          <ThemeToggle />
        </div>
      </div>
    </>
  )
}
