'use client'

import { useState } from 'react'

interface CodeBlockProps {
  code: string
  language?: string
  showCopy?: boolean
  title?: string
}

type TokenType = 'keyword' | 'flag' | 'string' | 'url' | 'number' | 'comment' | 'operator' | 'text'

interface Token {
  type: TokenType
  value: string
}

// Tokenize curly commands properly without regex interference
function tokenize(line: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < line.length) {
    // Skip whitespace
    if (/\s/.test(line[i])) {
      let ws = ''
      while (i < line.length && /\s/.test(line[i])) {
        ws += line[i]
        i++
      }
      tokens.push({ type: 'text', value: ws })
      continue
    }

    // Comments (# to end of line)
    if (line[i] === '#') {
      tokens.push({ type: 'comment', value: line.slice(i) })
      break
    }

    // Double-quoted strings
    if (line[i] === '"') {
      let str = '"'
      i++
      while (i < line.length && line[i] !== '"') {
        if (line[i] === '\\' && i + 1 < line.length) {
          str += line[i] + line[i + 1]
          i += 2
        } else {
          str += line[i]
          i++
        }
      }
      if (i < line.length) {
        str += '"'
        i++
      }
      tokens.push({ type: 'string', value: str })
      continue
    }

    // Single-quoted strings
    if (line[i] === "'") {
      let str = "'"
      i++
      while (i < line.length && line[i] !== "'") {
        if (line[i] === '\\' && i + 1 < line.length) {
          str += line[i] + line[i + 1]
          i += 2
        } else {
          str += line[i]
          i++
        }
      }
      if (i < line.length) {
        str += "'"
        i++
      }
      tokens.push({ type: 'string', value: str })
      continue
    }

    // URLs (http:// or https://)
    if (line.slice(i, i + 7) === 'http://' || line.slice(i, i + 8) === 'https://') {
      let url = ''
      while (i < line.length && !/\s/.test(line[i])) {
        url += line[i]
        i++
      }
      tokens.push({ type: 'url', value: url })
      continue
    }

    // Flags (--flag or -f)
    if (line[i] === '-' && i + 1 < line.length && /[a-zA-Z-]/.test(line[i + 1])) {
      let flag = '-'
      i++
      while (i < line.length && /[a-zA-Z0-9_-]/.test(line[i])) {
        flag += line[i]
        i++
      }
      tokens.push({ type: 'flag', value: flag })
      continue
    }

    // Numbers
    if (/\d/.test(line[i])) {
      let num = ''
      while (i < line.length && /[\d.]/.test(line[i])) {
        num += line[i]
        i++
      }
      tokens.push({ type: 'number', value: num })
      continue
    }

    // Operators and special chars
    if (/[|&;\\=<>]/.test(line[i])) {
      let op = line[i]
      i++
      // Handle || && etc
      if (i < line.length && /[|&]/.test(line[i]) && line[i] === line[i - 1]) {
        op += line[i]
        i++
      }
      tokens.push({ type: 'operator', value: op })
      continue
    }

    // Words (including curly, $, etc)
    let word = ''
    while (i < line.length && !/[\s"'|&;\\=<>]/.test(line[i])) {
      word += line[i]
      i++
    }

    if (word === 'curly' || word === '$' || word === 'curl' || word === 'echo') {
      tokens.push({ type: 'keyword', value: word })
    } else {
      tokens.push({ type: 'text', value: word })
    }
  }

  return tokens
}

const tokenColors: Record<TokenType, string> = {
  keyword: 'text-indigo-400',
  flag: 'text-amber-400',
  string: 'text-emerald-400',
  url: 'text-sky-400',
  number: 'text-pink-400',
  comment: 'text-gray-500',
  operator: 'text-gray-400',
  text: 'text-gray-200',
}

export function CodeBlock({ code, title, showCopy = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderLine = (line: string, lineIndex: number) => {
    const tokens = tokenize(line)
    return (
      <span key={lineIndex}>
        {tokens.map((token, i) => (
          <span key={i} className={tokenColors[token.type]}>
            {token.value}
          </span>
        ))}
        {lineIndex < code.split('\n').length - 1 && '\n'}
      </span>
    )
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
      {title && (
        <div className="border-b border-neutral-800 bg-neutral-900/50 px-4 py-2 text-xs font-medium text-neutral-400">
          {title}
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className="font-mono">{code.split('\n').map((line, i) => renderLine(line, i))}</code>
      </pre>
      {showCopy && (
        <button
          onClick={handleCopy}
          className="absolute right-2 top-2 rounded-md bg-neutral-800 px-2.5 py-1.5 text-xs font-medium text-neutral-400 opacity-0 transition-all hover:bg-neutral-700 hover:text-neutral-200 group-hover:opacity-100"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      )}
    </div>
  )
}
