'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { City, Seat, TMEvent, TabId, Ticket, TicketView } from './types'
import { DEFAULT_CITY, DEFAULT_RECENT } from './locations'
import { generateOrderNumber, uid } from './format'

const OLIVIA_POSTER =
  'https://s1.ticketm.net/dam/a/4e1/ca96dd03-8def-46ae-b6d3-9441e992c4e1_TABLET_LANDSCAPE_3_2.jpg'
const DEF_LEPPARD_POSTER =
  'https://s1.ticketm.net/dam/a/861/d7e41d08-4127-4710-b298-e566b30ac861_RETINA_LANDSCAPE_16_9.jpg'
const HOME_CITY_STORAGE_KEY = 'ticketmaster_home_city'
const LEGACY_ORDER_NUMBER_PATTERN = /^(?:\d{2}-\d{5}\/[A-Z0-9]{2,3}|\d{5}\/[A-Z]{3})$/

function migrateLegacyOrderNumbers(tickets: Ticket[]) {
  const reserved = new Set(tickets.map((ticket) => ticket.orderNumber))
  const used = new Set<string>()

  return tickets.map((ticket) => {
    const needsNewNumber = LEGACY_ORDER_NUMBER_PATTERN.test(ticket.orderNumber) || used.has(ticket.orderNumber)
    const orderNumber = needsNewNumber ? generateOrderNumber(reserved) : ticket.orderNumber
    reserved.add(orderNumber)
    used.add(orderNumber)
    return orderNumber === ticket.orderNumber ? ticket : { ...ticket, orderNumber }
  })
}

const SEED_TICKETS: Ticket[] = [
  {
    id: 'seed-xfinity',
    visible: true,
    artist: 'Olivia Rodrigo: The Unraveled Tour',
    venue: 'Xfinity Mobile Arena',
    posterUrl: OLIVIA_POSTER,
    dateTime: '2026-11-07T19:00',
    orderNumber: '#4-62727/IR6',
    quantity: 2,
    purchaseType: 'General Sale',
    entryInfo: 'Reserved Seating',
    presenter: 'LIVE NATION PRESENTS',
    policyNotice: 'NO BAGS PERMITTED',
    venueLocation: 'Philadelphia PA US',
    purchaseDate: '2026-10-18T00:00',
    ticketPrice: 89.5,
    serviceFee: 26.25,
    lat: 39.9012,
    lng: -75.172,
    seats: [
      { id: 'seed-xfinity-1', section: '112', row: '14', seat: '3', transferStatus: '' },
      { id: 'seed-xfinity-2', section: '112', row: '14', seat: '4', transferStatus: '' },
    ],
  },
  {
    id: 'seed-intuit',
    visible: true,
    artist: 'Olivia Rodrigo: The Unraveled Tour',
    venue: 'Intuit Dome',
    posterUrl: OLIVIA_POSTER,
    dateTime: '2027-01-12T19:00',
    orderNumber: '#8-19042/CM9',
    quantity: 3,
    purchaseType: 'American Express® Presale',
    lat: 33.9958,
    lng: -118.3419,
    seats: [
      { id: 'seed-intuit-1', section: 'Xx', row: '5', seat: '5', transferStatus: 'Transfer Accepted: TOM B' },
      { id: 'seed-intuit-2', section: 'Xx', row: '5', seat: '6', transferStatus: 'Transfer Accepted: TOM B' },
      { id: 'seed-intuit-3', section: 'Xx', row: '5', seat: '7', transferStatus: '' },
    ],
  },
  {
    id: 'seed-scotiabank',
    visible: true,
    artist: 'Def Leppard',
    venue: 'Scotiabank Arena',
    posterUrl: DEF_LEPPARD_POSTER,
    dateTime: '2027-03-09T19:00',
    orderNumber: '#2-71563/TP4',
    quantity: 3,
    purchaseType: 'General Sale',
    lat: 43.6435,
    lng: -79.3791,
    seats: [
      { id: 'seed-scotia-1', section: '224', row: '2', seat: '10', transferStatus: '' },
      { id: 'seed-scotia-2', section: '224', row: '2', seat: '11', transferStatus: '' },
      { id: 'seed-scotia-3', section: '224', row: '2', seat: '12', transferStatus: '' },
    ],
  },
]

