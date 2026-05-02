/**
 * Recursively walks a Lexical JSON AST and extracts all text content as a
 * plain string. Used by:
 *   - The search plugin's beforeSync hook (Phase 3) for indexable text
 *   - The RichTextRenderer (Phase 9) for excerpts and meta descriptions
 */

type LexicalNode = {
  type: string
  text?: string
  children?: LexicalNode[]
  [key: string]: unknown
}

type LexicalRoot = {
  root: LexicalNode
  [key: string]: unknown
}

const extractFromNode = (node: LexicalNode): string => {
  // Leaf text node
  if (node.type === 'text' && typeof node.text === 'string') {
    return node.text
  }

  // Recursively extract from children
  if (Array.isArray(node.children)) {
    return node.children
      .map(extractFromNode)
      .filter(Boolean)
      .join(' ')
  }

  return ''
}

/**
 * Converts a Payload Lexical rich text JSON object to a plain text string.
 * Returns an empty string if the input is null, undefined, or malformed.
 */
export const lexicalToPlainText = (lexicalJSON: unknown): string => {
  if (!lexicalJSON || typeof lexicalJSON !== 'object') return ''

  const root = (lexicalJSON as LexicalRoot).root
  if (!root) return ''

  return extractFromNode(root)
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Truncates a plain text string to a given character limit, ending cleanly
 * at a word boundary. Appends '…' if truncated.
 */
export const truncate = (text: string, maxLength = 160): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, text.lastIndexOf(' ', maxLength)) + '…'
}
