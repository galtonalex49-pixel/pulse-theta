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
          aria-label="Back to My Events"
          className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-[#222]/90 shadow-lg"
        >
          <ArrowLeft size={26} />
        </button>
        {scrolled ? (
          <>
            <div className="min-w-0 flex-1 text-center">
              <p className="truncate text-xl font-extrabold">{ticket.artist}</p>
              <p className="truncate text-base text-white/80">{ticket.venue}</p>
            </div>
            <button
              type="button"
              onClick={() => openSafetix(ticket.id)}
              aria-label="View barcode tickets"
              className="flex h-[52px] w-[72px] shrink-0 items-center justify-center rounded-full bg-tm-blue shadow-[0_0_20px_rgba(31,79,216,0.6)]"
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
            Help
          </a>
        )}
      </div>
    </div>
  )
}

function SeatCard({ ticket, seat }: { ticket: Ticket; seat: Ticket['seats'][number] }) {
  return (
    <li className="mb-6">
      <div className="bg-[#232323] px-3 py-2.5 text-[14px] font-bold leading-[18px]">{ticket.ticketTypeOverride || ticket.purchaseType}</div>
      <div className="mt-0.5 grid grid-cols-3 bg-[#1a1a1a] px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase leading-4 tracking-wide text-white/60">Section</p>
          <p className="mt-1 truncate text-[14px] font-extrabold leading-[18px]">{seat.section}</p>
        </div>
        <div className="min-w-0 text-center">
          <p className="text-[11px] font-bold uppercase leading-4 tracking-wide text-white/60">Row</p>
          <p className="mt-1 truncate text-[14px] font-extrabold leading-[18px]">{seat.row}</p>
        </div>
        <div className="min-w-0 text-right">
          <p className="text-[11px] font-bold uppercase leading-4 tracking-wide text-white/60">Seat</p>
          <p className="mt-1 truncate text-[14px] font-extrabold leading-[18px]">{seat.seat}</p>
        </div>
      </div>
      {seat.transferStatus && (
        <div className="flex items-center gap-5 bg-white px-6 py-5 text-black">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#6b6b6b]">
            <ArrowUpRight size={24} className="text-white" aria-hidden="true" />
          </span>
          <p className="min-w-0 truncate text-[22px]">{seat.transferStatus}</p>
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

export function OrderDetails({ ticket }: { ticket: Ticket }) {
  const { openSafetix } = useApp()
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

        <section className="relative -mt-9 px-4" aria-label="Event summary">
          <span className="inline-block max-w-[90%] truncate bg-[#1a1a1a] px-6 pb-3 pt-4 text-[16px] font-extrabold uppercase tracking-wide">
            {dateBadge(ticket.dateTime)}
          </span>
          <div className="bg-[#1a1a1a] px-6 pb-6 pt-3">
            <h1 className="line-clamp-2 break-words text-[20px] font-extrabold uppercase leading-6">{ticket.artist}</h1>
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
            View Tickets
          </button>
        </section>

        <div
          role="tablist"
          aria-label="Order sections"
          className="sticky z-20 mt-8 grid grid-cols-2 gap-4 bg-[#111] px-5 pt-1"
          style={{ top: HEADER_H }}
        >
          {(
            [
              ['tickets', 'Tickets'],
              ['extras', 'Extras'],
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
                <h2 className="truncate text-[20px] font-semibold">Order #{ticket.orderNumber}</h2>
                <p className="mt-2 text-xl text-white/70">
                  x{count} {count === 1 ? 'Ticket' : 'Tickets'}
                </p>
              </div>
              <EllipsisVertical size={26} className="mt-2 shrink-0" aria-hidden="true" />
            </div>

            <ul className="mt-8">
              {ticket.seats.map((seat) => (
                <SeatCard key={seat.id} ticket={ticket} seat={seat} />
              ))}
            </ul>

            <h2 className="mb-5 mt-14 text-[30px] font-extrabold uppercase">More Options</h2>
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
              Get Directions
            </a>

            <section className="mt-14" aria-label="Share your tickets">
              <div className="relative mx-auto aspect-square w-full max-w-[360px] overflow-hidden bg-[#1a1a1a]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ticket.posterUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover object-top"
                />
                <div className="absolute inset-y-0 right-0 w-1/2 bg-black/55" />
                <p className="absolute right-5 top-14 w-[42%] text-[34px] font-extrabold uppercase leading-[1.1]">
                  You Got
                  <br />
                  <span className="inline-block border-b-4 border-white pb-1">Tickets!</span>
                </p>
                <div className="absolute bottom-0 left-0 w-[66%] bg-[#1a1a1a]/95 px-5 pb-5 pt-4">
                  <p className="truncate text-[13px] font-extrabold uppercase tracking-wide">
                    {dateBadge(ticket.dateTime)}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xl font-extrabold uppercase leading-tight">
                    {ticket.artist}
                  </p>
                  <p className="mt-1 truncate text-base text-white/70">{ticket.venue}</p>
                </div>
              </div>
              <div className="mx-auto max-w-[360px] bg-[#1a1a1a] px-6 py-8">
                <h3 className="text-[30px] font-extrabold">Post on Social Media</h3>
                <p className="mt-4 text-xl leading-snug text-white/60">
                  Build hype for the event, and share that you got tickets with your friends and family.
                </p>
              </div>
              <button
                type="button"
                onClick={share}
                className="flex h-[78px] w-full items-center justify-center gap-5 bg-[#6a6a6a] text-2xl font-extrabold"
              >
                Share You&apos;re Going
                <Share size={30} aria-hidden="true" />
              </button>
            </section>
          </div>
        ) : (
          <div className="space-y-5 px-4 pb-44 pt-8">
            <ExtraCard tag="PARKING" title="Official Parking" description="Guaranteed spot near the venue" action="Add to Apple Wallet" />
            <ExtraCard tag="UPGRADE" title="VIP Lounge Access" description="Private bar, restrooms, and early entry" action="View Details" outlined />
            <ExtraCard tag="VENUE INFO" title="Bag Policy" description="Clear bag policy is in effect at this venue." action="View Info" outlined />
            <ExtraCard tag="MERCH" title={`${ticket.artist} Merchandise`} description="Shop official event merchandise before doors open." action="Shop Merch" outlined />
          </div>
        )}
      </div>

      <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-stretch rounded-full bg-white px-3 py-3 text-black shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <button
          type="button"
          disabled
          className="flex w-[84px] flex-col items-center gap-1 px-2 text-black/35"
        >
          <ArrowUp size={30} aria-hidden="true" />
          <span className="text-lg">Upgrade</span>
        </button>
        <span className="my-1 w-px bg-black/15" />
        <button
          type="button"
          onClick={() => setTransferOpen(true)}
          disabled={count === 0}
          className="flex w-[96px] flex-col items-center gap-1 px-2 text-tm-blue disabled:opacity-40"
        >
          <ArrowUpRight size={30} aria-hidden="true" />
          <span className="text-lg text-black/70">Transfer</span>
        </button>
        <span className="my-1 w-px bg-black/15" />
        <button type="button" className="flex w-[84px] flex-col items-center gap-1 px-2 text-tm-blue">
          <RefreshCw size={30} aria-hidden="true" />
          <span className="text-lg text-black/70">Sell</span>
        </button>
      </div>

      {transferOpen && <TransferModal ticket={ticket} onClose={() => setTransferOpen(false)} />}

      {shareOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-5" role="dialog" aria-modal="true" aria-labelledby="share-card-title">
          <div className="max-h-full w-full max-w-md overflow-y-auto rounded-2xl border border-white/15 bg-[#151515] p-4 shadow-2xl">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#090909]">
              <img src={ticket.posterUrl} alt="" className="h-full w-full object-cover object-top opacity-75" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/95" />
              <div className="absolute inset-x-5 top-6 text-center">
                <p className="text-2xl font-extrabold uppercase tracking-wide">I Got Tickets!</p>
                <div className="mx-auto mt-3 h-0.5 w-2/3 bg-white/70" />
              </div>
              <div className="absolute inset-x-5 bottom-6">
                <p className="text-xs font-extrabold uppercase tracking-wide text-white/70">{dateBadge(ticket.dateTime)}</p>
                <h2 id="share-card-title" className="mt-3 text-2xl font-extrabold uppercase leading-tight">{ticket.artist}</h2>
                <p className="mt-2 text-base text-white/70">{ticket.venue}</p>
              </div>
            </div>
            <button type="button" onClick={saveShareCard} className="mt-4 h-14 w-full rounded-lg bg-tm-blue text-lg font-extrabold">{shareSaved ? 'Saved to Photos ✓' : 'Save to Photos'}</button>
            <button type="button" onClick={() => setShareOpen(false)} className="mt-2 h-12 w-full text-base font-bold text-white/60">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
