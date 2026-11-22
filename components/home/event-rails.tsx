'use client'

import { useState } from 'react'
import { CircleDot, Drama, EllipsisVertical, Goal, Heart, Laugh, MapPin, MicVocal, Music2, Ticket, Volleyball } from 'lucide-react'
import { useApp } from '@/lib/store'
import { useTranslation } from '@/lib/use-translation'
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
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const saved = watchlist.some((e) => e.id === event.id)
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-label={t('eventOptions')}
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
            {saved ? t('removeFromWatchlist') : t('addToWatchlist')}
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

function EventCard({ event, expanded = false }: { event: TMEvent; expanded?: boolean }) {
  const open = useOpenEvent()
  const { locale } = useTranslation()
  const date = event.dateTime ? monthDay(event.dateTime, locale) : null

  return (
    <article
      className={`h-[220px] shrink-0 snap-start border border-white/10 bg-[#232323] ${
        expanded ? 'w-full' : 'w-[280px]'
      }`}
    >
      <button type="button" onClick={() => open(event)} className="relative block h-[142px] w-full text-left">
        <EventImage event={event} className="h-full w-full" />
        <span className="type-event-title absolute bottom-0 left-0 max-w-[88%] truncate bg-[#161616] px-3 py-2 text-sm font-bold leading-4 uppercase">
          {event.name}
        </span>
      </button>
      <div className="flex h-[78px] items-center gap-2.5 px-3 py-2">
        {date && (
          <div className="flex w-9 shrink-0 flex-col items-center leading-none">
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/75">{date.month}</span>
            <span className="mt-1 text-xl font-extrabold">{date.day}</span>
            <span className="mt-1 h-[3px] w-6 bg-[#d5824b]" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          {event.dateTime && (
            <p className="truncate text-xs leading-4 text-white/70">
              {weekdayTime(event.dateTime, locale)} · {yearOf(event.dateTime)}
            </p>
          )}
          <p className="mt-1 flex items-center gap-1.5 text-xs font-bold leading-4 text-white">
            <MapPin size={16} className="shrink-0 fill-tm-teal text-tm-teal" aria-hidden="true" />
            <span className="truncate">{locationLine(event)}</span>
          </p>
        </div>
        <EventMenu event={event} />
      </div>
    </article>
  )
}

export function ForYouRail({ events, expanded = false }: { events: TMEvent[]; expanded?: boolean }) {
  return (
    <div className={expanded ? 'flex flex-col gap-3 px-4' : 'no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1'}>
      {events.map((event) => (
        <EventCard key={event.id} event={event} expanded={expanded} />
      ))}
    </div>
  )
}

export function TrendingRail({ events, expanded }: { events: TMEvent[]; expanded: boolean }) {
  const { favorites, toggleFavorite } = useApp()
  const { t } = useTranslation()
  const open = useOpenEvent()
  return (
    <ol className="flex flex-col gap-2.5 px-4">
      {events.slice(0, expanded ? 12 : 3).map((event, i) => {
        const liked = favorites.some((e) => e.id === event.id)
        return (
          <li key={event.id} className="flex min-h-[68px] min-w-0 items-center gap-2">
            <span
              aria-label={t('rank', { rank: i + 1 })}
              className="w-11 shrink-0 text-center text-[30px] font-extrabold leading-none text-[#f2ea1c]"
              style={{ WebkitTextStroke: '1px #080808', textShadow: '0 1px 2px #080808' }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="flex min-w-0 flex-1 items-center border border-white/10 bg-[#151515] px-2 py-1.5">
              <button
                type="button"
                onClick={() => open(event)}
                className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
              >
                <EventImage event={event} className="size-[54px] shrink-0 object-cover" />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="type-event-title truncate text-sm font-bold leading-4">{event.name}</span>
                  <span className="flex items-center gap-1.5 text-xs leading-4 text-white/65">
                    <CategoryIcon event={event} />
                    <span className="truncate">{event.genre}</span>
                  </span>
                </span>
              </button>
              <button
                type="button"
                aria-label={liked ? t('removeFromFavorites', { name: event.name }) : t('addToFavorites', { name: event.name })}
                aria-pressed={liked}
                onClick={() => toggleFavorite(event)}
                className="flex size-10 shrink-0 items-center justify-center"
              >
                <Heart
                  size={23}
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
  const { locale } = useTranslation()
  return (
    <div
      className={
        expanded
          ? 'grid grid-cols-2 gap-3 px-4'
          : 'no-scrollbar flex snap-x gap-3 overflow-x-auto px-4'
      }
    >
      {events.map((event) => {
        const date = event.dateTime ? monthDay(event.dateTime, locale) : null
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
              <span className="type-event-title line-clamp-2 min-h-8 text-[13px] font-bold uppercase leading-4">
                {event.name}
              </span>
              {date && event.dateTime && (
                <span className="text-[11px] leading-[14px] font-medium text-white/60">
                  {date.month} {date.day} • {weekdayTime(event.dateTime, locale).split(' • ')[1]}
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
  const { t } = useTranslation()
  return (
    <section className="mt-8" aria-label={title}>
      <div className="mb-5 flex items-baseline justify-between gap-3 px-4">
        <h2 className="min-w-0 flex-1 text-xl font-extrabold leading-tight">{title}</h2>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="shrink-0 whitespace-nowrap text-xs font-medium text-white/80"
        >
          {expanded ? t('showLess') : t('viewAll')}
        </button>
      </div>
      {children(expanded)}
    </section>
  )
}
