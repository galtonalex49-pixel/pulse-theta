'use client'

import { useState } from 'react'
import { Ellipsis, FerrisWheel, Goal, Grid2X2, Heart, Laugh, MapPin, MicVocal, Tag, TentTree, Trophy, Volleyball } from 'lucide-react'
import { useApp } from '@/lib/store'
import { useTranslation } from '@/lib/use-translation'
import { monthDay, weekdayTime } from '@/lib/format'
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
        <Ellipsis size={22} />
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

function CategoryIcon({ event }: { event: TMEvent }) {
  const category = `${event.genre} ${event.segment}`.toLowerCase()
  const isFamily = ['family', 'ice show', 'ice skating', 'attraction', 'theme park'].some((term) =>
    category.includes(term),
  )
  const isArts = ['arts', 'theater', 'theatre', 'magic', 'illusion', 'spectacular'].some((term) =>
    category.includes(term),
  )
  const isMusic = ['music', 'concert', 'rock', 'pop', 'r&b', 'dance', 'electronic', 'jazz', 'country', 'hip-hop', 'soul', 'classical', 'orchestra'].some((term) =>
    category.includes(term),
  )
  const isSports = ['sports', 'wrestling', 'football', 'basketball', 'baseball', 'soccer', 'volleyball', 'hockey', 'tennis'].some((term) =>
    category.includes(term),
  )

  const Icon = isFamily
    ? category.includes('family') && !category.includes('ice show') && !category.includes('attraction')
      ? TentTree
      : FerrisWheel
    : isArts
      ? Grid2X2
      : isMusic
        ? MicVocal
        : isSports
          ? category.includes('volleyball')
            ? Volleyball
            : category.includes('soccer')
              ? Goal
              : Trophy
          : category.includes('comedy') || category.includes('stand-up')
            ? Laugh
            : Tag

  return <Icon size={12} className="shrink-0 text-[#b5b5c0]" aria-hidden="true" />
}

function EventCard({ event, expanded = false }: { event: TMEvent; expanded?: boolean }) {
  const open = useOpenEvent()
  const { locale } = useTranslation()
  const date = event.dateTime ? monthDay(event.dateTime, locale) : null

  return (
    <article
      className={`h-[220px] shrink-0 snap-start border border-[#26262c] bg-[#17171b] ${
        expanded ? 'w-full' : 'w-[248px]'
      }`}
    >
      <button type="button" onClick={() => open(event)} className="relative block h-[142px] w-full text-left">
        <EventImage event={event} className="h-full w-full" />
        <span className="type-event-title absolute bottom-0 left-0 max-w-[88%] truncate bg-[#17171b] px-3 py-2 text-sm font-extrabold leading-[1.2] uppercase">
          {event.name}
        </span>
      </button>
      <div className="flex h-[78px] items-center gap-2 bg-[#1a1a1e] px-3 py-2">
        {date && (
          <div className="flex w-11 shrink-0 flex-col items-start leading-none">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#a8a8b3]">{date.month}</span>
            <span className="mt-0.5 text-[20px] font-extrabold leading-[21px]">{date.day}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          {event.dateTime && (
            <p className="truncate text-[11px] leading-4 text-white/75">
              {weekdayTime(event.dateTime, locale)}
            </p>
          )}
          <p className="mt-0.5 flex items-center gap-1 text-xs leading-4 text-white">
            <MapPin size={13} className="shrink-0 fill-tm-blue-light text-tm-blue-light" aria-hidden="true" />
            <span className="truncate">{event.venue}</span>
          </p>
        </div>
        <EventMenu event={event} />
      </div>
    </article>
  )
}

export function ForYouRail({ events, expanded = false }: { events: TMEvent[]; expanded?: boolean }) {
  return (
    <div className={expanded ? 'for-you-rail flex flex-col gap-3 px-4' : 'for-you-rail no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1'}>
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
  const rankedEvents = events.slice(0, expanded ? 12 : 9)
  const columns = Array.from({ length: Math.ceil(rankedEvents.length / 3) }, (_, index) =>
    rankedEvents.slice(index * 3, index * 3 + 3),
  )

  return (
    <div
      role="region"
      aria-label="Trending events carousel"
      className="trending-carousel no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1"
    >
      {columns.map((column, columnIndex) => (
        <ol key={columnIndex} aria-label="Trending events" className="flex w-[88%] shrink-0 snap-start flex-col gap-2.5">
          {column.map((event, rowIndex) => {
            const rank = columnIndex * 3 + rowIndex + 1
            const liked = favorites.some((favorite) => favorite.id === event.id)
            return (
              <li key={event.id} className="flex min-h-[68px] min-w-0 items-center gap-2">
                <span
                  aria-label={t('rank', { rank })}
                  className="trending-rank w-12 shrink-0 text-center text-[32px] leading-none"
                >
                  {String(rank).padStart(2, '0')}
                </span>
                <div className="flex min-h-[64px] min-w-0 flex-1 items-center gap-2 border border-[#26262c] bg-[#111215] px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => open(event)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <EventImage event={event} className="h-12 w-[68px] shrink-0 rounded-[6px] object-cover" />
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="type-event-title truncate text-[14px] font-extrabold leading-4 text-white">
                        {event.name}
                      </span>
                      <span className="flex items-center gap-1.5 text-[12px] leading-4 text-[#b5b5c0]">
                        <CategoryIcon event={event} />
                        <span className="truncate">{event.genre || event.segment}</span>
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={liked ? t('removeFromFavorites', { name: event.name }) : t('addToFavorites', { name: event.name })}
                    aria-pressed={liked}
                    onClick={() => toggleFavorite(event)}
                    className="flex size-9 shrink-0 items-center justify-center"
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
      ))}
    </div>
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
    <section className="mt-7" aria-label={title}>
      <div className="mb-3 flex items-baseline justify-between gap-3 px-4">
        <h2 className="min-w-0 flex-1 text-lg font-extrabold leading-tight">{title}</h2>
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((e) => !e)}
          className="shrink-0 whitespace-nowrap text-[13px] font-normal text-[#c4c4ce]"
        >
          {expanded ? t('showLess') : t('viewAll')}
        </button>
      </div>
      {children(expanded)}
    </section>
  )
}
