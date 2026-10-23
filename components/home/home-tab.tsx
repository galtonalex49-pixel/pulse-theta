'use client'

import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { ChevronRight, MapPin, ArrowRight } from 'lucide-react'
import { useApp } from '@/lib/store'
import { cityLine } from '@/lib/locations'
import { parseLocal, monthDay } from '@/lib/format'
import type { TMEvent } from '@/lib/types'
import { SearchBar } from './search-bar'
import { ForYouRail, MiniRail, RailSection, TrendingRail } from './event-rails'

export const fetchEvents = async (url: string): Promise<{ events: TMEvent[] }> => {
  try {
    const response = await fetch(url)
    if (!response.ok) return { events: [] }
    const payload = await response.json()
    return { events: Array.isArray(payload?.events) ? payload.events : [] }
  } catch {
    return { events: [] }
  }
}

function dedupeByName(events: TMEvent[]) {
  const seen = new Set<string>()
  return events.filter((e) => {
    const key = e.name.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function byDate(a: TMEvent, b: TMEvent) {
  return (a.dateTime ?? '').localeCompare(b.dateTime ?? '')
}

function useDebounced<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function SearchResults({ query, onPick }: { query: string; onPick: (e: TMEvent) => void }) {
  const debounced = useDebounced(query)
  const { data, isLoading } = useSWR(
    debounced.length >= 2 ? `/api/ticketmaster?keyword=${encodeURIComponent(debounced)}&size=20` : null,
    fetchEvents,
    { revalidateOnFocus: false },
  )
  const events = data?.events ?? []

  return (
    <section aria-label="Search results" className="mt-6 px-4">
      {isLoading && <p className="py-6 text-center text-white/60">Searching…</p>}
      {!isLoading && debounced.length >= 2 && events.length === 0 && (
        <p className="py-6 text-center text-white/60">No results for “{debounced}”.</p>
      )}
      <ul className="flex flex-col gap-2">
        {events.map((event) => {
          const date = event.dateTime ? monthDay(event.dateTime) : null
          return (
            <li key={event.id}>
              <button
                type="button"
                onClick={() => onPick(event)}
                className="flex w-full items-center gap-3 border border-white/10 bg-[#161616] text-left"
              >
                {event.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={event.image} alt="" className="h-[72px] w-[96px] shrink-0 object-cover" />
                )}
                <span className="flex min-w-0 flex-1 flex-col py-2 pr-3">
                  <span className="truncate text-base font-extrabold">{event.name}</span>
                  <span className="truncate text-sm text-white/60">
                    {date ? `${date.month} ${date.day} • ` : ''}
                    {event.venue}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export function HomeTab() {
  const { location, locationConfirmed, setLocationSheetOpen, browsed, browse } = useApp()
  const [query, setQuery] = useState('')

  const { data, isLoading } = useSWR(
    `/api/ticketmaster?city=${encodeURIComponent(location.tmCity)}&countryCode=${location.tmCountry}&size=100`,
    fetchEvents,
    { revalidateOnFocus: false },
  )

  const sections = useMemo(() => {
    const all = data?.events ?? []
    const unique = dedupeByName(all)
    const byDateAsc = [...unique].sort(byDate)
    const forYou = byDateAsc.slice(0, 8)
    const forYouIds = new Set(forYou.map((e) => e.id))
    const trending = unique.slice(0, 12)
    const lastMinute = byDateAsc.filter((e) => !forYouIds.has(e.id)).slice(0, 10)

    const weekend = [...all]
      .sort(byDate)
      .filter((e) => {
        if (!e.dateTime) return false
        const d = parseLocal(e.dateTime)
        const days = (d.getTime() - Date.now()) / 86400000
        return [5, 6, 0].includes(d.getDay()) && days >= 0 && days <= 21
      })
    const popularWeekend = dedupeByName(weekend).slice(0, 10)

    const justAnnounced = [...unique]
      .sort((a, b) => (b.onSaleStart ?? '').localeCompare(a.onSaleStart ?? ''))
      .slice(0, 10)

    return {
      forYou,
      trending,
      lastMinute,
      popularWeekend: popularWeekend.length > 0 ? popularWeekend : unique.slice(12, 22),
      justAnnounced,
      empty: unique.length === 0,
    }
  }, [data])

  const recent = browsed.length > 0 ? browsed : sections.trending.slice(0, 6)

  return (
    <div className="relative mx-auto h-full w-full max-w-[430px] overflow-x-hidden overflow-y-auto pb-24 pt-[max(env(safe-area-inset-top),12px)]">
      <button
        type="button"
        onClick={() => setLocationSheetOpen(true)}
        className="mb-4 flex w-full items-center gap-2 px-4 py-1.5 text-left"
        aria-label={`Current location ${cityLine(location)}. Change location`}
      >
        <MapPin size={18} className="shrink-0 fill-tm-teal text-tm-teal" aria-hidden="true" />
        <span className="min-w-0 truncate text-[14px] font-bold leading-[18px] text-white/90">{cityLine(location)}</span>
        <ChevronRight size={18} className="shrink-0 text-white/70" aria-hidden="true" />
      </button>

      <SearchBar value={query} onChange={setQuery} />

      {query.trim().length >= 2 ? (
        <SearchResults
          query={query.trim()}
          onPick={(event) => {
            browse(event)
            if (event.url) window.open(event.url, '_blank', 'noopener,noreferrer')
          }}
        />
      ) : (
        <>
          {isLoading && (
            <p role="status" className="mt-12 text-center text-white/60">
              Loading events in {location.name}…
            </p>
          )}

          {!isLoading && sections.empty && (
            <p className="mx-6 mt-12 text-center text-white/60">
              No events found in {location.name} right now. Try another city.
            </p>
          )}

          {!sections.empty && (
            <>
              <section className="mt-4" aria-label="For You">
                <h2 className="mb-2.5 px-4 text-base font-bold tracking-[-0.01em]">For You</h2>
                <ForYouRail events={sections.forYou} />
              </section>

              <RailSection title={`Trending In ${location.trendingLabel}`}>
                {(expanded) => <TrendingRail events={sections.trending} expanded={expanded} />}
              </RailSection>

              <RailSection title="Recently Browsed Events">
                {(expanded) => <MiniRail events={recent} expanded={expanded} />}
              </RailSection>

              <RailSection title="Last Minute">
                {(expanded) => <MiniRail events={sections.lastMinute} expanded={expanded} />}
              </RailSection>

              <RailSection title="Popular This Weekend">
                {(expanded) => <MiniRail events={sections.popularWeekend} expanded={expanded} />}
              </RailSection>

              <RailSection title="Just Announced">
                {(expanded) => <MiniRail events={sections.justAnnounced} expanded={expanded} />}
              </RailSection>
            </>
          )}
        </>
      )}

      {!locationConfirmed && (
        <button
          type="button"
          onClick={() => setLocationSheetOpen(true)}
          className="fixed bottom-[68px] left-1/2 z-20 flex h-11 w-[88%] max-w-[379px] -translate-x-1/2 items-center gap-2 rounded-full bg-white px-2 pr-3 text-left text-black shadow-2xl"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-tm-teal">
            <MapPin size={18} className="fill-[#111] text-[#111]" aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-xs font-bold leading-tight">Find Events Near You</span>
            <span className="text-[10px] leading-tight text-black/70">Set your location</span>
          </span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
