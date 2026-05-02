import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import './styles.css'

// ── Fonts ────────────────────────────────────────────────────────────────────
// Inject CSS variable references used by @theme in styles.css.
// latin-ext covers Turkish characters: ş ğ ı İ ö ü ç Ş Ğ Ç Ö Ü

const playfair = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
})

// ── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: 'Kronos — Türk Tarihi Zaman Tüneli',
    template: '%s | Kronos',
  },
  description:
    'Türk tarihinin yaklaşık 1820\'den günümüze uzanan dönemini kapsayan interaktif zaman tüneli ve ansiklopedi.',
  keywords: ['türk tarihi', 'osmanlı', 'zaman tüneli', 'tarih', 'ansiklopedi'],
  authors: [{ name: 'Kronos' }],
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Kronos',
  },
  robots: {
    index: true,
    follow: true,
  },
}

// ── Root Layout ───────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning prevents React from warning about the 'dark'
    // class mismatch between SSR and client (next-themes adds it after mount).
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${playfair.variable} ${inter.variable}`}
    >
      <body className="font-body antialiased">
        <ThemeProvider>
          <div className="flex min-h-dvh flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
