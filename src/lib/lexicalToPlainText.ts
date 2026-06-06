/* eslint-disable @typescript-eslint/no-explicit-any */

function extractNodeText(node: any): string {
  if (!node) return ''

  if (node.type === 'text') {
    return node.text ?? ''
  }

  if (node.type === 'linebreak') {
    return '\n'
  }

  if (node.children?.length) {
    const parts = node.children.map((child: any) => extractNodeText(child))
    const blockTypes = ['paragraph', 'heading', 'listitem', 'quote']

    if (blockTypes.includes(node.type)) {
      return parts.join('')
    }

    return parts.join('')
  }

  return ''
}

function blockText(node: any): string {
  if (!node) return ''

  if (node.type === 'list') {
    return (node.children ?? [])
      .map((item: any) => extractNodeText(item))
      .filter(Boolean)
      .join('\n')
  }

  return extractNodeText(node)
}

/**
 * Converts Lexical richText JSON to plain text with paragraph breaks preserved.
 */
export function lexicalToPlainText(content: unknown): string {
  if (typeof content === 'string') {
    const trimmed = content.trim()
    if (!trimmed.startsWith('{')) {
      return content
    }

    try {
      content = JSON.parse(trimmed) as unknown
    } catch {
      return trimmed
    }
  }

  if (!content || typeof content !== 'object') {
    return ''
  }

  const root = (content as { root?: { children?: any[] } }).root
  if (!root?.children?.length) {
    return ''
  }

  return root.children
    .map((node) => blockText(node))
    .filter(Boolean)
    .join('\n\n')
}
