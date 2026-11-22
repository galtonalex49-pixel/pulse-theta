'use client'

import { useMemo, useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import { useApp, useNow } from '@/lib/store'
import { countdownText, isPast } from '@/lib/format'
import { FlagBadge } from '../icons'
import { useTranslation } from '@/lib/use-translation'
import { EventCard } from './event-card'

type Sub = 'upcoming' | 'past'

export function TicketsLanding() {
  const { tickets, location, openDetails, profile } = useApp()
  const { locale, t } = useTranslation()
  const now = useNow()
  const [sub, setSub] = useState<Sub>('upcoming')

  const { upcoming, past } = useMemo(() => {
    const reference = now ?? new Date(0)
    // Preserve the order set in Admin Dashboard so the My Events tab mirrors the configured arrangement.
    const visible = tickets.filter((t) => t.visible)
    return {
      upcoming: visible.filter((t) => !isPast(t.dateTime, reference)),
      past: visible.filter((t) => isPast(t.dateTime, reference)).slice(0, Math.max(0, Math.min(50, profile.pastEventsToShow ?? 10))),
    }
  }, [tickets, now, profile.pastEventsToShow])

  const next = upcoming[0]

  return (
    <div className="relative h-full overflow-y-auto pb-6">
      <header className="sticky top-0 z-20 bg-[#111] pt-[max(env(safe-area-inset-top),16px)]">
        <div className="relative flex h-12 items-center justify-center gap-2 px-16">
          <h1 className="min-w-0 truncate text-[22px] font-extrabold leading-none">{t('myEvents')}</h1>
          <FlagBadge code={location.flag} size={22} />
          <a
            href="https://help.ticketmaster.com"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-4 text-[22px] font-extrabold leading-none"
          >
            {t('help')}
          </a>
        </div>
        <div role="tablist" aria-label={t('eventTimeframe')} className="mt-3 grid grid-cols-2">
          {(
            [
              ['upcoming', `${t('upcoming').toLocaleUpperCase(locale)}(${upcoming.length})`],
              ['past', `${t('past').toLocaleUpperCase(locale)}(${Math.max(0, Math.min(50, profile.pastEventsToShow ?? 10))})`],
            ] as const
          ).map(([id, label]) => {
            const active = sub === id
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSub(id)}
                className={`relative h-14 text-xl font-extrabold ${active ? 'text-white' : 'text-white/45'}`}
              >
                {label}
                <span
                  className={`absolute inset-x-0 bottom-0 ${
                    active ? 'h-1.5 bg-white' : 'h-px bg-white/15'
                  }`}
                />
              </button>
            )
          })}
        </div>
      </header>

      {sub === 'upcoming' ? (
        upcoming.length === 0 ? (
          <p className="mx-8 mt-20 text-center text-lg text-white/60">
            {t('noUpcomingEvents')} {t('noUpcomingTickets')}
          </p>
        ) : (
          <>
            <section className="relative overflow-hidden pb-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={next.posterUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full scale-125 object-cover opacity-70 blur-3xl"
              />
              <div className="relative">
                <div className="flex items-center justify-between px-6 py-5">
                  <p className="text-[28px] font-extrabold drop-shadow">
                    {t('nextEvent', { countdown: now ? countdownText(next.dateTime, now, locale) : '' })}
                  </p>
                  <CalendarPlus size={40} strokeWidth={1.6} className="shrink-0" aria-hidden="true" />
                </div>
                <div className="px-4">
                  <EventCard ticket={next} onView={() => openDetails(next.id)} />
                </div>
              </div>
            </section>

            <section aria-label={t('allUpcomingEvents')} className="mt-8 px-4">
              <h2 className="mb-5 text-[26px] font-extrabold">{t('allUpcomingEvents')}</h2>
              <ul className="flex flex-col gap-6">
                {upcoming.map((t) => (
                  <li key={t.id}>
                    <EventCard ticket={t} compact onView={() => openDetails(t.id)} />
                  </li>
                ))}
              </ul>
            </section>
          </>
        )
      ) : past.length === 0 ? (
        <p className="mx-8 mt-20 text-center text-lg text-white/60">
          {t('pastEventsDescription')}
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-6 px-4">
          {past.map((t) => (
            <li key={t.id}>
              <EventCard ticket={t} compact past onView={() => openDetails(t.id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
