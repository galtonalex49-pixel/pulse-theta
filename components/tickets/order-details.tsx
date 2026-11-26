'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import {
  ArrowLeft,
  ArrowUp,
  ArrowUpRight,
  EllipsisVertical,
  RefreshCw,
  ScanBarcode,
  Share,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { useTranslation } from '@/lib/use-translation'
import { dateBadge } from '@/lib/format'
import type { Ticket } from '@/lib/types'
import { DualTicketIcon } from '../icons'
import { TransferModal } from './transfer-modal'

const TicketMap = dynamic(() => import('./ticket-map'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-[#222]" />,
})

const HEADER_H = 88

function StickyHeader({ ticket, scrolled }: { ticket: Ticket; scrolled: boolean }) {
  const { backToLanding, openSafetix } = useApp()
  const { t } = useTranslation()
  return (
    <div
      className="sticky top-0 z-30 -mb-[88px] overflow-hidden"
      style={{ height: HEADER_H }}
    >
      <div
        aria-hidden="true"
        className={`absolute inset-0 transition-opacity duration-200 ${scrolled ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ticket.posterUrl} alt="" className="h-full w-full object-cover object-top" />
        <div className="absolute inset-0 bg-black/55" />
      </div>
      <div className="relative flex h-full items-center justify-between gap-3 px-4 pt-2">
        <button
          type="button"
          onClick={backToLanding}
          aria-label={t('backMyEvents')}
          className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-[#222]/90 shadow-lg"
        >
          <ArrowLeft size={26} />
        </button>
        {scrolled ? (
          <>
            <div className="min-w-0 flex-1 text-center">
              <p className="type-event-title truncate text-xl font-extrabold">{ticket.artist}</p>
              <p className="truncate text-base text-white/80">{ticket.venue}</p>
            </div>
            <button
              type="button"
              onClick={() => openSafetix(ticket.id)}
              aria-label={t('viewBarcodeTickets')}
              className="flex h-[52px] w-[72px] shrink-0 items-center justify-center rounded-full bg-tm-blue shadow-[0_0_20px_rgba(0,82,230,0.6)]"
            >
              <ScanBarcode size={28} />
            </button>
          </>
        ) : (
          <a
            href="https://help.ticketmaster.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[52px] shrink-0 items-center rounded-full bg-[#222]/90 px-8 text-xl font-bold shadow-lg"
          >
            {t('help')}
          </a>
        )}
      </div>
    </div>
  )
}

function SeatCard({ ticket, seat }: { ticket: Ticket; seat: Ticket['seats'][number] }) {
  const { t } = useTranslation()
  const transferStatus = seat.transferStatus.startsWith('Transfer Pending: ')
    ? t('transferPending', { name: seat.transferStatus.slice('Transfer Pending: '.length) })
    : seat.transferStatus.startsWith('Transfer Accepted: ')
      ? t('transferAccepted', { name: seat.transferStatus.slice('Transfer Accepted: '.length) })
      : seat.transferStatus
  return (
    <li className="mb-6">
      <div className="bg-[#232323] px-3 py-2.5 text-[14px] font-bold leading-[18px]">{ticket.ticketTypeOverride || ticket.purchaseType}</div>
      <div className="mt-0.5 grid grid-cols-3 bg-[#1a1a1a] px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase leading-4 tracking-wide text-white/60">{t('section')}</p>
          <p className="mt-1 truncate text-[14px] font-extrabold leading-[18px]">{seat.section}</p>
        </div>
        <div className="min-w-0 text-center">
          <p className="text-[11px] font-bold uppercase leading-4 tracking-wide text-white/60">{t('row')}</p>
          <p className="mt-1 truncate text-[14px] font-extrabold leading-[18px]">{seat.row}</p>
        </div>
        <div className="min-w-0 text-right">
          <p className="text-[11px] font-bold uppercase leading-4 tracking-wide text-white/60">{t('seat')}</p>
          <p className="mt-1 truncate text-[14px] font-extrabold leading-[18px]">{seat.seat}</p>
        </div>
      </div>
      {seat.transferStatus && (
        <div className="flex items-center gap-5 bg-white px-6 py-5 text-black">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#6b6b6b]">
            <ArrowUpRight size={24} className="text-white" aria-hidden="true" />
          </span>
          <p className="min-w-0 truncate text-[22px]">{transferStatus}</p>
        </div>
      )}
    </li>
  )
}

function ExtraCard({
  tag,
  title,
  description,
  action,
  outlined = false,
}: {
  tag: string
  title: string
  description: string
  action: string
  outlined?: boolean
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-5 shadow-lg">
      <span className="inline-flex rounded-md bg-tm-blue/20 px-3 py-1 text-xs font-extrabold tracking-wider text-tm-blue-light">{tag}</span>
      <h2 className="mt-5 text-2xl font-extrabold">{title}</h2>
      <p className="mt-2 text-base leading-snug text-white/60">{description}</p>
      <button type="button" className={`mt-6 h-14 w-full rounded-lg text-base font-extrabold ${outlined ? 'border border-tm-blue-light text-tm-blue-light' : 'bg-tm-blue text-white'}`}>
        {action}
      </button>
    </article>
  )
}

function EventShareCard({ ticket, shape }: { ticket: Ticket; shape: 'square' | 'story' }) {
  const { locale, t } = useTranslation()
  const isSquare = shape === 'square'

  return (
    <div
      className={`relative mx-auto overflow-hidden bg-[#111] ${
        isSquare ? 'aspect-square w-full max-w-[360px]' : 'aspect-[9/16] w-full max-w-[320px]'
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ticket.posterUrl}
        alt=""
        className="absolute inset-0 h-full w-full scale-110 object-cover object-top opacity-60 blur-2xl"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/15 to-black/80" />
      <div className="absolute inset-x-4 top-[9%] text-center">
        <p
          className={`font-black uppercase tracking-wide text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.55)] ${
            isSquare ? 'text-xl' : 'text-[clamp(22px,6vw,34px)]'
          }`}
        >
          {t('iGotTickets')}
        </p>
        <div className="mx-auto mt-2 h-[5px] w-[64%] bg-tm-blue" />
      </div>
      <div
        className={`absolute inset-x-[8%] overflow-hidden bg-[#e6e6e6] ${
          isSquare ? 'top-[25%] h-[36%]' : 'top-[27%] h-[39%]'
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ticket.posterUrl} alt="" className="h-full w-full object-cover object-top" />
      </div>
      <div
        className={`absolute inset-x-[8%] bg-[#101010] text-white ${
          isSquare ? 'bottom-[8%] min-h-[27%] px-4 py-3' : 'bottom-[8%] min-h-[29%] px-5 py-4'
        }`}
      >
        <p className={`truncate font-semibold tracking-wide text-white/75 ${isSquare ? 'text-[10px]' : 'text-xs'}`}>
          {dateBadge(ticket.dateTime, locale)}
        </p>
        <h2 className={`type-event-title mt-2 line-clamp-2 font-extrabold uppercase leading-tight ${isSquare ? 'text-base' : 'text-xl'}`}>
          {ticket.artist}
        </h2>
        <p className={`mt-2 truncate text-white/75 ${isSquare ? 'text-xs' : 'text-sm'}`}>
          {ticket.venueLocation || ticket.venue}
        </p>
      </div>
    </div>
  )
}

export function OrderDetails({ ticket }: { ticket: Ticket }) {
  const { openSafetix } = useApp()
  const { locale, t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [tab, setTab] = useState<'tickets' | 'extras'>('tickets')
  const [transferOpen, setTransferOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareSaved, setShareSaved] = useState(false)
  const count = ticket.seats.length

  const directions = `https://www.google.com/maps/dir/?api=1&destination=${ticket.lat},${ticket.lng}`

  const share = () => {
    setShareSaved(false)
    setShareOpen(true)
  }

  const saveShareCard = () => {
    const link = document.createElement('a')
    link.href = ticket.posterUrl
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.download = `${ticket.artist.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-tickets.jpg`
    document.body.appendChild(link)
    link.click()
    link.remove()
    setShareSaved(true)
  }

  return (
    <div className="compact-screen relative mx-auto h-full w-full max-w-[430px] overflow-x-hidden bg-[#111]">
      <div
        className="no-scrollbar h-full overflow-y-auto"
        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 210)}
      >
        <StickyHeader ticket={ticket} scrolled={scrolled} />

        <div className="relative h-[310px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ticket.posterUrl} alt="" className="h-full w-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#111]" />
        </div>

        <section className="relative -mt-9 px-4" aria-label={t('myEvents')}>
          <span className="inline-block max-w-[90%] truncate bg-[#1a1a1a] px-6 pb-3 pt-4 text-[16px] font-extrabold uppercase tracking-wide">
{dateBadge(ticket.dateTime, locale)}
          </span>
          <div className="bg-[#1a1a1a] px-6 pb-6 pt-3">
            <h1 className="type-event-title line-clamp-2 break-words text-[20px] font-extrabold uppercase leading-6">{ticket.artist}</h1>
            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-xl text-white/70">{ticket.venue}</p>
              <span className="flex shrink-0 items-center gap-2 text-xl font-bold">
                <DualTicketIcon size={22} />
                x{count}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openSafetix(ticket.id)}
            className="flex h-[62px] w-full items-center justify-center gap-3 bg-tm-blue text-[24px] font-bold"
          >
            <ScanBarcode size={30} aria-hidden="true" />
            {t('viewTickets')}
          </button>
        </section>

        <div
          role="tablist"
          aria-label={t('tickets')}
          className="sticky z-20 mt-8 grid grid-cols-2 gap-4 bg-[#111] px-5 pt-1"
          style={{ top: HEADER_H }}
        >
          {(
            [
              ['tickets', t('tickets')],
              ['extras', t('extras')],
            ] as const
          ).map(([id, label]) => {
            const active = tab === id
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(id)}
                className={`relative h-14 text-xl font-bold ${active ? 'text-white' : 'text-white/55'}`}
              >
                {label}
                <span className={`absolute inset-x-0 bottom-0 ${active ? 'h-1.5 bg-white' : 'h-1 bg-white/20'}`} />
              </button>
            )
          })}
        </div>

        {tab === 'tickets' ? (
          <div className="px-4 pb-44 pt-10">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <h2 className="truncate text-[20px] font-semibold">
                  {t('order')} {ticket.orderNumber.startsWith('#') ? ticket.orderNumber : `#${ticket.orderNumber}`}
                </h2>
                <p className="mt-2 text-xl text-white/70">
                  x{count} {count === 1 ? t('ticket') : t('ticketsPlural')}
                </p>
              </div>
              <EllipsisVertical size={26} className="mt-2 shrink-0" aria-hidden="true" />
            </div>

            <ul className="mt-8">
              {ticket.seats.map((seat) => (
                <SeatCard key={seat.id} ticket={ticket} seat={seat} />
              ))}
            </ul>

            <h2 className="mb-5 mt-14 text-[30px] font-extrabold uppercase">{t('moreOptions')}</h2>
            <div className="isolate relative h-[280px] w-full overflow-hidden bg-[#1a1a1a]">
              <TicketMap lat={ticket.lat} lng={ticket.lng} name={ticket.venue} />
              <p className="pointer-events-none absolute left-4 top-3 z-[500] max-w-[85%] truncate text-[34px] font-extrabold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.7)]">
                {ticket.venue}
              </p>
            </div>
            <a
              href={directions}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-[66px] w-full items-center justify-center bg-[#1a1a1a] text-[24px] font-extrabold"
            >
              {t('getDirections')}
            </a>

            <section className="mt-14" aria-label={t('shareYourTickets')}>
              <EventShareCard ticket={ticket} shape="square" />
              <div className="mx-auto max-w-[360px] bg-[#1a1a1a] px-6 py-8">
                <h3 className="text-[30px] font-extrabold">{t('postSocial')}</h3>
                <p className="mt-4 text-xl leading-snug text-white/60">
                  {t('socialDescription')}
                </p>
              </div>
              <button
                type="button"
                onClick={share}
                className="flex h-[78px] w-full items-center justify-center gap-5 bg-[#6a6a6a] text-2xl font-extrabold"
              >
                {t('shareYoureGoing')}
                <Share size={30} aria-hidden="true" />
              </button>
            </section>
          </div>
        ) : (
          <div className="space-y-5 px-4 pb-44 pt-8">
            <ExtraCard tag={t('tagParking')} title={t('officialParking')} description={t('guaranteedSpot')} action={t('addToWallet')} />
            <ExtraCard tag={t('tagUpgrade')} title={t('vipLoungeAccess')} description={t('vipDescription')} action={t('viewDetails')} outlined />
            <ExtraCard tag={t('tagVenueInfo')} title={t('bagPolicy')} description={t('clearBagPolicy')} action={t('viewInfo')} outlined />
            <ExtraCard tag={t('tagMerch')} title={t('merchandise', { name: ticket.artist })} description={t('merchDescription')} action={t('shopMerch')} outlined />
          </div>
        )}
      </div>

      <div className="absolute bottom-5 left-1/2 z-30 flex h-[68px] w-[calc(100%-32px)] max-w-[360px] -translate-x-1/2 items-center rounded-full bg-white px-2 text-black shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <button
          type="button"
          disabled
          className="flex h-full flex-1 flex-col items-center justify-center gap-0.5 px-2 text-black/35"
        >
          <ArrowUp size={23} aria-hidden="true" />
          <span className="text-[15px]">{t('upgrade')}</span>
        </button>
        <span className="h-10 w-px bg-black/15" />
        <button
          type="button"
          onClick={() => setTransferOpen(true)}
          disabled={count === 0}
          className="flex h-full flex-1 flex-col items-center justify-center gap-0.5 px-2 text-tm-blue disabled:opacity-40"
        >
          <ArrowUpRight size={23} aria-hidden="true" />
          <span className="text-[15px] text-black/70">{t('transfer')}</span>
        </button>
        <span className="h-10 w-px bg-black/15" />
        <button type="button" className="flex h-full flex-1 flex-col items-center justify-center gap-0.5 px-2 text-black/55">
          <RefreshCw size={23} aria-hidden="true" />
          <span className="text-[15px]">{t('sell')}</span>
        </button>
      </div>

      {transferOpen && <TransferModal ticket={ticket} onClose={() => setTransferOpen(false)} />}

      {shareOpen && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-card-title"
        >
          <div className="max-h-[calc(100dvh-40px)] w-full max-w-md overflow-y-auto rounded-2xl border border-white/15 bg-[#151515] p-4 shadow-2xl">
            <h2 id="share-card-title" className="sr-only">{t('shareTicketsFor', { name: ticket.artist })}</h2>
            <EventShareCard ticket={ticket} shape="story" />
            <button
              type="button"
              onClick={saveShareCard}
              className="mt-4 h-14 w-full rounded-lg bg-tm-blue text-lg font-extrabold"
            >
              {shareSaved ? t('savedToPhotos') : t('saveToPhotos')}
            </button>
            <button
              type="button"
              onClick={() => setShareOpen(false)}
              className="mt-2 h-12 w-full text-base font-bold text-white/60"
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
