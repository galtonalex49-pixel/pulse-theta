'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, Bell, CalendarPlus, ShieldCheck, Ticket } from 'lucide-react'
import { useApp, useNow } from '@/lib/store'
import { countdownText, isPast } from '@/lib/format'
import { FlagBadge } from '../icons'
import { useTranslation } from '@/lib/use-translation'
import { EventCard } from './event-card'

type Sub = 'upcoming' | 'past'

export function TicketsLanding() {
  const { tickets, location, openDetails, profile, setTab } = useApp()
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

  if (upcoming.length === 0 && past.length === 0) {
    return (
      <div className="compact-screen relative flex h-full flex-col overflow-x-hidden overflow-y-auto px-4 pb-[100px] pt-[max(env(safe-area-inset-top),12px)]">
        <header className="shrink-0 text-center">
          <h1 className="text-base font-extrabold uppercase leading-5 tracking-[0.05em]">{t('myTickets')}</h1>
          <p className="mt-1 text-[13px] leading-5 text-[#c4c4ce]">Tickets at your fingertips</p>
        </header>
        <section className="mt-9 flex flex-col items-center" aria-label="Ticket information">
          <Ticket size={44} strokeWidth={1.7} className="text-white" aria-hidden="true" />
          <span className="mt-6 h-[3px] w-[72px] bg-tm-blue" />
          <h2 className="mt-6 text-sm font-extrabold text-white">Sign in to see your tickets</h2>
        </section>
        <ul className="mt-8 flex flex-col gap-5 px-2">
          <li className="flex items-start gap-4">
            <Ticket size={25} className="mt-0.5 w-7 shrink-0 text-tm-blue" aria-hidden="true" />
            <div>
              <h3 className="text-sm font-extrabold leading-5">All your tickets</h3>
              <p className="mt-0.5 text-xs leading-[1.45] text-[#a8a8b3]">Keep event details and tickets together in one place</p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <ShieldCheck size={25} className="mt-0.5 w-7 shrink-0 text-tm-blue" aria-hidden="true" />
            <div>
              <h3 className="text-sm font-extrabold leading-5">Secure entry</h3>
              <p className="mt-0.5 text-xs leading-[1.45] text-[#a8a8b3]">Access secure mobile tickets right when you need them</p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <Bell size={25} className="mt-0.5 w-7 shrink-0 text-tm-blue" aria-hidden="true" />
            <div>
              <h3 className="text-sm font-extrabold leading-5">Stay up to date</h3>
              <p className="mt-0.5 text-xs leading-[1.45] text-[#a8a8b3]">Get important event updates and entry information</p>
            </div>
          </li>
        </ul>
        <div className="pointer-events-none fixed bottom-[88px] left-1/2 z-20 -translate-x-1/2">
          <button
            type="button"
            onClick={() => setTab('account')}
            className="pointer-events-auto flex h-12 items-center gap-2 rounded-full bg-tm-blue px-6 text-base font-extrabold text-white shadow-lg"
          >
            Sign In <ArrowRight size={20} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>
      </div>
    )
  }

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
