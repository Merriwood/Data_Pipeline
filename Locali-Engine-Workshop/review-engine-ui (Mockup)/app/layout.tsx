import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Review Engine Dashboard',
  description: 'Enterprise Review Analytics Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
