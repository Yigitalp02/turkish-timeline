import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const ArchiveDocumentBlock: Block = {
  slug: 'archive-document-block',
  interfaceName: 'ArchiveDocumentBlock',
  labels: {
    singular: 'Arşiv Belgesi',
    plural: 'Arşiv Belgeleri',
  },
  fields: [
    {
      name: 'document_image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Belge Görseli',
      admin: {
        description: 'Taranmış orijinal belgenin görüntüsü.',
      },
    },
    {
      name: 'transcription',
      type: 'richText',
      label: 'Transkripsiyon',
      // Use the default editor (no custom blocks) to avoid nesting complexity.
      editor: lexicalEditor(),
      admin: {
        description: 'Belgenin Türkçe veya Osmanlıca transkripsiyonu.',
      },
    },
    {
      name: 'source_archive',
      type: 'text',
      label: 'Kaynak Arşiv',
      admin: {
        description: 'Örn: "Başbakanlık Osmanlı Arşivi, HR.SYS 2626/1"',
      },
    },
  ],
}
