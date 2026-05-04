export default function EventPageLoading() {
  return (
    <main className="min-h-screen bg-bg dark:bg-bg-dark animate-pulse">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Breadcrumb */}
        <div className="mb-8 h-8 w-36 rounded-lg bg-surface-muted dark:bg-surface-800" />

        {/* Era chip + date */}
        <div className="mb-4 flex gap-3">
          <div className="h-6 w-28 rounded-full bg-surface-muted dark:bg-surface-800" />
          <div className="h-6 w-32 rounded   bg-surface-muted dark:bg-surface-800" />
        </div>

        {/* Tags */}
        <div className="mb-5 flex gap-2">
          <div className="h-5 w-16 rounded-full bg-surface-muted dark:bg-surface-800" />
          <div className="h-5 w-20 rounded-full bg-surface-muted dark:bg-surface-800" />
        </div>

        {/* Title */}
        <div className="mb-6 space-y-3">
          <div className="h-10 w-4/5  rounded-lg bg-surface-muted dark:bg-surface-800" />
          <div className="h-10 w-2/3  rounded-lg bg-surface-muted dark:bg-surface-800" />
        </div>

        {/* Participants */}
        <div className="mb-8 flex items-center gap-3">
          <div className="h-4 w-16 rounded bg-surface-muted dark:bg-surface-800" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-surface-muted dark:bg-surface-800" />
              <div className="h-4 w-20 rounded  bg-surface-muted dark:bg-surface-800" />
            </div>
          ))}
        </div>

        <div className="mb-8 h-px bg-border dark:bg-border-dark" />

        {/* Content lines */}
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-4 rounded bg-surface-muted dark:bg-surface-800"
              style={{ width: `${78 + Math.sin(i * 1.3) * 18}%` }}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
