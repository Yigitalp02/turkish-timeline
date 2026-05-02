'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ReactNode } from 'react'

/**
 * Wraps next-themes ThemeProvider.
 *
 * attribute="class" → next-themes toggles the 'dark' class on <html>,
 * which is picked up by the Tailwind v4 @variant dark rule in styles.css.
 *
 * disableTransitionOnChange prevents a flash of the wrong colour when
 * the theme switches.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
