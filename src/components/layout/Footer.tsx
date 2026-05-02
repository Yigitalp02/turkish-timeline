import Link from 'next/link'

const currentYear = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="border-t border-border dark:border-border-dark bg-surface-muted dark:bg-surface-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Main footer row */}
        <div className="flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between">

          {/* Brand block */}
          <div className="flex flex-col gap-2">
            <span className="font-display text-xl font-bold tracking-widest text-gold">
              YAZIT
            </span>
            <p className="max-w-xs text-sm text-fg-muted dark:text-fg-muted-dark leading-relaxed">
              Türk tarihinin yaklaşık 1820'den günümüze uzanan dönemi için
              interaktif bir zaman tüneli ve ansiklopedi.
            </p>
          </div>

          {/* Navigation groups */}
          <div className="grid grid-cols-2 gap-8 sm:gap-16">
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-fg-muted dark:text-fg-muted-dark">
                Keşfet
              </h3>
              <ul className="flex flex-col gap-2">
                {[
                  { href: '/',         label: 'Ana Sayfa' },
                  { href: '/donemler', label: 'Dönemler' },
                  { href: '/kisiler',  label: 'Kişiler' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-fg-muted dark:text-fg-muted-dark hover:text-gold dark:hover:text-gold transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-fg-muted dark:text-fg-muted-dark">
                Sistem
              </h3>
              <ul className="flex flex-col gap-2">
                <li>
                  <a
                    href="/admin"
                    className="text-sm text-fg-muted dark:text-fg-muted-dark hover:text-gold dark:hover:text-gold transition-colors"
                    rel="noopener noreferrer"
                  >
                    Yönetim Paneli
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-1 border-t border-border dark:border-border-dark py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-fg-muted dark:text-fg-muted-dark">
            © {currentYear} Yazıt. Tüm hakları saklıdır.
          </p>
          <p className="text-xs text-fg-muted dark:text-fg-muted-dark">
            Payload CMS + Next.js ile inşa edildi.
          </p>
        </div>

      </div>
    </footer>
  )
}
