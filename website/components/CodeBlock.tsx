'use client'

import { useState } from 'react'

interface CodeBlockProps {
  code: string
  language?: string
  showCopy?: boolean
  title?: string
}

export function CodeBlock({ code, title, showCopy = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Simple syntax highlighting for curly commands
  const highlightCode = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Highlight different parts
      const highlighted = line
        // URLs
        .replace(
          /(https?:\/\/[^\s"']+)/g,
          '<span class="token-url">$1</span>'
        )
        // Flags like -X, -H, -d, --method, etc.
        .replace(
          /(\s|^)(-{1,2}[a-zA-Z][\w-]*)/g,
          '$1<span class="token-flag">$2</span>'
        )
        // Strings in quotes
        .replace(
          /"([^"]+)"/g,
          '<span class="token-string">"$1"</span>'
        )
        .replace(
          /'([^']+)'/g,
          "<span class=\"token-string\">'$1'</span>"
        )
        // Comments
        .replace(
          /(#.*)$/g,
          '<span class="token-comment">$1</span>'
        )
        // Numbers
        .replace(
          /\b(\d+)\b/g,
          '<span class="token-number">$1</span>'
        )
        // curly command
        .replace(
          /^(curly|\$)/g,
          '<span class="token-keyword">$1</span>'
        )

      return (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: highlighted }} />
          {i < text.split('\n').length - 1 && '\n'}
        </span>
      )
    })
  }

  return (
    <div className="code-block relative group">
      {title && (
        <div className="px-4 py-2 border-b border-[var(--border)] text-sm text-[var(--muted)]">
          {title}
        </div>
      )}
      <pre className="overflow-x-auto">
        <code>{highlightCode(code)}</code>
      </pre>
      {showCopy && (
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 px-2 py-1 text-xs bg-[var(--border)] hover:bg-[var(--muted)] rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      )}
    </div>
  )
}
