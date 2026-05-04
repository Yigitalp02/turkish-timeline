export default function PersonPageLoading() {
  return (
    <main className="min-h-screen bg-bg dark:bg-bg-dark animate-pulse">

      {/* Hero skeleton */}
      <div className="border-b border-border dark:border-border-dark bg-surface-muted dark:bg-surface-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row items-start gap-8 sm:gap-12">
            {/* Portrait placeholder */}
            <div className="w-36 sm:w-44 aspect-[3/4] rounded-xl bg-surface-card dark:bg-surface-800 shrink-0" />
            {/* Info */}
            <div className="flex-1 space-y-4 pt-2">
              <div className="h-5 w-20 rounded-full bg-surface-card dark:bg-surface-800" />
              <div className="h-10 w-3/4 rounded-lg bg-surface-card dark:bg-surface-800" />
              <div className="h-5 w-1/2 rounded bg-surface-card dark:bg-surface-800" />
              <div className="h-4 w-24 rounded bg-surface-card dark:bg-surface-800" />
              <div className="mt-4 space-y-2 border-l-2 border-gold/30 pl-4">
                <div className="h-4 w-full rounded bg-surface-card dark:bg-surface-800" />
                <div className="h-4 w-5/6 rounded bg-surface-card dark:bg-surface-800" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Biography */}
        <div>
          <div className="mb-6 h-8 w-36 rounded-lg bg-surface-muted dark:bg-surface-800" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 rounded bg-surface-muted dark:bg-surface-800"
                   style={{ width: `${85 + Math.sin(i) * 12}%` }} />
            ))}
          </div>
        </div>

        {/* Events */}
        <div>
          <div className="mb-6 h-8 w-48 rounded-lg bg-surface-muted dark:bg-surface-800" />
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-5">
                <div className="flex flex-col items-center w-4 pt-1.5">
                  <div className="w-3 h-3 rounded-full bg-surface-muted dark:bg-surface-800" />
                  <div className="w-px flex-1 mt-1 bg-border dark:bg-border-dark" />
                </div>
                <div className="pb-6 space-y-2 flex-1">
                  <div className="h-3 w-32 rounded bg-surface-muted dark:bg-surface-800" />
                  <div className="h-4 w-3/4 rounded bg-surface-muted dark:bg-surface-800" />
                  <div className="h-3 w-24 rounded bg-surface-muted dark:bg-surface-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
