'use client'

import { useEffect, useState } from 'react'
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
import { OrderDetailsSheet, ReceiptLoading, TicketReceipt } from './receipt-flow'

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
      <div className="relative flex h-full items-center justify-between gap-3 px-4 pt-2 text-white">
        <button
          type="button"
          onClick={backToLanding}
          aria-label={t('backMyEvents')}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-black/55 shadow-lg"
        >
          <ArrowLeft size={20} />
        </button>
        {scrolled && (
          <div className="min-w-0 flex-1 text-center">
            <p className="type-event-title truncate text-sm font-extrabold">{ticket.artist}</p>
            <p className="truncate text-xs text-white/80">{ticket.venue}</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => openSafetix(ticket.id)}
          aria-label={t('viewBarcodeTickets')}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#0052E6] shadow-[0_0_20px_rgba(0,82,230,0.45)]"
        >
          <ScanBarcode size={20} />
        </button>
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
    <li className="mb-[10px] overflow-hidden rounded-md bg-[#16161A]">
      <div className="bg-[#1E1E24] px-3 py-2 text-xs font-normal leading-[18px] text-[#D8D8E0]">{ticket.ticketTypeOverride || ticket.purchaseType}</div>
      <div className="grid grid-cols-3 px-3 pb-3 pt-2.5">
        <div className="min-w-0">
          <p className="text-[10px] font-normal uppercase leading-4 tracking-wide text-[#9E9EA8]">{t('section')}</p>
          <p className="mt-0.5 truncate text-base font-extrabold leading-[18px]">{seat.section}</p>
        </div>
        <div className="min-w-0 text-center">
          <p className="text-[10px] font-normal uppercase leading-4 tracking-wide text-[#9E9EA8]">{t('row')}</p>
          <p className="mt-0.5 truncate text-base font-extrabold leading-[18px]">{seat.row}</p>
        </div>
        <div className="min-w-0 text-right">
          <p className="text-[10px] font-normal uppercase leading-4 tracking-wide text-[#9E9EA8]">{t('seat')}</p>
          <p className="mt-0.5 truncate text-base font-extrabold leading-[18px]">{seat.seat}</p>
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
  const { t } = useTranslation()
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
          {dateBadge(ticket.dateTime)}
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
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [tab, setTab] = useState<'tickets' | 'extras'>('tickets')
  const [transferOpen, setTransferOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareSaved, setShareSaved] = useState(false)
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false)
  const [screen, setScreen] = useState<'event' | 'loading' | 'receipt'>('event')
  const count = ticket.seats.length

  useEffect(() => {
    if (screen !== 'loading') return
    const timer = window.setTimeout(() => setScreen('receipt'), 2800)
    return () => window.clearTimeout(timer)
  }, [screen])

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

  if (screen === 'loading' || screen === 'receipt') {
    return (
      <div className="compact-screen relative mx-auto h-full w-full max-w-[430px] overflow-hidden bg-[#F4F4F6]">
        {screen === 'loading' ? <ReceiptLoading /> : <TicketReceipt ticket={ticket} onBack={() => setScreen('event')} />}
      </div>
    )
  }

  return (
    <div className="compact-screen relative mx-auto h-full w-full max-w-[430px] overflow-x-hidden bg-black">
      <div
        className="no-scrollbar h-full overflow-y-auto"
        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 210)}
      >
        <StickyHeader ticket={ticket} scrolled={scrolled} />

        <div className="relative aspect-[16/9] w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ticket.posterUrl} alt="" className="h-full w-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black" />
          <p className="absolute bottom-0 left-0 max-w-[94%] truncate rounded-tr-md bg-black px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-white">
            {dateBadge(ticket.dateTime)}
          </p>
        </div>

        <section className="bg-black px-4 pt-3" aria-label={t('myTickets')}>
          <h1 className="type-event-title line-clamp-2 break-words text-[17px] font-extrabold uppercase leading-[1.2] text-white" style={{ lineHeight: 1.2 }}>
            {ticket.artist}
          </h1>
          <div className="my-3 h-px w-full bg-[#2d2d2d]" aria-hidden="true" />
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 max-w-[82%] text-sm leading-[1.35] text-[#C8C8D2]">{ticket.venueLocation || ticket.venue}</p>
            <span className="flex shrink-0 items-center gap-1.5 text-[13px] font-extrabold text-white">
              <DualTicketIcon size={16} />
              x{count}
            </span>
          </div>
          <button
            type="button"
            onClick={() => openSafetix(ticket.id)}
            className="mt-[6px] mb-[14px] flex h-11 w-full items-center justify-center gap-2 rounded-[4px] bg-[#0052E6] text-sm font-extrabold text-white"
          >
            <ScanBarcode size={20} aria-hidden="true" />
            {t('viewTickets')}
          </button>
        </section>

        <div
          role="tablist"
          aria-label={t('tickets')}
          className="sticky z-20 grid grid-cols-2 border-b border-[#26262C] bg-black"
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
                className={`relative h-11 text-sm ${active ? 'font-extrabold text-white' : 'font-normal text-[#9E9EA8]'}`}
              >
                {label}
                <span className={`absolute inset-x-0 bottom-0 ${active ? 'h-[3px] bg-white' : 'h-[3px] bg-transparent'}`} />
              </button>
            )
          })}
        </div>

        {tab === 'tickets' ? (
          <div className="px-4 pb-0">
            <div className="-mx-4 flex items-start justify-between px-4 pb-[10px] pt-[14px]">
              <div className="min-w-0">
                <h2 className="truncate text-[13px] font-extrabold">
                  {t('order')} {ticket.orderNumber.startsWith('#') ? ticket.orderNumber : `#${ticket.orderNumber}`}
                </h2>
                <p className="mt-1 text-[11px] text-[#A0A0AA]">
                  x{count} {count === 1 ? t('ticket') : t('ticketsPlural')}
                </p>
              </div>
              <EllipsisVertical size={18} className="mt-1 shrink-0 text-white" aria-hidden="true" />
            </div>

            <ul className="mt-1">
              {ticket.seats.map((seat) => (
                <SeatCard key={seat.id} ticket={ticket} seat={seat} />
              ))}
            </ul>

            <h2 className="mb-[10px] mt-[22px] text-[13px] font-extrabold uppercase tracking-[0.03em] text-white" style={{ letterSpacing: '0.03em' }}>{t('moreOptions')}</h2>
            <div className="isolate relative h-[220px] w-full overflow-hidden rounded-t-md bg-[#1C1C21]">
              <TicketMap lat={ticket.lat} lng={ticket.lng} name={ticket.venue} />
              <p className="pointer-events-none absolute left-3 top-3 z-[500] max-w-[85%] truncate text-[15px] font-extrabold leading-snug text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.7)]">
                {ticket.venue}
              </p>
            </div>
            <a
              href={directions}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-full items-center justify-center rounded-b-md bg-[#1C1C21] text-[13px] font-extrabold text-white"
            >
              {t('getDirections')}
            </a>

            <section className="mb-[90px] mt-[14px] rounded-md bg-[#16161A] p-[14px]" aria-label={t('shareYourTickets')}>
              <div className="grid grid-cols-[1.15fr_.85fr] gap-3">
                <div className="relative h-[142px] overflow-hidden rounded-sm bg-[#25252A]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ticket.posterUrl} alt="" className="h-full w-full object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                  <div className="absolute inset-x-2 bottom-2 text-white">
                    <p className="text-[8px] font-extrabold uppercase tracking-wide text-white/80">{dateBadge(ticket.dateTime)}</p>
                    <p className="mt-1 line-clamp-2 text-[10px] font-extrabold uppercase leading-tight">{ticket.artist}</p>
                    <p className="mt-1 line-clamp-1 text-[8px] text-white/80">{ticket.venueLocation || ticket.venue}</p>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center px-1 text-center">
                  <p className="text-[15px] font-extrabold uppercase leading-[1.25] text-white">You got tickets!</p>
                  <span className="mt-3 h-px w-10 bg-white" />
                </div>
              </div>
              <h3 className="mt-[14px] text-[15px] font-extrabold text-white">{t('postSocial')}</h3>
              <p className="mt-1 text-xs leading-snug text-[#B0B0BA]">{t('socialDescription')}</p>
              <button
                type="button"
                onClick={share}
                className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-[4px] bg-[#0052E6] text-sm font-extrabold text-white"
              >
                {t('shareYoureGoing')}
                <Share size={16} aria-hidden="true" />
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

      <div className="fixed bottom-[14px] left-1/2 z-30 flex w-[calc(100%-32px)] max-w-[398px] -translate-x-1/2 items-center rounded-full bg-white px-2 py-2 text-black shadow-[0_6px_24px_rgba(0,0,0,0.6)]">
        <button
          type="button"
          onClick={() => setOrderDetailsOpen(true)}
          className="flex min-h-[42px] flex-1 flex-col items-center justify-center gap-0.5 px-2 text-[#222226]"
        >
          <ArrowUp size={20} aria-hidden="true" />
          <span className="text-[11px]">{t('upgrade')}</span>
        </button>
        <span className="h-10 w-px bg-[#E5E5EA]" />
        <button
          type="button"
          onClick={() => setTransferOpen(true)}
          disabled={count === 0}
          className="flex min-h-[42px] flex-1 flex-col items-center justify-center gap-0.5 px-2 text-[#0052E6] disabled:opacity-40"
        >
          <ArrowUpRight size={23} aria-hidden="true" />
          <span className="text-[11px] text-[#222226]">{t('transfer')}</span>
        </button>
        <span className="h-10 w-px bg-[#E5E5EA]" />
        <button type="button" className="flex min-h-[42px] flex-1 flex-col items-center justify-center gap-0.5 px-2 text-[#222226]">
          <RefreshCw size={20} aria-hidden="true" />
          <span className="text-[11px]">{t('sell')}</span>
        </button>
      </div>

      {transferOpen && <TransferModal ticket={ticket} onClose={() => setTransferOpen(false)} />}
      {orderDetailsOpen && (
        <OrderDetailsSheet
          ticket={ticket}
          onClose={() => setOrderDetailsOpen(false)}
          onViewReceipt={() => {
            setOrderDetailsOpen(false)
            setScreen('loading')
          }}
        />
      )}

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
