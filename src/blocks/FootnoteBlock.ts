import type { Block } from 'payload'

export const FootnoteBlock: Block = {
  slug: 'footnote-block',
  interfaceName: 'FootnoteBlock',
  labels: {
    singular: 'Dipnot',
    plural: 'Dipnotlar',
  },
  fields: [
    {
      name: 'footnote_id',
      type: 'text',
      required: true,
      label: 'Dipnot ID',
      admin: {
        description:
          'Belge içinde eşsiz bir tanımlayıcı. Örn: "fn-1", "fn-2". ' +
          'RichTextRenderer bu ID ile sıralı numara atar ve metnin altında kaynakça oluşturur.',
      },
    },
    {
      name: 'citation_text',
      type: 'textarea',
      required: true,
      label: 'Kaynak Metni',
      admin: {
        description: 'Tam atıf metni. Örn: "Zürcher, E. J. (2004). Turkey: A Modern History. London: I.B. Tauris."',
      },
    },
  ],
}
