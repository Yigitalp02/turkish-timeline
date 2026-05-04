/**
 * Loading skeleton for /donemler/[era_slug].
 *
 * Mirrors the page's three-column layout so the UI doesn't jump when data
 * loads. All elements are animated with Tailwind's built-in `animate-pulse`.
 */

export default function EraPageLoading() {
  return (
    <main className="min-h-screen bg-bg dark:bg-bg-dark animate-pulse">

      {/* Hero skeleton */}
      <div className="h-72 sm:h-[28rem] bg-surface-muted dark:bg-surface-800" />

      <div className="mx-auto max-w-screen-xl lg:grid lg:grid-cols-[220px_1fr_220px] lg:items-start">

        {/* Left sidebar skeleton */}
        <aside className="hidden lg:block py-6 px-3 border-r border-border dark:border-border-dark">
          <div className="mb-4 h-3 w-12 rounded bg-surface-muted dark:bg-surface-700" />
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-7 rounded-lg bg-surface-muted dark:bg-surface-700" />
            ))}
          </div>
        </aside>

        {/* Center column skeleton */}
        <div className="px-4 sm:px-6 py-8 space-y-10">
          {Array.from({ length: 3 }).map((_, si) => (
            <div key={si}>
              {/* Year header */}
              <div className="mb-4 h-8 w-20 rounded bg-surface-muted dark:bg-surface-700" />

              {/* Event cards */}
              {Array.from({ length: 2 }).map((_, ci) => (
                <div
                  key={ci}
                  className="my-5 rounded-xl border border-border dark:border-border-dark
                             bg-surface-card dark:bg-surface-800 p-5 space-y-3"
                >
                  {/* Date + tags */}
                  <div className="flex gap-2">
                    <div className="h-4 w-28 rounded bg-surface-muted dark:bg-surface-700" />
                    <div className="h-4 w-16 rounded-full bg-surface-muted dark:bg-surface-700" />
                  </div>
                  {/* Title */}
                  <div className="h-6 w-3/4 rounded bg-surface-muted dark:bg-surface-700" />
                  {/* Participants */}
                  <div className="flex gap-2">
                    <div className="h-5 w-5 rounded-full bg-surface-muted dark:bg-surface-700" />
                    <div className="h-4 w-24 rounded bg-surface-muted dark:bg-surface-700" />
                  </div>
                  {/* Content lines */}
                  <div className="space-y-2 pt-2">
                    <div className="h-3 w-full  rounded bg-surface-muted dark:bg-surface-700" />
                    <div className="h-3 w-5/6   rounded bg-surface-muted dark:bg-surface-700" />
                    <div className="h-3 w-4/6   rounded bg-surface-muted dark:bg-surface-700" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Right sidebar skeleton */}
        <aside className="hidden lg:block py-6 px-3 border-l border-border dark:border-border-dark">
          <div className="mb-4 h-3 w-20 rounded bg-surface-muted dark:bg-surface-700" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2.5 px-2 py-2">
                <div className="h-9 w-9 rounded-full bg-surface-muted dark:bg-surface-700 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 w-full rounded bg-surface-muted dark:bg-surface-700" />
                  <div className="h-2.5 w-2/3  rounded bg-surface-muted dark:bg-surface-700" />
                </div>
              </div>
            ))}
          </div>
        </aside>

      </div>
    </main>
  )
}
