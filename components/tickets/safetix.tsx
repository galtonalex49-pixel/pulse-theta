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
          <span className="text-[22px] font-extrabold italic leading-7 tracking-tight">ticketmaster</span>
        </div>
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ticket.posterUrl}
            alt=""
            className="h-[180px] w-full object-cover object-top"
          />
          <div className="absolute inset-x-3 top-3 rounded-xl bg-[#1c1c1c]/95 p-3 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 flex-1 text-center text-[13px] font-semibold leading-5">Screenshots won&apos;t get you in</p>
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
          <div className="absolute bottom-0 left-0 max-w-[75%] bg-[#111] px-4 pb-3 pt-3">
            <p className="truncate text-[16px] font-extrabold leading-5">{ticket.purchaseType}</p>
            <p className="mt-0.5 truncate text-[13px] leading-5 text-white/70">Reserved Seating</p>
          </div>
        </div>
        <div className="px-4 pb-5 pt-3">
          <hr className="mx-auto mb-4 w-[80%] border-white/30" />
          <dl className="grid grid-cols-3">
            <div className="min-w-0">
              <dt className="text-[10px] font-bold uppercase leading-4 tracking-[0.16em] text-white/60">Section</dt>
              <dd className="mt-1 truncate text-[24px] font-extrabold leading-7">{seat.section}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[10px] font-bold uppercase leading-4 tracking-[0.16em] text-white/60">Row</dt>
              <dd className="mt-1 truncate text-[24px] font-extrabold leading-7">{seat.row}</dd>
            </div>
            <div className="min-w-0 text-right">
              <dt className="text-[10px] font-bold uppercase leading-4 tracking-[0.16em] text-white/60">Seat</dt>
              <dd className="mt-1 truncate text-[24px] font-extrabold leading-7">{seat.seat}</dd>
            </div>
          </dl>
          <button
            type="button"
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-tm-blue-light text-[14px] font-extrabold uppercase tracking-wide"
          >
            Mobile Entry
            <ArrowRight size={18} aria-hidden="true" />
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
    <div className="compact-screen mx-auto flex h-full w-full max-w-[430px] flex-col overflow-x-hidden bg-[#111]">
      <header className="relative flex shrink-0 items-center justify-center px-12 pb-3 pt-[max(env(safe-area-inset-top),12px)]">
        <button
          type="button"
          onClick={backToLanding}
          aria-label="Back to My Events"
          className="absolute left-3 top-[max(env(safe-area-inset-top),12px)] mt-1"
        >
          <ArrowLeft size={28} strokeWidth={2.4} />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <h1 className="truncate text-[16px] font-extrabold leading-5">{ticket.artist}</h1>
          <p className="mt-0.5 truncate text-[11px] leading-4 text-white/80">
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
            className="no-scrollbar flex h-full snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-auto px-[9%] pt-2"
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

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/10 px-4 pb-[max(env(safe-area-inset-bottom),10px)] pt-2">
        <button
          type="button"
          aria-label="Add to Apple Wallet"
          className="shrink-0 rounded-xl border border-white/10 bg-[#1a1a1a] p-3"
        >
          <AppleWalletBadge className="h-10 w-auto rounded-lg" />
        </button>
        <button
          type="button"
          className="flex h-[42px] flex-1 items-center justify-center gap-2 rounded-full border-2 border-white text-[13px] font-extrabold"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-white text-black">
            <Info size={17} strokeWidth={3} aria-hidden="true" />
          </span>
          Ticket Info
        </button>
      </div>
    </div>
  )
}
