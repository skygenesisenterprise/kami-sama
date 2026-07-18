import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Sora } from 'next/font/google'
import "@/styles/globals.css"

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Kami-Sama — Anime Streaming & Community',
  description:
    'Discover, track, and watch anime on Kami-Sama. A next-generation, community-driven, open-source anime and Japanese culture platform.',
  keywords: ['anime', 'streaming', 'Japanese culture', 'community', 'Kami-Sama'],
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#1a1418',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
