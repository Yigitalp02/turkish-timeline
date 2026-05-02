import { revalidateTag, revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { CACHE_TAGS } from '@/lib/revalidate'

/**
 * Manual cache revalidation endpoint.
 * Protected by REVALIDATION_SECRET — never expose without the secret.
 *
 * Usage examples:
 *   Revalidate a tag:   GET /api/revalidate?secret=TOKEN&tag=donemler
 *   Revalidate a path:  GET /api/revalidate?secret=TOKEN&path=/donemler/ww1
 *   Revalidate all:     GET /api/revalidate?secret=TOKEN
 *
 * Useful for:
 *   - Manually clearing stale cache after bulk data imports
 *   - Emergency cache busting without redeploying
 *   - Triggering from the server via SSH
 */
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  if (!process.env.REVALIDATION_SECRET) {
    return NextResponse.json(
      { error: 'REVALIDATION_SECRET is not configured on this server.' },
      { status: 500 },
    )
  }

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Invalid or missing secret.' }, { status: 401 })
  }

  const tag = request.nextUrl.searchParams.get('tag')
  const path = request.nextUrl.searchParams.get('path')

  const revalidated: { tags: string[]; paths: string[] } = { tags: [], paths: [] }

  if (tag) {
    revalidateTag(tag, 'max')
    revalidated.tags.push(tag)
  }

  if (path) {
    revalidatePath(path)
    revalidated.paths.push(path)
  }

  // No specific target — revalidate everything
  if (!tag && !path) {
    Object.values(CACHE_TAGS).forEach((t) => {
      revalidateTag(t, 'max')
      revalidated.tags.push(t)
    })
    revalidatePath('/')
    revalidated.paths.push('/')
  }

  console.log('[ISR] Manual revalidation triggered:', revalidated)

  return NextResponse.json({
    revalidated: true,
    ...revalidated,
    timestamp: new Date().toISOString(),
  })
}
