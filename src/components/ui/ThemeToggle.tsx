'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch: render a placeholder until mounted on client
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div
        className={cn(
          'h-9 w-9 rounded-md bg-stone/10 animate-pulse',
          className,
        )}
        aria-hidden
      />
    )
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label={resolvedTheme === 'dark' ? 'Aydınlık temaya geç' : 'Karanlık temaya geç'}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-md',
        'text-fg-muted dark:text-fg-muted-dark',
        'hover:bg-surface-muted dark:hover:bg-surface-800',
        'hover:text-fg dark:hover:text-fg-dark',
        'transition-colors duration-150',
        className,
      )}
    >
      {resolvedTheme === 'dark' ? (
        <Sun size={18} strokeWidth={1.75} />
      ) : (
        <Moon size={18} strokeWidth={1.75} />
      )}
    </button>
  )
}
