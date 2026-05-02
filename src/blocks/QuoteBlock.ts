import type { Block } from 'payload'

export const QuoteBlock: Block = {
  slug: 'quote-block',
  interfaceName: 'QuoteBlock',
  labels: {
    singular: 'Alıntı',
    plural: 'Alıntılar',
  },
  fields: [
    {
      name: 'quote_text',
      type: 'textarea',
      required: true,
      label: 'Alıntı Metni',
    },
    {
      name: 'person',
      type: 'relationship',
      relationTo: 'kisiler',
      label: 'Kaynak Kişi',
      admin: {
        description: 'Alıntının sahibi olan tarihsel figür (opsiyonel).',
      },
    },
    {
      name: 'context_date',
      type: 'text',
      label: 'Bağlam / Tarih',
      admin: {
        description: 'Örn: "1919, İzmir İşgali sonrası" veya "Kasım 1922, TBMM"',
      },
    },
  ],
}
