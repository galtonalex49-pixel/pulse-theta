'use client'

import { useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Info, RefreshCw } from 'lucide-react'
import { useApp } from '@/lib/store'
import { dateLong } from '@/lib/format'
import type { Ticket } from '@/lib/types'
import { AppleWalletBadge } from '../icons'
import { Barcode } from './barcode'

function SeatSlide({ ticket, seat }: { ticket: Ticket; seat: Ticket['seats'][number] }) {
  const [refreshes, setRefreshes] = useState(0)

  return (
    <li className="w-[82%] min-w-0 shrink-0 snap-center">
      <div className="overflow-hidden rounded-t-xl bg-[#111]">
        <div className="bg-tm-blue py-3 text-center">
          <span className="text-[30px] font-extrabold italic tracking-tight">ticketmaster</span>
        </div>
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ticket.posterUrl}
            alt=""
            className="h-[400px] w-full object-cover object-top"
          />
          <div className="absolute inset-x-5 top-5 rounded-xl bg-[#1c1c1c]/95 px-5 pb-6 pt-5 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 flex-1 text-center text-lg">Screenshots won&apos;t get you in</p>
              <button
                type="button"
                aria-label="Refresh barcode"
                onClick={() => setRefreshes((r) => r + 1)}
                className="shrink-0 text-white"
              >
                <RefreshCw
                  size={22}
                  className="transition-transform duration-500"
                  style={{ transform: `rotate(${refreshes * 360}deg)` }}
                />
              </button>
            </div>
            <div className="relative mt-4 overflow-hidden px-1">
              <Barcode seed={`${ticket.id}-${seat.id}-${refreshes}`} />
              <span
                aria-hidden="true"
                className="animate-laser pointer-events-none absolute -top-2 bottom-[-8px] left-0 w-[10px] rounded-full bg-tm-blue-light shadow-[0_0_18px_6px_rgba(45,98,234,0.8)]"
              />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 max-w-[75%] bg-[#111] pb-4 pl-6 pr-6 pt-5">
            <p className="text-[26px] font-extrabold leading-tight">{ticket.purchaseType}</p>
            <p className="mt-1 text-xl text-white/70">Reserved Seating</p>
          </div>
        </div>
        <div className="px-6 pb-8 pt-2">
          <hr className="mx-auto mb-8 w-[80%] border-white/30" />
          <dl className="grid grid-cols-3">
            <div className="min-w-0">
              <dt className="text-lg font-bold uppercase tracking-widest text-white/60">Section</dt>
              <dd className="mt-3 truncate text-[44px] font-extrabold leading-none">{seat.section}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-lg font-bold uppercase tracking-widest text-white/60">Row</dt>
              <dd className="mt-3 truncate text-[44px] font-extrabold leading-none">{seat.row}</dd>
            </div>
            <div className="min-w-0 text-right">
              <dt className="text-lg font-bold uppercase tracking-widest text-white/60">Seat</dt>
              <dd className="mt-3 truncate text-[44px] font-extrabold leading-none">{seat.seat}</dd>
            </div>
          </dl>
          <button
            type="button"
            className="mt-10 flex h-[68px] w-full items-center justify-center gap-4 rounded-md bg-tm-blue-light text-2xl font-extrabold uppercase tracking-wide"
          >
            Mobile Entry
            <ArrowRight size={28} aria-hidden="true" />
          </button>
        </div>
      </div>
    </li>
  )
}

export function Safetix({ ticket }: { ticket: Ticket }) {
  const { backToLanding } = useApp()
  const scroller = useRef<HTMLUListElement>(null)
  const [index, setIndex] = useState(0)
  const total = ticket.seats.length

  const onScroll = () => {
    const el = scroller.current
    const first = el?.firstElementChild as HTMLElement | null
    if (!el || !first) return
    const step = first.offsetWidth + 16
    setIndex(Math.min(total - 1, Math.max(0, Math.round(el.scrollLeft / step))))
  }

  return (
    <div className="flex h-full flex-col bg-[#111]">
      <header className="relative flex shrink-0 items-center justify-center px-16 pb-4 pt-[max(env(safe-area-inset-top),20px)]">
        <button
          type="button"
          onClick={backToLanding}
          aria-label="Back to My Events"
          className="absolute left-5 top-[max(env(safe-area-inset-top),20px)] mt-1"
        >
          <ArrowLeft size={36} strokeWidth={2.4} />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <h1 className="truncate text-[24px] font-extrabold">{ticket.artist}</h1>
          <p className="mt-1 truncate text-lg">
            {dateLong(ticket.dateTime)} - {ticket.venue}
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1">
        {total === 0 ? (
          <p className="px-8 pt-20 text-center text-lg text-white/60">There are no tickets in this order.</p>
        ) : (
          <ul
            ref={scroller}
            onScroll={onScroll}
            aria-label="Tickets"
            className="no-scrollbar flex h-full snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-auto px-[9%] pt-4"
          >
            {ticket.seats.map((seat) => (
              <SeatSlide key={seat.id} ticket={ticket} seat={seat} />
            ))}
          </ul>
        )}
      </div>

      {total > 0 && (
        <p
          aria-live="polite"
          className="mx-auto mb-4 mt-3 shrink-0 rounded-full bg-[#6a6a6a]/60 px-6 py-2 text-xl font-bold text-white/40"
        >
          {index + 1} of {total}
        </p>
      )}

      <div className="flex shrink-0 items-center justify-between gap-4 border-t border-white/10 px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-4">
        <button
          type="button"
          aria-label="Add to Apple Wallet"
          className="shrink-0 rounded-xl border border-white/10 bg-[#1a1a1a] p-3"
        >
          <AppleWalletBadge className="h-[56px] w-auto rounded-lg" />
        </button>
        <button
          type="button"
          className="flex h-[68px] flex-1 items-center justify-center gap-4 rounded-full border-2 border-white text-2xl font-extrabold"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-white text-black">
            <Info size={24} strokeWidth={3} aria-hidden="true" />
          </span>
          Ticket Info
        </button>
      </div>
    </div>
  )
}
