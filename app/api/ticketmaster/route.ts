import { NextRequest, NextResponse } from 'next/server'
import type { TMEvent } from '@/lib/types'

const API_KEY = process.env.TICKETMASTER_API_KEY ?? 'aWpvxbqxgzbG5rQjYA9Yz7IfEmgJM7zf'
const ENDPOINT = 'https://app.ticketmaster.com/discovery/v2/events.json'

interface TMImage {
  ratio?: string
  width: number
  url: string
}

function pickImage(images: TMImage[] = []): string | null {
  if (images.length === 0) return null
  const wide = images
    .filter((i) => i.ratio === '16_9' && i.width >= 1024 && !i.url.endsWith('_SOURCE'))
    .sort((a, b) => a.width - b.width)
  if (wide[0]) return wide[0].url
  const sorted = [...images].sort((a, b) => b.width - a.width)
  return sorted.find((i) => !i.url.endsWith('_SOURCE'))?.url ?? sorted[0].url
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(e: any): TMEvent {
  const venue = e._embedded?.venues?.[0]
  const cls = e.classifications?.[0]
  const start = e.dates?.start
  const dateTime = start?.localDate
    ? `${start.localDate}T${(start.localTime ?? '19:00:00').slice(0, 5)}`
    : null
  const lat = venue?.location?.latitude ? parseFloat(venue.location.latitude) : null
  const lng = venue?.location?.longitude ? parseFloat(venue.location.longitude) : null
  return {
    id: e.id,
    name: e.name,
    image: pickImage(e.images),
    dateTime,
    venue: venue?.name ?? '',
    city: venue?.city?.name ?? '',
    state: venue?.state?.stateCode ?? venue?.state?.name ?? '',
    countryCode: venue?.country?.countryCode ?? '',
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    genre: cls?.genre?.name && cls.genre.name !== 'Undefined' ? cls.genre.name : (cls?.segment?.name ?? 'Event'),
    segment: cls?.segment?.name ?? '',
    onSaleStart: e.sales?.public?.startDateTime ?? null,
    url: e.url ?? '',
    promoter: e.promoter?.name ?? e.promoters?.[0]?.name ?? '',
    venueLocation: [venue?.name, venue?.city?.name, venue?.state?.stateCode ?? venue?.state?.name, venue?.country?.countryCode].filter(Boolean).join(', '),
  }
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  const params = new URLSearchParams({
    apikey: API_KEY,
    size: sp.get('size') ?? '50',
    sort: sp.get('sort') ?? 'relevance,desc',
  })
  for (const key of ['city', 'countryCode', 'keyword']) {
    const value = sp.get(key)
    if (value) params.set(key, value)
  }

  try {
    // Ticketmaster responses can exceed Next.js' 2 MB data-cache limit.
    // The client already caches requests with SWR, so avoid server-side caching here.
    const res = await fetch(`${ENDPOINT}?${params.toString()}`, { cache: 'no-store' })
    if (!res.ok) {
      return NextResponse.json({ events: [], error: `Ticketmaster responded with ${res.status}` }, { status: 200 })
    }
    const json = await res.json()
    const events: TMEvent[] = (json._embedded?.events ?? []).map(normalize)
    return NextResponse.json({ events })
  } catch {
    return NextResponse.json({ events: [], error: 'Unable to reach Ticketmaster' }, { status: 200 })
  }
}
