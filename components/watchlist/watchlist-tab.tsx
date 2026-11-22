'use client'

import { useState } from 'react'
import {
  ArrowRight,
  Bell,
  Bookmark,
  Heart,
  Info,
  Landmark,
  MapPin,
  Smartphone,
  X,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { useTranslation } from '@/lib/use-translation'
import { monthDay } from '@/lib/format'
import type { TMEvent } from '@/lib/types'

type Mode = 'events' | 'favorites'

interface InfoRow {
  icon: React.ReactNode
  title: string
  body: string
}

function InfoList({ rows, color }: { rows: InfoRow[]; color: string }) {
  return (
    <ul className="mt-12 flex flex-col gap-7 px-9">
      {rows.map((row) => (
        <li key={row.title} className="flex items-start gap-5">
          <span className="mt-1 shrink-0" style={{ color }}>
            {row.icon}
          </span>
          <div className="min-w-0">
            <h3 className="text-xl font-extrabold">{row.title}</h3>
            <p className="mt-0.5 text-base leading-snug text-white/70">{row.body}</p>
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
          <li key={event.id} className="flex items-center gap-3 border border-white/10 bg-[#161616]">
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
  const accent = isEvents ? 'var(--color-tm-purple)' : 'var(--color-tm-pink)'

  return (
    <div className="compact-screen relative mx-auto flex h-full w-full max-w-[430px] flex-col overflow-x-hidden overflow-y-auto px-4 pb-20 pt-[max(env(safe-area-inset-top),12px)]">
      <header className="shrink-0 text-center">
        <h1 className="text-[30px] font-extrabold uppercase leading-[34px] tracking-[-0.02em]">{t('watchlist')}</h1>
        <p className="mt-2 text-[22px] leading-7 text-white/80">{t('watchlistSubtitle')}</p>
      </header>

      <div
        role="tablist"
        aria-label={t('watchlistSections')}
        className="mx-4 mt-8 grid shrink-0 grid-cols-2 rounded-full border border-white/10 bg-[#161616] p-1.5"
      >
        <button
          type="button"
          role="tab"
          aria-selected={isEvents}
          onClick={() => setMode('events')}
          className={`flex h-[56px] min-w-0 items-center justify-center gap-2 rounded-full text-[20px] font-extrabold transition-colors ${
            isEvents ? 'bg-tm-purple text-black' : 'font-medium text-white'
          }`}
        >
          <Bookmark size={22} className={isEvents ? 'fill-black' : ''} aria-hidden="true" />
          {t('events')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isEvents}
          onClick={() => setMode('favorites')}
          className={`flex h-[56px] min-w-0 items-center justify-center gap-2 rounded-full text-[20px] transition-colors ${
            !isEvents ? 'bg-tm-pink font-extrabold text-black' : 'font-medium text-white'
          }`}
        >
          <Heart size={22} className={!isEvents ? 'fill-black' : ''} aria-hidden="true" />
          {t('favorites')}
        </button>
      </div>

      {isEvents ? (
        watchlist.length > 0 ? (
          <SavedList events={watchlist} onRemove={toggleWatchlist} label={t('watchlist')} color="#b95cff" locale={locale} />
        ) : (
          <section aria-label={t('emptyEventsLabel')} className="flex flex-col items-center">
            <Bookmark size={64} strokeWidth={0} className="mt-14 fill-tm-purple" aria-hidden="true" />
            <span className="mt-8 h-[3px] w-[188px] bg-tm-purple" />
            <h2 className="mt-12 text-xl font-extrabold text-white/70">{t('noEventsAdded')}</h2>
            <InfoList
              color="#b95cff"
              rows={[
                {
                  icon: <Landmark size={34} strokeWidth={1.6} aria-hidden="true" />,
                  title: t('saveEvents'),
                  body: t('saveEventsBody'),
                },
                {
                  icon: <Bell size={34} strokeWidth={1.6} aria-hidden="true" />,
                  title: t('neverMissPresale'),
                  body: t('presaleBody'),
                },
                {
                  icon: <Info size={34} strokeWidth={1.6} aria-hidden="true" />,
                  title: t('stayInformed'),
                  body: t('stayInformedBody'),
                },
              ]}
            />
          </section>
        )
      ) : favorites.length > 0 ? (
        <SavedList events={favorites} onRemove={toggleFavorite} label={t('favorites')} color="#e83fa8" locale={locale} />
      ) : (
        <section aria-label={t('findYourFavorites')} className="flex flex-col items-center">
          <Heart size={64} strokeWidth={0} className="mt-14 fill-tm-pink" aria-hidden="true" />
          <span className="mt-8 h-[3px] w-[188px] bg-tm-pink" />
          <h2 className="mt-12 text-xl font-extrabold text-white/70">{t('findYourFavorites')}</h2>
          <InfoList
            color="#e83fa8"
            rows={[
              {
                icon: <Bell size={34} strokeWidth={1.6} aria-hidden="true" />,
                title: t('knowWhenNearby'),
                body: t('nearbyBody'),
              },
              {
                icon: <MapPin size={34} strokeWidth={1.6} aria-hidden="true" />,
                title: t('seeWhosActive'),
                body: t('activeBody'),
              },
              {
                icon: <Smartphone size={34} strokeWidth={1.6} aria-hidden="true" />,
                title: t('personalizedSuggestions'),
                body: t('personalizedBody'),
              },
            ]}
          />
        </section>
      )}

      {!isEvents && (
        <div className="pointer-events-none fixed bottom-[104px] left-1/2 z-20 -translate-x-1/2">
          <button
            type="button"
            onClick={() => setTab('home')}
            className="pointer-events-auto flex h-[64px] items-center gap-3 rounded-full bg-tm-pink px-9 text-2xl font-extrabold text-black shadow-[0_10px_30px_rgba(232,63,168,0.35)]"
          >
            {t('addFavorites')}
            <ArrowRight size={28} strokeWidth={2.6} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
