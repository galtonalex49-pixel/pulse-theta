'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Info, RefreshCw } from 'lucide-react'
import { useApp, useNow } from '@/lib/store'
import { useTranslation } from '@/lib/use-translation'
import { dateLong } from '@/lib/format'
import type { Ticket } from '@/lib/types'
import { AppleWalletBadge } from '../icons'
import { Barcode } from './barcode'

function TicketDetailsSheet({ ticket, onClose }: { ticket: Ticket; onClose: () => void }) {
  const { locale, t } = useTranslation()
  const currency = (ticket.currency || 'USD').toUpperCase()
  const formatMoney = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value)
  const total = (ticket.ticketPrice ?? 0) + (ticket.serviceFee ?? 0)
  const lines = [ticket.presenter ? `${ticket.presenter.replace(/\s+PRESENTS$/i, '')} PRESENTS` : '', ticket.artist, ticket.venue, ticket.policyNotice, dateLong(ticket.dateTime, locale)].filter(Boolean)
  const ticketType = ticket.ticketTypeOverride || ticket.purchaseType
  const purchaseDate = ticket.purchaseDate ? new Date(ticket.purchaseDate).toLocaleString(locale, { dateStyle: 'long', timeStyle: 'short' }) : t('notProvided')
  return (
    <div className="absolute inset-0 z-50 overflow-y-auto bg-white text-[#202124]" role="dialog" aria-modal="true" aria-labelledby="ticket-details-title">
      <header className="sticky top-0 flex items-center gap-4 bg-[#161923] px-5 py-4 text-white">
        <button type="button" onClick={onClose} aria-label={t('back')}><ArrowLeft size={28} /></button>
        <h2 id="ticket-details-title" className="text-xl font-bold">{t('ticketDetails')}</h2>
      </header>
      <div className="divide-y divide-black/10 text-[16px]">
        <section className="px-6 py-6"><h3 className="type-event-title text-2xl font-extrabold uppercase">{ticket.artist}</h3><p className="mt-2 text-black/60">{dateLong(ticket.dateTime, locale)} · {ticket.venue}</p></section>
        <section className="px-6 py-6"><h3 className="font-bold">{t('entryInfo')}</h3><p className="mt-2">{ticket.entryInfo || t('generalAdmission')}</p></section>
        <section className="px-6 py-6"><h3 className="font-bold">{t('ticketInfo')}</h3><pre className="mt-3 whitespace-pre-wrap font-mono text-[14px] leading-6">{lines.join('\n')}</pre></section>
        <section className="px-6 py-6"><h3 className="font-bold">{t('venue')}</h3><p className="mt-2">{ticket.venueLocation || ticket.venue}</p></section>
        <section className="px-6 py-6"><h3 className="font-bold">{t('orderNumber')}</h3><p className="mt-2 font-mono">{ticket.orderNumber ? `${ticket.orderNumber.slice(0, 3)}******/${ticket.orderNumber.split('/')[1] ?? 'XX'}` : 'XXXXXXXXXX'}</p></section>
        <section className="px-6 py-6"><h3 className="font-bold">{t('ticketType')}</h3><p className="mt-2">{ticketType}</p></section>
        <section className="px-6 py-6"><h3 className="font-bold">{t('purchaseDate')}</h3><p className="mt-2">{purchaseDate}</p></section>
        <section className="px-6 py-6"><div className="flex justify-between"><span>{t('ticketPrice')}</span><span>{formatMoney(ticket.ticketPrice ?? 0)}</span></div><div className="mt-2 flex justify-between"><span>{t('serviceFee')}</span><span>{formatMoney(ticket.serviceFee ?? 0)}</span></div><div className="mt-3 flex justify-between font-extrabold"><span>{t('grandTotal')}</span><span>{formatMoney(total)}</span></div></section>
        <section className="px-6 py-6 text-sm text-black/60">{t('ticketTermsLead')} <a className="text-blue-600 underline" href="https://www.ticketmaster.com/legal/terms-of-use" target="_blank" rel="noreferrer">{t('termsOfUse')}</a>{t('ticketTermsSuffix')} <a className="text-blue-600 underline" href="https://www.ticketmaster.com" target="_blank" rel="noreferrer">{t('ticketmasterDotCom')}</a>.</section>
      </div>
    </div>
  )
}

