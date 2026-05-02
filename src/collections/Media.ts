import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    description: 'Portreler, harita görselleri ve arşiv belgeleri için medya kitaplığı.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt Metni',
      admin: {
        description: 'Görselin açıklayıcı metni — erişilebilirlik ve SEO için zorunlu.',
      },
    },
  ],
  upload: {
    // Files stored here are served by Next.js as static assets at /media/*
    // In production this path is bind-mounted as a Docker volume.
    staticDir: path.resolve(dirname, '../../public/media'),
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'],
  },
}
