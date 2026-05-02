import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind class names without conflicts.
 * Uses clsx for conditional logic and tailwind-merge to resolve
 * conflicting utility classes (e.g. "p-4 p-2" → "p-2").
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
