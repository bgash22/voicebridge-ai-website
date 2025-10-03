import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Voice Bridge - Next-Gen Voice AI Solutions',
  description: 'Transform your customer interactions with intelligent voice AI. Real-time, multilingual, and always available.',
  keywords: ['AI', 'Voice AI', 'Call Center', 'Automation', 'Speech Recognition'],
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
