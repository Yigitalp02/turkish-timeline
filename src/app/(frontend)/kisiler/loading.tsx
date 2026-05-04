export default function PersonsIndexLoading() {
  return (
    <main className="min-h-screen bg-bg dark:bg-bg-dark animate-pulse">

      {/* Header skeleton */}
      <div className="border-b border-border dark:border-border-dark bg-surface-muted dark:bg-surface-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-3">
          <div className="h-10 w-40 rounded-lg bg-surface-card dark:bg-surface-800" />
          <div className="h-4 w-96 rounded bg-surface-card dark:bg-surface-800" />
          <div className="h-3 w-24 rounded bg-surface-card dark:bg-surface-800" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter tab skeletons */}
        <div className="mb-8 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-24 rounded-full bg-surface-muted dark:bg-surface-800" />
          ))}
        </div>

        {/* Card grid skeletons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border dark:border-border-dark
                                    bg-surface-card dark:bg-surface-800 overflow-hidden">
              {/* Portrait */}
              <div className="aspect-[3/4] bg-surface-muted dark:bg-surface-950" />
              {/* Info */}
              <div className="p-3 space-y-2">
                <div className="h-3.5 w-full  rounded bg-surface-muted dark:bg-surface-700" />
                <div className="h-3   w-2/3   rounded bg-surface-muted dark:bg-surface-700" />
                <div className="h-2.5 w-1/3   rounded bg-surface-muted dark:bg-surface-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
