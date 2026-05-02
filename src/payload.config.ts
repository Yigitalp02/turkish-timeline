import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Kisiler } from './collections/Kisiler'
import { Donemler } from './collections/Donemler'
import { Olaylar } from './collections/Olaylar'
import { lexicalToPlainText, truncate } from './lib/lexicalToPlainText'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

// Maps each collection slug to its public-facing URL path
const COLLECTION_ROUTES: Record<string, string> = {
  donemler: 'donemler',
  kisiler: 'kisiler',
  olaylar: 'olaylar',
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— Yazıt Admin',
    },
  },

  // Collections registered in dependency order:
  // Media → Kisiler → Donemler → Olaylar
  collections: [Users, Media, Kisiler, Donemler, Olaylar],

  // Global Lexical editor — individual collections override with custom blocks in Phase 4
  editor: lexicalEditor(),

  secret: process.env.PAYLOAD_SECRET || '',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),

  sharp,

  plugins: [
    // ── SEO Plugin ─────────────────────────────────────────────────────────
    // Adds a "Meta" tab to Donemler, Kisiler, and Olaylar in the admin UI.
    // Auto-generates title, description, and canonical URL from document fields.
    seoPlugin({
      collections: ['donemler', 'kisiler', 'olaylar'],

      // Use the media collection for OG images
      uploadsCollection: 'media',

      // Auto-generate meta title from the document's primary title field
      generateTitle: ({ doc }) => {
        const raw = (doc as Record<string, unknown>)
        const name = (raw?.title || raw?.full_name || 'Yazıt') as string
        return `${name} | Yazıt`
      },

      // Auto-generate meta description from the short summary field
      generateDescription: ({ doc }) => {
        const raw = doc as Record<string, unknown>
        const plain = (raw?.short_description || raw?.excerpt) as string | undefined
        if (plain) return truncate(plain, 160)

        // Fallback: extract from Lexical rich text (biography / content)
        const richText = raw?.biography || raw?.content
        if (richText) return truncate(lexicalToPlainText(richText), 160)

        return ''
      },

      // Build the canonical URL for each document
      generateURL: ({ doc, collectionConfig }) => {
        const raw = doc as Record<string, unknown>
        const slug = raw?.slug as string | undefined
        const collectionSlug = collectionConfig?.slug ?? ''
        const route = COLLECTION_ROUTES[collectionSlug]

        if (!route || !slug) return SERVER_URL
        return `${SERVER_URL}/${route}/${slug}`
      },

      // Auto-generate OG image from the document's primary image field.
      // Return the media document's ID; the plugin resolves it to a URL.
      generateImage: ({ doc }) => {
        const raw = doc as Record<string, unknown>
        // Donemler uses cover_image, Kisiler uses portrait
        const media = raw?.cover_image || raw?.portrait
        if (typeof media === 'number') return media
        if (media && typeof media === 'object' && 'id' in media) {
          return (media as { id: number }).id
        }
        return ''
      },
    }),

    // ── Search Plugin ───────────────────────────────────────────────────────
    // Creates a `search` collection that keeps a lightweight, indexed copy
    // of Kisiler and Olaylar documents for fast site-wide search queries.
    searchPlugin({
      collections: ['kisiler', 'olaylar'],

      // Kisiler appear above Olaylar in search results
      defaultPriorities: {
        kisiler: 20,
        olaylar: 10,
      },

      beforeSync: ({ originalDoc, searchDoc, collectionSlug }) => {
        // Kisiler uses full_name — override the auto-populated title
        if (collectionSlug === 'kisiler') {
          return {
            ...searchDoc,
            title: String(
              (originalDoc as Record<string, unknown>)?.full_name ?? searchDoc.title,
            ),
          }
        }

        return searchDoc
      },
    }),
  ],
})
