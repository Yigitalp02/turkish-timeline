/**
 * Site-wide search powered by @payloadcms/plugin-search.
 *
 * The plugin maintains a dedicated `search` collection that keeps a lightweight,
 * indexed copy of kisiler and olaylar documents.  Querying it is fast and avoids
 * scanning the full rich-text content.
 *
 * Note: Search is user-driven and must NOT be cached — results change with
 * every query string.
 */
import { getPayloadInstance } from '../payload'

export interface SearchResult {
  id: number
  title: string
  priority?: number | null
  doc?: {
    relationTo: 'kisiler' | 'olaylar'
    value: number | Record<string, unknown>
  }
}

/**
 * Returns up to `limit` search results ranked by priority descending.
 * Returns an empty array for blank queries.
 */
export async function getSearchResults(
  query: string,
  limit = 20,
): Promise<SearchResult[]> {
  if (!query.trim()) return []

  const payload = await getPayloadInstance()
  const result = await payload.find({
    collection: 'search',
    where: {
      title: { like: query },
    },
    sort: '-priority',
    depth: 1, // populate doc.value so we get the slug for link construction
    limit,
  })

  return result.docs as unknown as SearchResult[]
}
