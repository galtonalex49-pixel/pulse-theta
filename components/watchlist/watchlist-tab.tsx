'use client'

import { useState } from 'react'
import {
  ArrowRight,
  Bell,
  Bookmark,
  Heart,
  Info,
  MapPin,
  Smartphone,
  X,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { useTranslation } from '@/lib/use-translation'
import { monthDay } from '@/lib/format'
import type { TMEvent } from '@/lib/types'
import { TicketArtworkIcon } from '../icons'

type Mode = 'events' | 'favorites'

interface InfoRow {
  icon: React.ReactNode
  title: string
  body: string
}

function InfoList({ rows, color }: { rows: InfoRow[]; color: string }) {
  return (
    <ul className="mt-5 flex flex-col gap-4 px-2">
      {rows.map((row) => (
        <li key={row.title} className="flex items-start gap-4">
          <span className="mt-0.5 flex w-7 shrink-0 justify-center" style={{ color }}>
            {row.icon}
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold leading-5 text-white">{row.title}</h3>
            <p className="mt-0.5 text-xs leading-[1.45] text-[#a8a8b3]">{row.body}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function SavedList({
  events,
  onRemove,
  label,
  color,
  locale,
}: {
  events: TMEvent[]
  onRemove: (e: TMEvent) => void
  label: string
  color: string
  locale: string
}) {
  return (
    <ul className="mt-8 flex flex-col gap-3 px-4">
      {events.map((event) => {
        const date = event.dateTime ? monthDay(event.dateTime, locale) : null
        return (
          <li key={event.id} className="flex items-center gap-3 border border-white/10 bg-[#1a1a1e]">
            {event.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={event.image} alt="" className="h-[84px] w-[110px] shrink-0 object-cover" />
            )}
            <div className="flex min-w-0 flex-1 flex-col py-2">
              <span className="type-event-title truncate text-base font-extrabold uppercase">{event.name}</span>
              <span className="flex items-center gap-1.5 truncate text-sm text-white/60">
                <MapPin size={14} className="shrink-0" style={{ color }} aria-hidden="true" />
                <span className="truncate">
                  {date ? `${date.month} ${date.day} • ` : ''}
                  {event.venue}
                </span>
              </span>
            </div>
            <button
              type="button"
              aria-label={`Remove ${event.name} from ${label}`}
              onClick={() => onRemove(event)}
              className="flex size-12 shrink-0 items-center justify-center text-white/70"
            >
              <X size={20} />
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export function WatchlistTab() {
  const { watchlist, toggleWatchlist, favorites, toggleFavorite, setTab } = useApp()
  const { locale, t } = useTranslation()
  const [mode, setMode] = useState<Mode>('events')

  const isEvents = mode === 'events'
  return (
    <div className="compact-screen relative mx-auto flex h-full w-full max-w-[430px] flex-col overflow-x-hidden overflow-y-auto bg-tm-surface px-4 pb-[96px] pt-[max(env(safe-area-inset-top),12px)]">
      <header className="shrink-0 text-center">
        <h1 className="text-base font-extrabold uppercase leading-5 tracking-[0.05em]">{t('watchlist')}</h1>
        <p className="mt-1 text-[13px] leading-5 text-[#c4c4ce]">{t('watchlistSubtitle')}</p>
      </header>

      <div
        role="tablist"
        aria-label={t('watchlistSections')}
        className="mx-0 mt-5 grid shrink-0 grid-cols-2 rounded-full border border-[#28232e] bg-[#18151c] p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={isEvents}
          onClick={() => setMode('events')}
          className={`flex h-[42px] min-w-0 items-center justify-center gap-2 rounded-full text-[13px] transition-colors ${
            isEvents ? 'bg-tm-purple font-extrabold text-tm-black' : 'font-normal text-white'
          }`}
        >
          <Bookmark size={18} className={isEvents ? 'fill-tm-black' : ''} aria-hidden="true" />
          {t('events')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isEvents}
          onClick={() => setMode('favorites')}
          className={`flex h-[42px] min-w-0 items-center justify-center gap-2 rounded-full text-[13px] transition-colors ${
            !isEvents ? 'bg-tm-pink font-extrabold text-tm-black' : 'font-normal text-white'
          }`}
        >
          <Heart size={18} className={!isEvents ? 'fill-tm-black' : ''} aria-hidden="true" />
          {t('favorites')}
        </button>
      </div>

      {isEvents ? (
        watchlist.length > 0 ? (
          <SavedList events={watchlist} onRemove={toggleWatchlist} label={t('watchlist')} color="#b87aff" locale={locale} />
        ) : (
          <section aria-label={t('emptyEventsLabel')} className="flex flex-col items-center">
            <Bookmark size={42} strokeWidth={1.8} className="mt-5 text-white" aria-hidden="true" />
            <span className="mt-4 h-[3px] w-[72px] bg-tm-purple" />
            <h2 className="mt-4 text-sm font-extrabold text-white">Sign in to see your events</h2>
            <InfoList
color="#b87aff"
              rows={[
                {
                  icon: <TicketArtworkIcon size={25} className="text-white" />,
                  title: t('saveEvents'),
                  body: t('saveEventsBody'),
                },
                {
                icon: <Bell size={25} strokeWidth={1.7} aria-hidden="true" />,
                  title: t('neverMissPresale'),
                  body: t('presaleBody'),
                },
                {
                  icon: <Info size={25} strokeWidth={1.7} aria-hidden="true" />,
                  title: t('stayInformed'),
                  body: t('stayInformedBody'),
                },
              ]}
            />
          </section>
        )
      ) : favorites.length > 0 ? (
        <SavedList events={favorites} onRemove={toggleFavorite} label={t('favorites')} color="#ff3b9a" locale={locale} />
      ) : (
        <section aria-label={t('findYourFavorites')} className="flex flex-col items-center">
          <Heart size={46} strokeWidth={1.8} className="mt-5 text-white" aria-hidden="true" />
          <span className="mt-4 h-[3px] w-[72px] bg-tm-pink" />
          <h2 className="mt-4 text-sm font-extrabold text-white">{t('findYourFavorites')}</h2>
          <InfoList
color="#ff3b9a"
            rows={[
              {
                icon: <Bell size={25} strokeWidth={1.7} aria-hidden="true" />,
                title: t('knowWhenNearby'),
                body: t('nearbyBody'),
              },
              {
                  icon: <MapPin size={25} strokeWidth={1.7} aria-hidden="true" />,
                title: t('seeWhosActive'),
                body: t('activeBody'),
              },
              {
                  icon: <Smartphone size={25} strokeWidth={1.7} aria-hidden="true" />,
                title: t('personalizedSuggestions'),
                body: t('personalizedBody'),
              },
            ]}
          />
        </section>
      )}

      {(isEvents ? watchlist.length === 0 : favorites.length === 0) && (
        <div className="pointer-events-none fixed bottom-[88px] left-1/2 z-20 -translate-x-1/2">
          <button
            type="button"
            onClick={() => setTab(isEvents ? 'account' : 'home')}
            className={`pointer-events-auto flex h-[48px] items-center gap-2 rounded-full px-6 text-base font-extrabold shadow-lg ${
              isEvents ? 'bg-tm-blue text-white' : 'bg-tm-pink text-tm-black'
            }`}
          >
            {isEvents ? 'Sign In' : t('addFavorites')}
            <ArrowRight size={20} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