function SeatSlide({ ticket, seat }: { ticket: Ticket; seat: Ticket['seats'][number] }) {
  const { locale, t } = useTranslation()
  const [refreshes, setRefreshes] = useState(0)
  const now = useNow(1000)
  const eventTime = new Date(ticket.dateTime).getTime()
  const remaining = Math.max(0, eventTime - (now?.getTime() ?? Date.now()))
  const configuredCountdown =
    ((ticket.barcodeCountdownHours ?? 72) * 60 * 60 +
      (ticket.barcodeCountdownMinutes ?? 0) * 60 +
      (ticket.barcodeCountdownSeconds ?? 0)) *
    1000
  const locked = ticket.barcodeMode !== 'active' && remaining > configuredCountdown
  const days = Math.floor(remaining / 86400000)
  const hours = Math.floor((remaining % 86400000) / 3600000)
  const minutes = Math.floor((remaining % 3600000) / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)

  return (
    <li className="flex w-full min-w-0 shrink-0 snap-center justify-center px-4">
      <div className="w-full max-w-[320px] overflow-hidden rounded-xl bg-[#111] shadow-2xl">
        <div className="bg-tm-blue py-3 text-center">
          <span className="text-[22px] font-extrabold italic leading-7 tracking-tight">ticketmaster</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className="relative">
          <img src={ticket.posterUrl} alt="" className="h-[220px] w-full object-cover object-top" />
          <div className="absolute inset-x-3 top-5 rounded-xl bg-[#1c1c1c]/95 px-3 py-3 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 flex-1 text-center text-[14px] font-semibold leading-5">{t('screenshotsWarning')}</p>
              <button type="button" aria-label={t('refreshBarcode')} onClick={() => setRefreshes((r) => r + 1)} className="shrink-0 text-white">
                <RefreshCw size={30} className="transition-transform duration-500" style={{ transform: `rotate(${refreshes * 360}deg)` }} />
              </button>
            </div>
            <div className="relative mt-5 overflow-hidden px-1">
              {locked ? (
                <div className="flex min-h-[86px] flex-col items-center justify-center text-center text-white">
                  <span className="text-[10px] uppercase tracking-[0.12em] text-white/75">{t('barcodeReady')}</span>
                  <div className="mt-2 grid grid-cols-4 gap-2 font-mono text-xl font-bold">
                    {([[t('day'), days], [t('hour'), hours], [t('minute'), minutes], [t('sec'), seconds]] as const).map(([label, value]) => (
                      <span key={label}><strong className="block">{String(value).padStart(2, '0')}</strong><small className="block text-[8px] font-sans tracking-[0.12em] text-white/60">{label}</small></span>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <Barcode seed={`${ticket.id}-${seat.id}-${refreshes}`} />
                  <span aria-hidden="true" className="animate-laser pointer-events-none absolute -top-2 bottom-[-8px] left-0 w-[10px] rounded-full bg-tm-blue-light shadow-[0_0_18px_6px_rgba(45,98,234,0.8)]" />
                </>
              )}
            </div>
          </div>
        </div>
        <div className="px-3 pb-3 pt-3">
          <hr className="mx-auto mb-3 w-[90%] border-white/30" />
          <dl className="grid grid-cols-3 gap-3 px-1">
            <div className="min-w-0">
              <dt className="text-[9px] font-bold uppercase leading-3 tracking-[0.12em] text-white/60">{t('section')}</dt>
              <dd className="mt-1 truncate text-[22px] font-extrabold leading-7">{seat.section}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[9px] font-bold uppercase leading-3 tracking-[0.12em] text-white/60">{t('row')}</dt>
              <dd className="mt-1 truncate text-[22px] font-extrabold leading-7">{seat.row}</dd>
            </div>
            <div className="min-w-0 text-right">
              <dt className="text-[9px] font-bold uppercase leading-3 tracking-[0.12em] text-white/60">{t('seat')}</dt>
              <dd className="mt-1 truncate text-[22px] font-extrabold leading-7">{seat.seat}</dd>
            </div>
          </dl>
          <button
            type="button"
            className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-tm-blue-light text-[12px] font-extrabold uppercase tracking-wide"
          >
            {t('mobileEntry')}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </li>
  )
}

export function Safetix({ ticket }: { ticket: Ticket }) {
  const { backToLanding } = useApp()
  const { locale, t } = useTranslation()
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const total = ticket.seats.length

  const updateIndex = (event: React.UIEvent<HTMLDivElement>) => {
    const cardWidth = event.currentTarget.clientWidth
    if (!cardWidth) return
    const nextIndex = Math.round(event.currentTarget.scrollLeft / cardWidth)
    setIndex(Math.min(total - 1, Math.max(0, nextIndex)))
  }

  return (
    <div className="compact-screen mx-auto flex h-full w-full max-w-[430px] flex-col overflow-x-hidden bg-[#111]">
      <header className="relative flex shrink-0 items-center justify-center px-12 pb-3 pt-[max(env(safe-area-inset-top),12px)]">
        <button
          type="button"
          onClick={backToLanding}
          aria-label={t('backMyEvents')}
          className="absolute left-3 top-[max(env(safe-area-inset-top),12px)] mt-1"
        >
          <ArrowLeft size={28} strokeWidth={2.4} />
        </button>
        <div className="min-w-0 flex-1 overflow-hidden text-center">
          <div className="overflow-hidden whitespace-nowrap">
            <div className="inline-flex animate-marquee gap-8 whitespace-nowrap text-[20px] font-extrabold leading-6">
              <span>{ticket.artist}</span><span aria-hidden="true">{ticket.artist}</span>
            </div>
          </div>
          <div className="overflow-hidden whitespace-nowrap">
            <div className="inline-flex animate-marquee-slow gap-8 whitespace-nowrap text-[13px] leading-5 text-white/80">
              <span>{dateLong(ticket.dateTime, locale)} - {ticket.venue}</span><span aria-hidden="true">{dateLong(ticket.dateTime, locale)} - {ticket.venue}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        {total === 0 ? (
          <p className="px-8 pt-20 text-center text-lg text-white/60">{t('noOrderTickets')}</p>
        ) : (
          <div
            aria-label={t('tickets')}
            onScroll={updateIndex}
            className="no-scrollbar flex h-full snap-x snap-mandatory scroll-smooth overflow-x-auto overflow-y-auto pt-2"
            style={{ touchAction: 'pan-x' }}
          >
            {ticket.seats.map((seat) => (
              <SeatSlide key={seat.id} ticket={ticket} seat={seat} />
            ))}
          </div>
        )}
      </div>

      {total > 0 && (
        <p
          aria-live="polite"
          className="mx-auto mb-4 mt-3 shrink-0 rounded-full bg-[#6a6a6a]/60 px-6 py-2 text-xl font-bold text-white/40"
        >
          {t('countOfTotal', { current: index + 1, total })}
        </p>
      )}

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/10 px-4 pb-[max(env(safe-area-inset-bottom),10px)] pt-2">
        <button
          type="button"
          aria-label={t('addToAppleWallet')}
          className="shrink-0 rounded-xl border border-white/10 bg-[#1a1a1a] p-3"
        >
          <AppleWalletBadge className="h-10 w-auto rounded-lg" />
        </button>
        <button
          type="button"
          onClick={() => setDetailsOpen(true)}
          className="flex h-[42px] flex-1 items-center justify-center gap-2 rounded-full border-2 border-white text-[13px] font-extrabold"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-white text-black">
            <Info size={17} strokeWidth={3} aria-hidden="true" />
          </span>
          {t('ticketInfoAction')}
        </button>
      </div>
      {detailsOpen && <TicketDetailsSheet ticket={ticket} onClose={() => setDetailsOpen(false)} />}
    </div>
  )
}
