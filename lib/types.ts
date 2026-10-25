export type TabId = 'home' | 'watchlist' | 'tickets' | 'account'

export interface TMEvent {
  id: string
  name: string
  image: string | null
  dateTime: string | null
  venue: string
  city: string
  state: string
  countryCode: string
  lat: number | null
  lng: number | null
  genre: string
  segment: string
  onSaleStart: string | null
  url: string
  promoter?: string
  venueLocation?: string
}

export interface Seat {
  id: string
  section: string
  row: string
  seat: string
  transferStatus: string
}

export interface Ticket {
  id: string
  visible: boolean
  artist: string
  venue: string
  posterUrl: string
  /** Local date-time, format YYYY-MM-DDTHH:mm */
  dateTime: string
  orderNumber: string
  quantity: number
  purchaseType: string
  entryInfo?: string
  presenter?: string
  policyNotice?: string
  venueLocation?: string
  ticketTypeOverride?: string
  purchaseDate?: string
  ticketPrice?: number
  serviceFee?: number
  seats: Seat[]
  lat: number
  lng: number
}

export interface City {
  name: string
  /** Secondary label shown in lists, e.g. "Ontario, CA" */
  label: string
  /** Lowercase ISO code used for the flag SVG */
  flag: string
  /** Country code passed to the Ticketmaster Discovery API */
  tmCountry: string
  tmCity: string
  /** Text appended to "Trending In" */
  trendingLabel: string
  lat: number
  lng: number
}

export type TicketView = 'landing' | 'details' | 'safetix'
