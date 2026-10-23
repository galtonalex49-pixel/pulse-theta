'use client'

import { useState } from 'react'
import { EllipsisVertical, Heart, MapPin, MicVocal } from 'lucide-react'
import { useApp } from '@/lib/store'
import { monthDay, weekdayTime, yearOf } from '@/lib/format'
import type { TMEvent } from '@/lib/types'

function useOpenEvent() {
  const { browse } = useApp()
  return (event: TMEvent) => {
    browse(event)
    if (event.url) window.open(event.url, '_blank', 'noopener,noreferrer')
  }
}

function EventImage({ event, className }: { event: TMEvent; className?: string }) {
  if (!event.image) return <div className={`bg-[#222] ${className ?? ''}`} />
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={event.image} alt="" loading="lazy" className={`object-cover ${className ?? ''}`} />
  )
}

function EventMenu({ event }: { event: TMEvent }) {
  const { watchlist, toggleWatchlist } = useApp()
  const [open, setOpen] = useState(false)
  const saved = watchlist.some((e) => e.id === event.id)
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-label="Event options"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex size-9 items-center justify-center text-white"
      >
        <EllipsisVertical size={22} />
      </button>
      {open && (
        <div className="absolute bottom-full right-0 z-10 mb-1 w-48 rounded-lg border border-white/10 bg-[#2a2a2a] p-1 shadow-xl">
          <button
            type="button"
            onClick={() => {
              toggleWatchlist(event)
              setOpen(false)
            }}
            className="w-full rounded-md px-3 py-2.5 text-left text-sm font-bold hover:bg-white/10"
          >
            {saved ? 'Remove from Watchlist' : 'Add to Watchlist'}
          </button>
        </div>
      )}
    </div>
  )
}

function locationLine(event: TMEvent) {
  const place = [event.city, event.countryCode].filter(Boolean).join(', ')
  return [place, event.venue].filter(Boolean).join(' - ')
}

export function ForYouRail({ events }: { events: TMEvent[] }) {
  const open = useOpenEvent()
  return (
    <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
      {events.map((event) => {
        const date = event.dateTime ? monthDay(event.dateTime) : null
        return (
          <article
            key={event.id}
            className="w-[310px] shrink-0 snap-start border border-white/10 bg-[#161616]"
          >
            <button type="button" onClick={() => open(event)} className="relative block h-[290px] w-full">
              <EventImage event={event} className="h-full w-full" />
              <span className="absolute bottom-0 left-0 max-w-[88%] truncate bg-[#161616] px-5 pb-2 pt-3 text-xl font-extrabold uppercase">
                {event.name}
              </span>
            </button>
            <div className="flex items-center gap-3 px-4 py-3">
              {date && (
                <div className="flex shrink-0 flex-col items-center">
                  <span className="text-[13px] font-bold text-white/70">{date.month}</span>
                  <span className="text-[28px] font-extrabold leading-none">{date.day}</span>
                  <span className="mt-1 h-0.5 w-full bg-[#b5774f]" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                {event.dateTime && (
                  <p className="flex items-center gap-2 text-[13px] text-white/70">
                    <span className="truncate">{weekdayTime(event.dateTime)}</span>
                    <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[13px] font-bold text-white">
                      {yearOf(event.dateTime)}
                    </span>
                  </p>
                )}
                <p className="mt-1 flex items-center gap-1.5 text-sm font-bold">
                  <MapPin size={16} className="shrink-0 fill-tm-teal text-tm-teal" aria-hidden="true" />
                  <span className="truncate">{locationLine(event)}</span>
                </p>
              </div>
              <EventMenu event={event} />
            </div>
          </article>
        )
      })}
    </div>
  )
}

export function TrendingRail({ events, expanded }: { events: TMEvent[]; expanded: boolean }) {
  const { favorites, toggleFavorite } = useApp()
  const open = useOpenEvent()
  return (
    <ol
      className={
        expanded
          ? 'flex flex-col gap-3 px-4'
          : 'no-scrollbar grid snap-x snap-mandatory grid-flow-col grid-rows-3 auto-cols-[88%] gap-x-2 gap-y-3 overflow-x-auto px-4'
      }
    >
      {events.map((event, i) => {
        const liked = favorites.some((e) => e.id === event.id)
        return (
          <li key={event.id} className="flex min-w-0 snap-start items-center">
            <span
              aria-label={`Rank ${i + 1}`}
              className="w-[60px] shrink-0 text-[50px] font-extrabold leading-none text-transparent"
              style={{ WebkitTextStroke: '2px #f2ea1c' }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="flex min-w-0 flex-1 items-center border border-white/15 bg-[#111]">
              <button
                type="button"
                onClick={() => open(event)}
                className="flex min-w-0 flex-1 items-center text-left"
              >
                <EventImage event={event} className="h-[82px] w-[110px] shrink-0" />
                <span className="flex min-w-0 flex-1 flex-col gap-1 px-4">
                  <span className="truncate text-[17px] font-extrabold">{event.name}</span>
                  <span className="flex items-center gap-2 text-[15px] text-white/60">
                    <MicVocal size={18} className="shrink-0" aria-hidden="true" />
                    <span className="truncate">{event.genre}</span>
                  </span>
                </span>
              </button>
              <button
                type="button"
                aria-label={liked ? `Remove ${event.name} from favorites` : `Add ${event.name} to favorites`}
                aria-pressed={liked}
                onClick={() => toggleFavorite(event)}
                className="flex size-12 shrink-0 items-center justify-center pr-2"
              >
                <Heart
                  size={26}
                  strokeWidth={1.8}
                  className={liked ? 'fill-tm-pink text-tm-pink' : 'text-white'}
                />
              </button>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function MiniRail({ events, expanded }: { events: TMEvent[]; expanded: boolean }) {
  const open = useOpenEvent()
  return (
    <div
      className={
        expanded
          ? 'grid grid-cols-2 gap-3 px-4'
          : 'no-scrollbar flex snap-x gap-3 overflow-x-auto px-4'
      }
    >
      {events.map((event) => {
        const date = event.dateTime ? monthDay(event.dateTime) : null
        return (
          <button
            key={event.id}
            type="button"
            onClick={() => open(event)}
            className={`flex snap-start flex-col border border-white/10 bg-[#161616] text-left ${
              expanded ? 'min-w-0' : 'w-[220px] shrink-0'
            }`}
          >
            <EventImage event={event} className="h-[130px] w-full" />
            <span className="flex min-w-0 flex-col gap-1 p-3">
              <span className="line-clamp-2 min-h-[2.5rem] text-sm font-extrabold uppercase leading-tight">
                {event.name}
              </span>
              {date && event.dateTime && (
                <span className="text-xs font-medium text-white/60">
                  {date.month} {date.day} • {weekdayTime(event.dateTime).split(' • ')[1]}
                </span>
              )}
              <span className="truncate text-xs text-white/60">{event.venue}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function RailSection({
  title,
  children,
}: {
  title: string
  children: (expanded: boolean) => React.ReactNode
}) {
  const [expanded, setExpanded] = useState(false)
  return (
    <section className="mt-9" aria-label={title}>
      <div className="mb-4 flex items-baseline justify-between px-4">
        <h2 className="text-[22px] font-extrabold">{title}</h2>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="text-sm font-medium text-white/80"
        >
          {expanded ? 'Show Less' : 'View All'}
        </button>
      </div>
      {children(expanded)}
    </section>
  )
}
