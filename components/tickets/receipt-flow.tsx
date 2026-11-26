'use client'

import { ArrowLeft } from 'lucide-react'
import type { Ticket } from '@/lib/types'
import { getTicketVenueLabel } from '@/lib/event-display'
import {
  formatPurchaseDate,
  formatReceiptAmount,
  getReceiptFees,
  getReceiptLineItems,
  getReceiptOrderDate,
  getReceiptSubtotal,
  getReceiptTotal,
} from '@/lib/receipt'

function displayOrderNumber(ticket: Ticket) {
  return ticket.orderNumber.replace(/^#/, '')
}

function formatEventDateTime(value: string) {
  const date = new Date(value)
  const dateLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date).toLocaleUpperCase('en-US')
  const timeLabel = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date)
  return `${dateLabel} • ${timeLabel}`
}

export function OrderDetailsSheet({
  ticket,
  onClose,
  onViewReceipt,
}: {
  ticket: Ticket
  onClose: () => void
  onViewReceipt: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55"
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose()
      }}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Close order details"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-details-title"
        className="fixed bottom-0 left-0 right-0 z-[1] mx-auto h-auto max-h-fit w-full max-w-[430px] rounded-t-2xl bg-white px-4 pb-5 pt-[10px] text-[#111116] shadow-2xl"
      >
        <div className="mx-auto h-1 w-9 rounded-full bg-[#D0D0D6]" />
        <h2 id="order-details-title" className="mt-[10px] border-b border-[#ECECF0] pb-3 pt-1 text-center text-base font-extrabold leading-5">
          Order Details
        </h2>
        <dl className="text-sm">
          <div className="flex items-center justify-between gap-4 border-b border-[#ECECF0] py-3 text-[14px] leading-5">
            <dt className="font-extrabold">Order Number</dt>
            <dd className="text-right font-normal">{displayOrderNumber(ticket)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-[#ECECF0] py-3 text-[14px] leading-5">
            <dt className="font-extrabold">Purchase Date</dt>
            <dd className="text-right font-normal">{formatPurchaseDate(ticket)}</dd>
          </div>
        </dl>
        <button
          type="button"
          autoFocus
          onClick={onViewReceipt}
          className="mt-[14px] h-11 w-full rounded-[4px] bg-[#0052E6] text-sm font-extrabold text-white transition-colors hover:bg-[#0048CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052E6] focus-visible:ring-offset-2"
        >
          View Receipt
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-[10px] h-11 w-full rounded-[4px] border border-[#D4D4DC] bg-white text-sm font-normal text-[#111116] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052E6]"
        >
          View Order
        </button>
      </section>
    </div>
  )
}

export function ReceiptLoading() {
  return (
    <section className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#F4F4F6] px-6 text-center text-[#1A1A1F]" aria-live="polite" aria-label="Retrieving order details">
      <div className="size-[52px] animate-spin rounded-full border-[5px] border-[#DCE6FA] border-t-[#0052E6]" aria-hidden="true" />
      <p className="mt-6 text-base font-extrabold">Retrieving Order Details.</p>
      <p className="mt-1.5 text-sm text-[#4A4A52]">Please wait a moment.</p>
      <div className="absolute inset-x-0 bottom-0 h-11 bg-[#DCDCE0]" />
    </section>
  )
}

export function TicketReceipt({ ticket, onBack }: { ticket: Ticket; onBack: () => void }) {
  const items = getReceiptLineItems(ticket)
  const orderNumber = displayOrderNumber(ticket)
  const currencyAmount = (amount: number) => formatReceiptAmount(ticket, amount)

  return (
    <section className="absolute inset-0 z-40 flex flex-col bg-[#F6F6F8] text-[#141418]">
      <header className="relative z-10 flex h-[60px] shrink-0 items-center justify-between bg-[#111114] px-4 text-white">
        <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Back to event tickets">
          <ArrowLeft size={18} aria-hidden="true" />
          Back
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[15px] font-extrabold">Receipt</h1>
        <a href="https://help.ticketmaster.com" target="_blank" rel="noopener noreferrer" className="text-[13px] text-[#E0E0E6]">Help</a>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-8 pt-6">
        <div className="mx-auto w-full max-w-[430px]">
          <div className="text-center">
            <p className="text-[15px] font-extrabold">Order #{orderNumber}</p>
            <p className="mt-1 text-[11px] text-[#5C5C66]">ORDER DATE: {getReceiptOrderDate(ticket)}</p>
          </div>

          <hr className="my-6 border-0 border-t border-[#C8C8CC]" />

          <section aria-label="Event details">
            <h2 className="text-[15px] font-extrabold uppercase leading-[1.25]">{ticket.artist}</h2>
            <p className="mt-1.5 text-[13px] leading-[1.35] text-[#2A2A32]">{getTicketVenueLabel(ticket)}</p>
            <p className="mt-1.5 text-xs uppercase text-[#2A2A32]">{formatEventDateTime(ticket.dateTime)}</p>
          </section>

          <hr className="my-6 border-0 border-t border-[#C8C8CC]" />

          <section aria-label="Ticket line items">
            <h2 className="mb-4 text-sm font-extrabold">Tickets</h2>
            <ul className="flex flex-col gap-4">
              {items.map(({ seat, label, unitPrice }) => (
                <li key={seat.id}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="max-w-[66%] text-xs font-extrabold uppercase leading-[1.25]">{label}</p>
                    <p className="shrink-0 text-[13px]">{currencyAmount(unitPrice)}</p>
                  </div>
                  <p className="mt-2 text-[11px] text-[#5C5C66]">Section {seat.section} Row {seat.row} Seat {seat.seat}</p>
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-6 flex items-center justify-between bg-[#ECECEF] px-3 py-2.5 text-[13px]">
            <span className="font-extrabold">Subtotal</span>
            <span className="font-extrabold">{currencyAmount(getReceiptSubtotal(ticket))}</span>
          </div>

          <section className="mt-5 text-xs" aria-label="Delivery and fees">
            <h2 className="mb-2 font-extrabold">Delivery</h2>
            <div className="flex items-center justify-between gap-4 text-[#2A2A32]">
              <span>{ticket.receipt?.deliveryMethod || 'Mobile App Only'}</span>
              <span className="uppercase">{ticket.receipt?.deliveryCostLabel || 'FREE'}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-4 text-[#2A2A32]">
              <span>Fees</span>
              <span>{currencyAmount(getReceiptFees(ticket))}</span>
            </div>
          </section>

          <div className="mt-5 flex items-center justify-between bg-[#ECECEF] px-3 py-3 text-sm">
            <span className="font-extrabold">Total</span>
            <span className="font-extrabold">{currencyAmount(getReceiptTotal(ticket))}</span>
          </div>

          <hr className="my-6 border-0 border-t border-[#C8C8CC]" />
          <footer>
            <h2 className="text-xs font-extrabold">{ticket.receipt?.disclaimerTitle || 'This is not a ticket'}</h2>
            <p className="mt-1 text-xs leading-[1.4] text-[#4A4A52]">{ticket.receipt?.disclaimerBody || 'Please be aware, this page cannot be used for entry to an event'}</p>
          </footer>
        </div>
      </div>
    </section>
  )
}
