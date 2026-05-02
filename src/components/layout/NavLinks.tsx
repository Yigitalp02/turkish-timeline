'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'

const NAV_ITEMS = [
  { href: '/',         label: 'Ana Sayfa' },
  { href: '/donemler', label: 'Dönemler' },
  { href: '/kisiler',  label: 'Kişiler' },
] as const

interface NavLinksProps {
  /** When true, renders as a vertical column (mobile menu). */
  vertical?: boolean
  className?: string
  onNavigate?: () => void
}

export function NavLinks({ vertical = false, className, onNavigate }: NavLinksProps) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Ana navigasyon"
      className={cn(
        vertical ? 'flex flex-col gap-1' : 'flex items-center gap-1',
        className,
      )}
    >
      {NAV_ITEMS.map(({ href, label }) => {
        const isActive =
          href === '/' ? pathname === '/' : pathname.startsWith(href)

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              'relative px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150',
              'focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none',
              isActive
                ? [
                    'text-gold',
                    'after:absolute after:bottom-0 after:left-3 after:right-3',
                    'after:h-px after:rounded-full after:bg-gold',
                    vertical && 'after:hidden bg-surface-muted dark:bg-surface-800',
                  ]
                : [
                    'text-fg-muted dark:text-fg-muted-dark',
                    'hover:text-fg dark:hover:text-fg-dark',
                    'hover:bg-surface-muted dark:hover:bg-surface-800',
                  ],
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