interface Profile {
  name: string
  email: string
  initials: string
  pastEventsToShow: number
}

interface AppState {
  tab: TabId
  setTab: (tab: TabId) => void

  location: City
  recentLocations: City[]
  locationConfirmed: boolean
  locationSheetOpen: boolean
  setLocationSheetOpen: (open: boolean) => void
  selectLocation: (city: City) => void

  tickets: Ticket[]
  addTicket: () => string
  updateTicket: (id: string, patch: Partial<Ticket>) => void
  moveTicket: (id: string, direction: 'up' | 'down') => void
  deleteTicket: (id: string) => void

  ticketView: { view: TicketView; id: string | null }
  openDetails: (id: string) => void
  openSafetix: (id: string) => void
  backToLanding: () => void

  watchlist: TMEvent[]
  toggleWatchlist: (event: TMEvent) => void
  favorites: TMEvent[]
  toggleFavorite: (event: TMEvent) => void
  browsed: TMEvent[]
  browse: (event: TMEvent) => void

  profile: Profile
  setProfile: (patch: Partial<Profile>) => void
  accountPage: 'main' | 'edit'
  setAccountPage: (page: 'main' | 'edit') => void
}

const AppContext = createContext<AppState | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return now
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTabState] = useState<TabId>('home')
  const [location, setLocation] = useState<City>(DEFAULT_CITY)
  const [recentLocations, setRecentLocations] = useState<City[]>(DEFAULT_RECENT)
  const [locationConfirmed, setLocationConfirmed] = useState(false)
  const [locationSheetOpen, setLocationSheetOpen] = useState(false)

  const [tickets, setTickets] = useState<Ticket[]>(SEED_TICKETS)
  const [ticketView, setTicketView] = useState<{ view: TicketView; id: string | null }>({
    view: 'landing',
    id: null,
  })

  const [watchlist, setWatchlist] = useState<TMEvent[]>([])
  const [favorites, setFavorites] = useState<TMEvent[]>([])
  const [browsed, setBrowsed] = useState<TMEvent[]>([])

  const [profile, setProfileState] = useState<Profile>({
    name: 'Lonnie Brew',
    email: 'galtonalex88@gmail.com',
    initials: 'LB',
    pastEventsToShow: 10,
  })
  const [accountPage, setAccountPage] = useState<'main' | 'edit'>('main')
  const [storageReady, setStorageReady] = useState(false)

  useEffect(() => {
    try {
      const savedCity = localStorage.getItem(HOME_CITY_STORAGE_KEY)
      const saved = localStorage.getItem('ticketmaster-app-state')
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<{ tickets: Ticket[]; profile: Profile; location: City; recentLocations: City[] }>
        if (Array.isArray(parsed.tickets)) setTickets(migrateLegacyOrderNumbers(parsed.tickets))
        if (parsed.profile) setProfileState((prev) => ({ ...prev, ...parsed.profile }))
        if (parsed.location) setLocation(parsed.location)
        if (Array.isArray(parsed.recentLocations)) setRecentLocations(parsed.recentLocations)
      }
      if (savedCity) {
        const city = JSON.parse(savedCity) as City
        if (city?.name && city?.tmCity && city?.tmCountry) {
          setLocation(city)
          setLocationConfirmed(true)
        }
      }
    } catch {
      // Ignore malformed device data and keep safe defaults.
    } finally {
      setStorageReady(true)
    }
  }, [])

  useEffect(() => {
    if (!storageReady) return
    localStorage.setItem('ticketmaster-app-state', JSON.stringify({ tickets, profile, location, recentLocations }))
    localStorage.setItem(HOME_CITY_STORAGE_KEY, JSON.stringify(location))
  }, [tickets, profile, location, recentLocations, storageReady])

  const setTab = useCallback((next: TabId) => {
    setTabState(next)
    if (next === 'tickets') setTicketView({ view: 'landing', id: null })
    if (next === 'account') setAccountPage('main')
  }, [])

  const selectLocation = useCallback((city: City) => {
    setLocation(city)
    setLocationConfirmed(true)
    try {
      localStorage.setItem(HOME_CITY_STORAGE_KEY, JSON.stringify(city))
    } catch {
      // Keep the in-memory selection if device storage is unavailable.
    }
    setRecentLocations((prev) => [city, ...prev.filter((c) => c.name !== city.name)].slice(0, 3))
    setLocationSheetOpen(false)
  }, [])

  const addTicket = useCallback(() => {
    const id = uid()
    const next: Ticket = {
      id,
      visible: true,
      artist: 'New Event',
      venue: 'Venue Name',
      posterUrl: OLIVIA_POSTER,
      dateTime: '2027-06-01T19:00',
      orderNumber: generateOrderNumber(tickets.map((ticket) => ticket.orderNumber)),
      quantity: 1,
      purchaseType: 'General Sale',
      purchaseDate: '2027-05-25T14:41',
      entryInfo: 'Upper Level',
      presenter: '',
      policyNotice: 'NO BAGS PERMITTED',
      venueLocation: '',
      ticketPrice: 89.5,
      serviceFee: 26.25,
      currency: 'USD',
      barcodeMode: 'countdown',
      barcodeCountdownHours: 72,
      barcodeCountdownMinutes: 0,
      barcodeCountdownSeconds: 0,
      lat: 40.7505,
      lng: -73.9934,
      seats: [{ id: uid(), section: '101', row: '1', seat: '1', transferStatus: '' }],
    }
    setTickets((prev) => [next, ...prev])
    return id
  }, [tickets])

  const updateTicket = useCallback((id: string, patch: Partial<Ticket>) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }, [])

  const moveTicket = useCallback((id: string, direction: 'up' | 'down') => {
    setTickets((prev) => {
      const index = prev.findIndex((ticket) => ticket.id === id)
      const target = direction === 'up' ? index - 1 : index + 1
      if (index < 0 || target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }, [])

  const deleteTicket = useCallback((id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id))
    setTicketView((prev) => (prev.id === id ? { view: 'landing', id: null } : prev))
  }, [profile.email])

  const openDetails = useCallback((id: string) => setTicketView({ view: 'details', id }), [])
  const openSafetix = useCallback((id: string) => setTicketView({ view: 'safetix', id }), [])
  const backToLanding = useCallback(() => setTicketView({ view: 'landing', id: null }), [])

  const toggleIn = (setter: React.Dispatch<React.SetStateAction<TMEvent[]>>) => (event: TMEvent) =>
    setter((prev) =>
      prev.some((e) => e.id === event.id) ? prev.filter((e) => e.id !== event.id) : [event, ...prev],
    )

  const toggleWatchlist = useMemo(() => toggleIn(setWatchlist), [])
  const toggleFavorite = useMemo(() => toggleIn(setFavorites), [])

  const browse = useCallback((event: TMEvent) => {
    setBrowsed((prev) => [event, ...prev.filter((e) => e.id !== event.id)].slice(0, 12))
  }, [])

  const setProfile = useCallback((patch: Partial<Profile>) => {
    setProfileState((prev) => ({ ...prev, ...patch }))
  }, [])

  const value: AppState = {
    tab,
    setTab,
    location,
    recentLocations,
    locationConfirmed,
    locationSheetOpen,
    setLocationSheetOpen,
    selectLocation,
    tickets,
    addTicket,
    updateTicket,
    moveTicket,
    deleteTicket,
    ticketView,
    openDetails,
    openSafetix,
    backToLanding,
    watchlist,
    toggleWatchlist,
    favorites,
    toggleFavorite,
    browsed,
    browse,
    profile,
    setProfile,
    accountPage,
    setAccountPage,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function resizeSeats(seats: Seat[], quantity: number): Seat[] {
  if (quantity <= seats.length) return seats.slice(0, Math.max(0, quantity))
  const next = [...seats]
  while (next.length < quantity) {
    const last = next[next.length - 1]
    const lastSeatNum = last ? parseInt(last.seat, 10) : 0
    next.push({
      id: uid(),
      section: last?.section ?? '101',
      row: last?.row ?? '1',
      seat: Number.isFinite(lastSeatNum) ? String(lastSeatNum + 1) : '1',
      transferStatus: '',
    })
  }
  return next
}
