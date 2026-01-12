import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'curly - HTTP requests made simple',
  description:
    'A modern CLI tool for making HTTP requests. Simpler than curl, with built-in load testing, profiles, and smart defaults.',
  keywords: ['curl', 'http', 'cli', 'api', 'rest', 'load testing'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
