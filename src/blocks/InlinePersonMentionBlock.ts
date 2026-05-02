import type { Block } from 'payload'

/**
 * InlinePersonMention — implemented as a Payload v3 native INLINE block.
 *
 * Used inside BlocksFeature({ inlineBlocks: [InlinePersonMentionBlock] }).
 * The admin clicks "Insert inline block → Kişi Bahsi", selects a person from
 * the kisiler relationship picker, and the node is inserted inline within the
 * paragraph.
 *
 * Serialized output in Lexical JSON:
 * {
 *   "type": "inlineBlock",
 *   "fields": {
 *     "id": "auto-generated",
 *     "blockType": "inline-person-mention",
 *     "person": { "id": 1, "full_name": "Mustafa Kemal Atatürk", ... }
 *   },
 *   "version": 1
 * }
 *
 * In the RichTextRenderer (Phase 9), detect with:
 *   node.type === 'inlineBlock' && node.fields?.blockType === 'inline-person-mention'
 * The personId is node.fields.person.id (populated at depth >= 1).
 */
export const InlinePersonMentionBlock: Block = {
  slug: 'inline-person-mention',
  interfaceName: 'InlinePersonMentionBlock',
  labels: {
    singular: 'Kişi Bahsi',
    plural: 'Kişi Bahisleri',
  },
  fields: [
    {
      name: 'person',
      type: 'relationship',
      relationTo: 'kisiler',
      required: true,
      label: 'Kişi',
      admin: {
        description: 'Paragraf içinde bahsedilen tarihsel figürü seçin.',
      },
    },
  ],
}
