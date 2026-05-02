/**
 * EraCardSkeleton — placeholder shown while era data is loading.
 * Mirrors the EraCard dimensions and structure exactly so the layout
 * doesn't shift when real cards appear.
 */
export function EraCardSkeleton() {
  return (
    <div
      className="relative overflow-hidden rounded-xl bg-surface-muted dark:bg-surface-800 animate-pulse"
      style={{ aspectRatio: '4 / 3' }}
      aria-hidden
    >
      {/* Simulated gradient overlay area */}
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 space-y-3">
        {/* Year badge */}
        <div className="h-5 w-28 rounded-full bg-stone/20 dark:bg-stone/10" />
        {/* Title line 1 */}
        <div className="h-6 w-3/4 rounded-md bg-stone/20 dark:bg-stone/10" />
        {/* Title line 2 (shorter) */}
        <div className="h-6 w-1/2 rounded-md bg-stone/20 dark:bg-stone/10" />
      </div>
    </div>
  )
}
