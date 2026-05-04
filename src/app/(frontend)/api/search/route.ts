/**
 * GET /api/search?q=query
 *
 * Thin wrapper around the server-side getSearchResults() function so the
 * client-side SearchOverlay can call it without importing server modules.
 */
import { type NextRequest, NextResponse } from 'next/server'
import { getSearchResults } from '@/lib/data/search'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''

  const results = await getSearchResults(q, 15)

  return NextResponse.json(results, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
