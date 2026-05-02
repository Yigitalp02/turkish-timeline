import type { Block } from 'payload'

export const MapBlock: Block = {
  slug: 'map-block',
  interfaceName: 'MapBlock',
  labels: {
    singular: 'Harita',
    plural: 'Haritalar',
  },
  fields: [
    {
      name: 'location_name',
      type: 'text',
      required: true,
      label: 'Konum Adı',
      admin: {
        description: 'Örn: "İzmir", "Çanakkale Cephesi", "Ankara — TBMM"',
      },
    },
    {
      name: 'map_image',
      type: 'upload',
      relationTo: 'media',
      label: 'Harita Görseli',
      admin: {
        description: 'Statik harita taraması veya açıklamalı görsel.',
      },
    },
    {
      name: 'coordinates',
      type: 'text',
      label: 'Koordinatlar',
      admin: {
        description: 'İsteğe bağlı. Örn: "38.4189, 27.1287" — ileride interaktif harita için kullanılabilir.',
      },
    },
    {
      name: 'legend',
      type: 'textarea',
      label: 'Açıklama / Lejant',
    },
  ],
}
