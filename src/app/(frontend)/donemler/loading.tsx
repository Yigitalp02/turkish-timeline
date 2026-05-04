import { EraCardSkeleton } from '@/components/era/EraCardSkeleton'

export default function ErasIndexLoading() {
  return (
    <main className="min-h-screen bg-bg dark:bg-bg-dark animate-pulse">

      {/* Header skeleton */}
      <div className="border-b border-border dark:border-border-dark bg-surface-muted dark:bg-surface-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-3">
          <div className="h-10 w-44 rounded-lg bg-surface-card dark:bg-surface-800" />
          <div className="h-4 w-96 rounded   bg-surface-card dark:bg-surface-800" />
          <div className="h-3 w-16 rounded   bg-surface-card dark:bg-surface-800" />
        </div>
      </div>

      {/* Card grid skeleton */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <EraCardSkeleton key={i} />
          ))}
        </div>
      </div>

    </main>
  )
}
