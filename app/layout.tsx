import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ticketmaster – My Events, Watchlist & SafeTix',
  description:
    'Mobile ticketing experience: discover live events, manage your tickets, view SafeTix barcodes, and transfer seats.',
  generator: 'v0.app',
  icons: {
    icon: '/app-icon.jpeg',
    apple: '/app-icon.jpeg',
  },
  appleWebApp: {
    capable: true,
    title: 'Ticketmaster',
    statusBarStyle: 'black-translucent',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
