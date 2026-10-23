import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ticketmaster',
    short_name: 'Ticketmaster',
    description: 'Discover live events and manage your tickets.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    icons: [
      {
        src: '/app-icon.jpeg',
        sizes: '341x341',
        type: 'image/jpeg',
        purpose: 'any maskable',
      },
    ],
  }
}
