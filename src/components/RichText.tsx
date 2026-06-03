/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'

interface RichTextProps {
  content: {
    root: {
      children: any[]
    }
  }
}

export function RichText({ content }: RichTextProps) {
  if (!content || !content.root || !content.root.children) {
    return null
  }

  const renderNode = (node: any, index: number): React.ReactNode => {
    if (!node) return null

    // Text node
    if (node.type === 'text') {
      let element = <span key={index}>{node.text}</span>

      // Handle simple formatting masks (bold, italic, underline)
      // Lexical uses bits: 1 = bold, 2 = italic, 4 = underline
      if (node.format & 1) {
        element = <strong key={index} className="font-semibold text-white">{element}</strong>
      }
      if (node.format & 2) {
        element = <em key={index} className="italic">{element}</em>
      }
      return element
    }

    // Children rendering helper
    const renderChildren = () => {
      if (!node.children) return null
      return node.children.map((child: any, childIdx: number) => renderNode(child, childIdx))
    }

    // Block elements
    switch (node.type) {
      case 'paragraph':
        return (
          <p key={index} className="text-sm sm:text-base text-gray-400 leading-relaxed mb-4">
            {renderChildren()}
          </p>
        )
      case 'heading':
        const Tag = node.tag || 'h2'
        const headingClasses = {
          h1: 'text-3xl sm:text-4xl font-serif font-bold text-white tracking-wide mt-8 mb-4',
          h2: 'text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide mt-6 mb-3',
          h3: 'text-xl sm:text-2xl font-serif font-bold text-white tracking-wide mt-4 mb-2',
        }[Tag as 'h1' | 'h2' | 'h3'] || 'text-lg font-bold text-white mt-4 mb-2'

        return (
          <Tag key={index} className={headingClasses}>
            {renderChildren()}
          </Tag>
        )
      case 'list':
        const ListTag = node.tag === 'ol' ? 'ol' : 'ul'
        const listClass = ListTag === 'ol' ? 'list-decimal' : 'list-disc'
        return (
          <ListTag key={index} className={`pl-6 my-4 space-y-2 text-gray-400 ${listClass}`}>
            {renderChildren()}
          </ListTag>
        )
      case 'listitem':
        return <li key={index} className="text-sm sm:text-base">{renderChildren()}</li>
      default:
        // Fallback for unhandled wrappers
        if (node.children) {
          return <div key={index}>{renderChildren()}</div>
        }
        return null
    }
  }

  return (
    <div className="prose prose-invert max-w-none">
      {content.root.children.map((node, index) => renderNode(node, index))}
    </div>
  )
}
