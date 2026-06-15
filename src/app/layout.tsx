import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Property Map Template',
  description: 'Reusable interactive property portfolio map template',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
