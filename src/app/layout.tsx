import type { Metadata } from 'next'
import './globals.css'
import LayoutWrapper from '@/components/LayoutWrapper'
import Providers from '@/components/Providers'
import DynamicStyling from '@/components/DynamicStyling'

export const metadata: Metadata = {
  title: "Peter Easton's Pub | St. John's, NL",
  description: "Peter Easton's Pub — your local destination for live music, karaoke, open mic nights, and great times in the heart of St. John's, Newfoundland.",
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Google Fonts preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <DynamicStyling />
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  )
}
