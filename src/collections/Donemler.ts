import type { CollectionConfig, Access } from 'payload'
import { populateSlug } from '../lib/slugify'

const isLoggedIn: Access = ({ req: { user } }) => Boolean(user)

export const Donemler: CollectionConfig = {
  slug: 'donemler',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'start_year', 'end_year', '_status'],
    description: 'Tarihsel dönemler ve çağlar — ana kategoriler (örn. Tanzimat, WWI, Erken Cumhuriyet).',
  },
  access: {
    read: () => true,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeChange: [populateSlug('title')],
  },
  fields: [
    // ── Main column ──────────────────────────────────────────────────────────
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Dönem Adı',
    },
    {
      name: 'short_description',
      type: 'textarea',
      label: 'Kısa Açıklama',
      admin: {
        description: 'Ana sayfadaki dönem kartında ve SEO meta açıklamasında kullanılır.',
      },
    },
    {
      name: 'key_figures',
      type: 'relationship',
      relationTo: 'kisiler',
      hasMany: true,
      label: 'Önemli Figürler',
      admin: {
        description: 'Bu döneme ait öne çıkan tarihsel figürler. Zaman tünelinin sağ kenar çubuğunda gösterilir.',
      },
    },

    // ── Sidebar ───────────────────────────────────────────────────────────────
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      label: 'Slug (URL)',
      admin: {
        position: 'sidebar',
        description: 'Dönem adından otomatik oluşturulur. Özel URL için düzenleyebilirsiniz.',
      },
    },
    {
      name: 'start_year',
      type: 'number',
      required: true,
      label: 'Başlangıç Yılı',
      admin: { position: 'sidebar' },
    },
    {
      name: 'end_year',
      type: 'number',
      required: true,
      label: 'Bitiş Yılı',
      admin: { position: 'sidebar' },
    },
    {
      name: 'cover_image',
      type: 'upload',
      relationTo: 'media',
      label: 'Kapak Görseli',
      admin: {
        position: 'sidebar',
        description: 'Dönem kartı ve sayfa başlığında gösterilir.',
      },
    },
    {
      name: 'accent_color',
      type: 'text',
      label: 'Vurgu Rengi (HEX)',
      admin: {
        position: 'sidebar',
        description: 'Bu dönemin tema rengi. Örn: #8B1A1A (koyu kırmızı), #1A3A6B (lacivert).',
      },
      validate: (value: string | null | undefined) => {
        if (value && !/^#[0-9A-Fa-f]{6}$/.test(value)) {
          return 'Geçerli bir HEX renk kodu girin. Örn: #8B1A1A'
        }
        return true
      },
    },
  ],
}
