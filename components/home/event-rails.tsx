'use client'

import { useState } from 'react'
import { CircleDot, Drama, EllipsisVertical, Goal, Heart, Laugh, MapPin, MicVocal, Music2, Ticket, Volleyball } from 'lucide-react'
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
        className="flex size-6 items-center justify-center text-white"
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

function CategoryIcon({ event }: { event: TMEvent }) {
  const category = `${event.genre} ${event.segment}`.toLowerCase()
  const Icon = category.includes('basketball')
    ? CircleDot
    : category.includes('soccer')
      ? Goal
      : category.includes('volleyball')
        ? Volleyball
        : category.includes('football')
          ? Ticket
          : category.includes('comedy') || category.includes('stand-up')
            ? Laugh
            : category.includes('theatre') || category.includes('theater')
              ? Drama
              : category.includes('music') || category.includes('concert')
                ? Music2
                : MicVocal

  return <Icon size={18} className="shrink-0" aria-hidden="true" />
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
            className="h-[180px] w-[230px] shrink-0 snap-start border border-white/10 bg-[#161616]"
          >
            <button type="button" onClick={() => open(event)} className="relative block h-[120px] w-full">
              <EventImage event={event} className="h-full w-full" />
              <span className="absolute bottom-0 left-0 max-w-[88%] truncate bg-[#161616] px-2.5 py-1.5 text-[13px] font-bold leading-4 uppercase">
                {event.name}
              </span>
            </button>
            <div className="flex items-center gap-2 px-2.5 py-2">
              {date && (
                <div className="flex shrink-0 flex-col items-center">
                  <span className="text-[13px] font-bold text-white/70">{date.month}</span>
                  <span className="text-xl font-extrabold leading-none">{date.day}</span>
                  <span className="mt-1 h-0.5 w-full bg-[#b5774f]" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                {event.dateTime && (
                  <p className="flex items-center gap-1 text-[11px] leading-[14px] text-white/70">
                    <span className="truncate">{weekdayTime(event.dateTime)}</span>
                    <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[13px] font-bold text-white">
                      {yearOf(event.dateTime)}
                    </span>
                  </p>
                )}
                <p className="mt-0.5 flex items-center gap-1 text-[11px] font-bold leading-[14px]">
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
          <li key={event.id} className="flex min-w-0 snap-start items-center gap-2">
            <span
              aria-label={`Rank ${i + 1}`}
              className="w-8 shrink-0 text-center text-xl font-extrabold leading-none text-transparent"
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
                <EventImage event={event} className="h-[42px] w-[42px] shrink-0 rounded" />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5 px-2">
                  <span className="truncate text-[13px] font-bold leading-4">{event.name}</span>
                  <span className="flex items-center gap-1 text-[11px] leading-[14px] text-white/60">
                    <CategoryIcon event={event} />
                    <span className="truncate">{event.genre}</span>
                  </span>
                </span>
              </button>
              <button
                type="button"
                aria-label={liked ? `Remove ${event.name} from favorites` : `Add ${event.name} to favorites`}
                aria-pressed={liked}
                onClick={() => toggleFavorite(event)}
                className="flex size-8 shrink-0 items-center justify-center pr-1"
              >
                <Heart
                  size={18}
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
              expanded ? 'min-w-0' : 'w-[230px] h-[180px] shrink-0'
            }`}
          >
            <EventImage event={event} className="h-[120px] w-full object-cover" />
            <span className="flex min-w-0 flex-col gap-0.5 px-2.5 py-1.5">
              <span className="line-clamp-2 min-h-8 text-[13px] font-bold uppercase leading-4">
                {event.name}
              </span>
              {date && event.dateTime && (
                <span className="text-[11px] leading-[14px] font-medium text-white/60">
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
    <section className="mt-4" aria-label={title}>
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
