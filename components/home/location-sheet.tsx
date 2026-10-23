'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { MapPin, Navigation, Search } from 'lucide-react'
import { useApp } from '@/lib/store'
import { POPULAR_CITIES, nearestCity } from '@/lib/locations'
import type { City, TMEvent } from '@/lib/types'

const fetchCityEvents = async (url: string): Promise<{ events: TMEvent[] }> => {
  try {
    const response = await fetch(url)
    if (!response.ok) return { events: [] }
    const payload = await response.json()
    return { events: Array.isArray(payload?.events) ? payload.events : [] }
  } catch {
    return { events: [] }
  }
}
import { FlagBadge } from '../icons'

function CityRow({ city, onSelect }: { city: City; onSelect: (c: City) => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(city)}
        className="flex w-full items-center gap-4 px-5 py-3.5 text-left"
      >
        <FlagBadge code={city.flag} size={30} />
        <span className="min-w-0 flex-1 truncate text-lg font-extrabold">{city.name}</span>
        <span className="shrink-0 text-base text-white/70">{city.label}</span>
      </button>
    </li>
  )
}

export function LocationSheet() {
  const { locationSheetOpen, setLocationSheetOpen, selectLocation, recentLocations } = useApp()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 350)
    return () => clearTimeout(timer)
  }, [query])

  const { data: cityData, isLoading: cityLoading } = useSWR(
    debouncedQuery.length >= 2 ? `/api/ticketmaster?city=${encodeURIComponent(debouncedQuery)}&size=30` : null,
    fetchCityEvents,
    { revalidateOnFocus: false },
  )

  const q = query.trim().toLowerCase()
  const liveCities: City[] = Array.from(new Map((cityData?.events ?? []).map((event) => [event.city.toLowerCase(), {
    name: event.city,
    label: [event.state, event.countryCode].filter(Boolean).join(', '),
    flag: event.countryCode.toLowerCase() || 'us',
    tmCountry: event.countryCode,
    tmCity: event.city,
    trendingLabel: event.city,
    lat: event.lat ?? 0,
    lng: event.lng ?? 0,
  }])).values())
  const results = q ? (liveCities.length ? liveCities : POPULAR_CITIES.filter((c) => `${c.name} ${c.label}`.toLowerCase().includes(q))) : []

  const close = () => {
    setLocationSheetOpen(false)
    setQuery('')
  }

  const select = (city: City) => {
    selectLocation(city)
    setQuery('')
  }

  const locate = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => select(nearestCity(pos.coords.latitude, pos.coords.longitude)),
      () => undefined,
      { timeout: 10000, maximumAge: 300000 },
    )
  }

  return (
    <>
      <div
        aria-hidden="true"
        onClick={close}
        className={`absolute inset-0 z-40 bg-black/60 transition-opacity duration-300 ${
          locationSheetOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Change Location"
        aria-hidden={!locationSheetOpen}
        className={`absolute inset-x-0 bottom-0 z-50 flex h-[88%] flex-col rounded-t-[28px] bg-[#222] transition-transform duration-300 ease-out ${
          locationSheetOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex shrink-0 justify-center pt-3">
          <span className="h-1.5 w-[84px] rounded-full bg-white/30" />
        </div>
        <header className="flex shrink-0 items-center justify-center gap-3 border-b border-white/10 pb-6 pt-8">
          <MapPin size={22} className="fill-white" aria-hidden="true" />
          <h2 className="text-xl font-extrabold">Change Location</h2>
        </header>

        <div className="mx-3 mt-6 flex h-[68px] shrink-0 items-center gap-3 rounded-full bg-[#111] pl-3 pr-3">
          <span className="flex size-[56px] shrink-0 items-center justify-center rounded-full border border-white/30">
            <Search size={26} aria-hidden="true" />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for Cities"
            aria-label="Search for Cities"
            className="min-w-0 flex-1 bg-transparent text-xl font-extrabold text-white outline-none placeholder:text-white [&::-webkit-search-cancel-button]:appearance-none"
          />
          <button
            type="button"
            onClick={locate}
            aria-label="Use my current location"
            className="flex size-[56px] shrink-0 items-center justify-center rounded-full bg-tm-teal text-[#111]"
          >
            <Navigation size={24} className="fill-[#111]" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pb-10">
          {q ? (
            cityLoading ? <p className="px-5 py-8 text-center text-white/60">Searching Ticketmaster…</p> : results.length > 0 ? (
              <ul>
                {results.map((c) => (
                  <CityRow key={c.name} city={c} onSelect={select} />
                ))}
              </ul>
            ) : (
              <p className="px-5 py-8 text-center text-white/60">No results for “{query}”.</p>
            )
          ) : (
            <>
              <h3 className="px-5 pb-1 pt-4 text-xl font-extrabold">Recent Locations</h3>
              <ul>
                {recentLocations.map((c) => (
                  <CityRow key={`recent-${c.name}`} city={c} onSelect={select} />
                ))}
              </ul>
              <h3 className="px-5 pb-1 pt-6 text-xl font-extrabold">Popular Locations</h3>
              <ul>
                {POPULAR_CITIES.map((c) => (
                  <CityRow key={`popular-${c.name}`} city={c} onSelect={select} />
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </>
  )
}
