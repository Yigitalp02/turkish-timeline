import type { CollectionConfig, Access } from 'payload'
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical'
import { populateSlug } from '../lib/slugify'
import { QuoteBlock } from '../blocks/QuoteBlock'
import { ArchiveDocumentBlock } from '../blocks/ArchiveDocumentBlock'
import { MapBlock } from '../blocks/MapBlock'
import { FootnoteBlock } from '../blocks/FootnoteBlock'
import { TimelineCalloutBlock } from '../blocks/TimelineCalloutBlock'
import { InlinePersonMentionBlock } from '../blocks/InlinePersonMentionBlock'

const isLoggedIn: Access = ({ req: { user } }) => Boolean(user)

export const Kisiler: CollectionConfig = {
  slug: 'kisiler',
  admin: {
    useAsTitle: 'full_name',
    defaultColumns: ['full_name', 'role', 'birth_year', 'death_year', '_status'],
    description: 'Tarihsel figürler ve biyografik ansiklopedi girişleri.',
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
    beforeChange: [populateSlug('full_name')],
  },
  fields: [
    // ── Main column ──────────────────────────────────────────────────────────
    {
      name: 'full_name',
      type: 'text',
      required: true,
      label: 'Ad Soyad',
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Kısa Biyografi (Özet)',
      admin: {
        description:
          'Maks. 300 karakter. Zaman tünelinde ismin üzerine gelindiğinde açılan popover kartında görünür.',
      },
      validate: (value: string | null | undefined) => {
        if (value && value.length > 300) {
          return `Özet en fazla 300 karakter olabilir. Şu an: ${value.length} karakter.`
        }
        return true
      },
    },
    {
      name: 'biography',
      type: 'richText',
      label: 'Biyografi',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          BlocksFeature({
            blocks: [QuoteBlock, ArchiveDocumentBlock, MapBlock, FootnoteBlock, TimelineCalloutBlock],
            inlineBlocks: [InlinePersonMentionBlock],
          }),
        ],
      }),
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
        description: 'Ad soyaddan otomatik oluşturulur. Özel URL için düzenleyebilirsiniz.',
      },
    },
    {
      name: 'role',
      type: 'select',
      label: 'Rol / Meslek',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Politikacı', value: 'politikaci' },
        { label: 'Askeri Komutan', value: 'askeri-komutan' },
        { label: 'Diplomat', value: 'diplomat' },
        { label: 'Entelektüel', value: 'entelektuel' },
        { label: 'Sanatçı', value: 'sanatci' },
        { label: 'Diğer', value: 'diger' },
      ],
    },
    {
      name: 'title',
      type: 'text',
      label: 'Unvan / Görev',
      admin: {
        position: 'sidebar',
        description: 'Örn: "Osmanlı Sadrazamı", "Millî Şef", "Başkomutan"',
      },
    },
    {
      name: 'birth_year',
      type: 'number',
      label: 'Doğum Yılı',
      admin: { position: 'sidebar' },
    },
    {
      name: 'death_year',
      type: 'number',
      label: 'Ölüm Yılı',
      admin: { position: 'sidebar' },
    },
    {
      name: 'portrait',
      type: 'upload',
      relationTo: 'media',
      label: 'Portre Fotoğrafı',
      admin: { position: 'sidebar' },
    },
  ],
}
