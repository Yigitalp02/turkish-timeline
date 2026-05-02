import type { Block } from 'payload'

export const TimelineCalloutBlock: Block = {
  slug: 'timeline-callout-block',
  interfaceName: 'TimelineCalloutBlock',
  labels: {
    singular: 'Vurgu Kutusu',
    plural: 'Vurgu Kutuları',
  },
  fields: [
    {
      name: 'callout_type',
      type: 'select',
      required: true,
      label: 'Kutu Türü',
      options: [
        { label: 'Bilgi', value: 'bilgi' },
        { label: 'Uyarı', value: 'uyari' },
        { label: 'Kritik Tarih', value: 'kritik-tarih' },
      ],
      defaultValue: 'bilgi',
    },
    {
      name: 'text',
      type: 'textarea',
      required: true,
      label: 'İçerik',
    },
  ],
}
