import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Kisiler } from './collections/Kisiler'
import { Donemler } from './collections/Donemler'
import { Olaylar } from './collections/Olaylar'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— Kronos Admin',
    },
  },

  // Collections registered in dependency order:
  // Media → Kisiler → Donemler → Olaylar
  collections: [Users, Media, Kisiler, Donemler, Olaylar],

  // Global Lexical editor — individual collections may override with custom blocks (Phase 4)
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
  plugins: [],
})
