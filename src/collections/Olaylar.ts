import type { CollectionConfig, Access } from 'payload'
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical'
import { populateSlug, populateDisplayYear } from '../lib/slugify'
import { QuoteBlock } from '../blocks/QuoteBlock'
import { ArchiveDocumentBlock } from '../blocks/ArchiveDocumentBlock'
import { MapBlock } from '../blocks/MapBlock'
import { FootnoteBlock } from '../blocks/FootnoteBlock'
import { TimelineCalloutBlock } from '../blocks/TimelineCalloutBlock'
import { InlinePersonMentionBlock } from '../blocks/InlinePersonMentionBlock'

const isLoggedIn: Access = ({ req: { user } }) => Boolean(user)

export const Olaylar: CollectionConfig = {
  slug: 'olaylar',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'display_year', 'era', '_status'],
    description: 'Zaman tünelindeki bireysel olaylar — her olay bir döneme (Dönem) bağlıdır.',
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
    beforeChange: [populateSlug('title'), populateDisplayYear],
  },
  fields: [
    // ── Main column ──────────────────────────────────────────────────────────
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Olay Başlığı',
    },
    {
      name: 'content',
      type: 'richText',
      label: 'İçerik',
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
    {
      name: 'participants',
      type: 'relationship',
      relationTo: 'kisiler',
      hasMany: true,
      label: 'Katılımcılar',
      admin: {
        description: 'Bu olaya katılan veya olayda yer alan kişiler.',
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
        description: 'Başlıktan otomatik oluşturulur.',
      },
    },
    {
      name: 'era',
      type: 'relationship',
      relationTo: 'donemler',
      hasMany: false,
      required: true,
      label: 'Dönem',
      admin: {
        position: 'sidebar',
        description: 'Bu olayın ait olduğu tarihsel dönem.',
      },
    },
    {
      name: 'exact_date',
      type: 'date',
      required: true,
      label: 'Tam Tarih',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'd MMMM yyyy',
        },
        description: 'Kronolojik sıralama için kullanılır.',
      },
    },
    {
      name: 'display_year',
      type: 'number',
      label: 'Gösterim Yılı',
      admin: {
        position: 'sidebar',
        description: 'Tam tarihten otomatik doldurulur. Sticky başlık ve radar kenar çubuğu için kullanılır.',
      },
    },
    {
      name: 'sort_order',
      type: 'number',
      label: 'Sıralama',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Aynı tarihteki olayların sıralaması için. Küçük sayı önce gelir.',
      },
    },
    {
      name: 'tags',
      type: 'select',
      hasMany: true,
      label: 'Etiketler',
      admin: {
        position: 'sidebar',
      },
      options: [
        { label: 'Askeri', value: 'askeri' },
        { label: 'Diplomatik', value: 'diplomatik' },
        { label: 'Kültürel', value: 'kulturel' },
        { label: 'Ekonomik', value: 'ekonomik' },
        { label: 'Siyasi', value: 'siyasi' },
        { label: 'Toplumsal', value: 'toplumsal' },
      ],
    },
  ],
}
