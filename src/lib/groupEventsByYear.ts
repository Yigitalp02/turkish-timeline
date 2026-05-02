/**
 * Groups a flat list of Olaylar (Events) into a Map keyed by year.
 *
 * Uses display_year when available (set automatically from exact_date in the
 * beforeChange hook); falls back to parsing exact_date if not set.
 *
 * The returned Map is sorted by year ascending so that iterating over it
 * produces chronological output (Map insertion order is preserved in JS).
 *
 * Pure utility — no I/O, no side effects, safe to call anywhere.
 */
import type { Olaylar } from '../payload-types'

export function groupEventsByYear(events: Olaylar[]): Map<number, Olaylar[]> {
  const unsorted = new Map<number, Olaylar[]>()

  for (const event of events) {
    const year =
      event.display_year ?? new Date(event.exact_date).getUTCFullYear()

    const bucket = unsorted.get(year)
    if (bucket) {
      bucket.push(event)
    } else {
      unsorted.set(year, [event])
    }
  }

  // Sort keys ascending before returning so the caller can iterate in order
  return new Map([...unsorted.entries()].sort(([a], [b]) => a - b))
}
