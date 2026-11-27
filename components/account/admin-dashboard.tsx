'use client'

import { useEffect, useId, useState } from 'react'
import useSWR from 'swr'
import { ArrowDown, ArrowLeft, ArrowUp, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import { resizeSeats, useApp } from '@/lib/store'
import { dateBadge, generateOrderNumber } from '@/lib/format'
import { getCurrencyForCountry, getCurrencyPrefix } from '@/lib/currency'
import { getTicketVenueLabel } from '@/lib/event-display'
import type { ReceiptSettings, Seat, TMEvent, Ticket } from '@/lib/types'
import { getPurchaseDate, getReceiptOrderDate, getReceiptSubtotal, getReceiptTotal } from '@/lib/receipt'
import { DualTicketIcon } from '../icons'

const fetchEvents = async (url: string): Promise<{ events: TMEvent[] }> => {
  try {
    const response = await fetch(url)
    if (!response.ok) return { events: [] }
    const payload = await response.json()
    return { events: Array.isArray(payload?.events) ? payload.events : [] }
  } catch {
    return { events: [] }
  }
}

const inputCls =
  'h-12 w-full min-w-0 rounded-md border border-white/15 bg-[#1a1a1a] px-3 text-base text-white outline-none placeholder:text-white/30 focus:border-tm-blue-light'

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/55">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    </label>
  )
}

function OrderNumberField({
  value,
  onChange,
  onRefresh,
  eventName,
}: {
  value: string
  onChange: (value: string) => void
  onRefresh: () => void
  eventName: string
}) {
  const inputId = useId()

  return (
    <div className="block min-w-0">
      <label htmlFor={inputId} className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/55">
        Order number
      </label>
      <div className="flex min-w-0">
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputCls} rounded-r-none border-r-0`}
        />
        <button
          type="button"
          onClick={onRefresh}
          aria-label={`Generate a new order number for ${eventName || 'this event'}`}
          title="Generate a new order number"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-r-md border border-white/15 bg-[#1a1a1a] text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tm-blue-light"
        >
          <RefreshCw size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

function NumberField({
  label,
  value,
  onCommit,
  min,
  max,
  step = 1,
}: {
  label: string
  value: number
  onCommit: (v: number) => void
  min: number
  max?: number
  step?: number
}) {
  const [draft, setDraft] = useState(String(value))
  useEffect(() => setDraft(String(value)), [value])

  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/55">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={draft}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          setDraft(e.target.value)
          const n = Number(e.target.value)
          if (e.target.value !== '' && Number.isSafeInteger(n) && n >= min && (max === undefined || n <= max)) onCommit(n)
        }}
        onBlur={() => setDraft(String(value))}
        className={inputCls}
      />
    </label>
  )
}

function ReceiptAmountField({
  label,
  value,
  calculated,
  onCommit,
}: {
  label: string
  value: number | undefined
  calculated: number
  onCommit: (value: number | undefined) => void
}) {
  const inputId = useId()
  const [draft, setDraft] = useState(String(value ?? calculated))
  useEffect(() => setDraft(String(value ?? calculated)), [value, calculated])

  return (
    <div className="min-w-0">
      <label htmlFor={inputId} className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/55">{label}</label>
      <div className="flex gap-2">
        <input
          id={inputId}
          type="number"
          inputMode="decimal"
          min={0}
          step={0.01}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => {
            if (!draft.trim()) {
              onCommit(undefined)
              setDraft(String(calculated))
              return
            }
            const parsed = Number(draft)
            if (Number.isFinite(parsed) && parsed >= 0) onCommit(parsed)
            else setDraft(String(value ?? calculated))
          }}
          className={inputCls}
        />
        <button
          type="button"
          onClick={() => {
            onCommit(undefined)
            setDraft(String(calculated))
          }}
          className="shrink-0 rounded-md border border-white/15 px-3 text-xs font-bold text-white/75 hover:text-white"
          aria-label={`Use calculated ${label.toLowerCase()}`}
        >
          Auto
        </button>
      </div>
    </div>
  )
}

function TicketmasterSearch({ onPick }: { onPick: (e: TMEvent) => void }) {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 350)
    return () => clearTimeout(t)
  }, [query])

  const { data, isLoading } = useSWR(
    debounced.length >= 2 ? `/api/ticketmaster?keyword=${encodeURIComponent(debounced)}&size=8` : null,
    fetchEvents,
    { revalidateOnFocus: false },
  )

  return (
    <div className="rounded-lg border border-tm-blue/50 bg-[#141b33] p-3">
      <label className="block">
        <span className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/70">
          <Search size={14} aria-hidden="true" />
          Live Ticketmaster Search
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search artists, teams, venues…"
          className={inputCls}
        />
      </label>
      {isLoading && <p className="mt-3 text-sm text-white/60">Searching Ticketmaster…</p>}
      {debounced.length >= 2 && !isLoading && (data?.events.length ?? 0) === 0 && (
        <p className="mt-3 text-sm text-white/60">No matching events.</p>
      )}
      {data && data.events.length > 0 && (
        <ul className="mt-3 flex max-h-[320px] flex-col gap-2 overflow-y-auto">
          {data.events.map((event) => (
            <li key={event.id}>
              <button
                type="button"
                onClick={() => {
                  onPick(event)
                  setQuery('')
                }}
                className="flex w-full items-center gap-3 rounded-md bg-[#1a1a1a] text-left hover:bg-[#262626]"
              >
                {event.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={event.image} alt="" className="h-14 w-20 shrink-0 rounded-l-md object-cover" />
                ) : (
                  <span className="h-14 w-20 shrink-0 rounded-l-md bg-[#2a2a2a]" />
                )}
                <span className="min-w-0 flex-1 py-1.5 pr-3">
                  <span className="type-event-title block truncate text-sm font-extrabold">{event.name}</span>
                  <span className="block truncate text-xs text-white/60">
                    {event.dateTime?.slice(0, 10)} • {event.venue}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SeatEditor({
  index,
  ticket,
  seat,
  onChange,
}: {
  index: number
  ticket: Ticket
  seat: Seat
  onChange: (patch: Partial<Seat>) => void
}) {
  return (
    <fieldset className="rounded-lg border border-white/10 p-3">
      <legend className="px-1 text-xs font-bold uppercase tracking-wider text-white/55">Seat card {index + 1}</legend>
      <div className="grid grid-cols-3 gap-2">
        <Field label="Section" value={seat.section} onChange={(v) => onChange({ section: v })} />
        <Field label="Row" value={seat.row} onChange={(v) => onChange({ row: v })} />
        <Field label="Seat" value={seat.seat} onChange={(v) => onChange({ seat: v })} />
      </div>
      <div className="mt-2">
        <Field
          label="Transfer status text"
          value={seat.transferStatus}
          placeholder="e.g. Transfer Accepted: TOM B (empty = none)"
          onChange={(v) => onChange({ transferStatus: v })}
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Field
          label="Receipt ticket name"
          value={seat.ticketType ?? `${ticket.ticketTypeOverride || ticket.purchaseType} Seating`}
          onChange={(v) => onChange({ ticketType: v })}
        />
        <NumberField
          label="Unit price"
          value={seat.ticketPrice ?? ticket.ticketPrice ?? 0}
          min={0}
          max={100000}
          step={0.01}
          onCommit={(value) => onChange({ ticketPrice: value })}
        />
      </div>
    </fieldset>
  )
}

function TicketEditor({ ticket, defaultOpen }: { ticket: Ticket; defaultOpen: boolean }) {
  const { updateTicket, deleteTicket, tickets } = useApp()
  const [open, setOpen] = useState(defaultOpen)
  const patch = (p: Partial<Ticket>) => updateTicket(ticket.id, p)
  const patchReceipt = (receiptPatch: Partial<ReceiptSettings>) =>
    patch({ receipt: { ...ticket.receipt, ...receiptPatch } })
  const newOrderNumber = () => generateOrderNumber(tickets.map((item) => item.orderNumber))

  const applyEvent = (event: TMEvent) => {
    const currency = getCurrencyForCountry(event.countryCode)
    patch({
      artist: event.name,
      venue: event.venue || ticket.venue,
      venueCity: event.city || ticket.venueCity,
      venueState: event.state || ticket.venueState,
      countryCode: event.countryCode || ticket.countryCode,
      posterUrl: event.image ?? ticket.posterUrl,
      dateTime: event.dateTime ?? ticket.dateTime,
      purchaseDate: event.dateTime ? new Date(new Date(event.dateTime).getTime() - 7 * 86400000).toISOString().slice(0, 16) : ticket.purchaseDate,
      venueLocation: event.venueLocation || ticket.venueLocation,
      ...(currency ? {
        currency,
        receipt: { ...ticket.receipt, currencyPrefix: getCurrencyPrefix(currency) },
      } : {}),
      presenter: event.promoter ? `${event.promoter.toUpperCase()} PRESENTS` : ticket.presenter,
      orderNumber: newOrderNumber(),
      lat: event.lat ?? ticket.lat,
      lng: event.lng ?? ticket.lng,
    })
  }

  const editSeat = (id: string, p: Partial<Seat>) =>
    patch({ seats: ticket.seats.map((s) => (s.id === id ? { ...s, ...p } : s)) })

  return (
    <li className="overflow-hidden rounded-xl border border-white/10 bg-[#141414]">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ticket.posterUrl}
          alt={`${ticket.artist} poster preview`}
          className={`h-[190px] w-full object-cover object-top ${ticket.visible ? '' : 'opacity-40 grayscale'}`}
        />
        <span className="absolute bottom-0 left-0 max-w-[90%] truncate bg-[#141414] px-4 pb-2 pt-3 text-xs font-extrabold uppercase tracking-wide">
          {dateBadge(ticket.dateTime)}
        </span>
      </div>
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="min-w-0 flex-1">
          <h3 className="type-event-title truncate text-xl font-extrabold uppercase">{ticket.artist || 'Untitled'}</h3>
          <p className="flex items-center gap-2 truncate text-sm text-white/60">
            <span className="truncate">{getTicketVenueLabel(ticket)}</span>
            <DualTicketIcon size={16} className="shrink-0 text-white" />
            <span className="shrink-0">x{ticket.seats.length}</span>
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={ticket.visible}
          aria-label={`${ticket.artist} visible in My Tickets`}
          onClick={() => patch({ visible: !ticket.visible })}
          className={`flex h-10 w-[88px] shrink-0 items-center rounded-full px-1 text-xs font-extrabold transition-colors ${
            ticket.visible ? 'justify-end bg-tm-blue' : 'justify-start bg-[#5d5d5d]'
          }`}
        >
          {!ticket.visible && <span className="pl-3 pr-2 text-white/90">OFF</span>}
          <span className="h-8 w-8 shrink-0 rounded-full bg-white" />
          {ticket.visible && <span className="order-first pl-3 pr-2">ON</span>}
        </button>
      </div>

      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="h-11 w-full rounded-md border border-white/15 text-sm font-bold"
        >
          {open ? 'Hide Fields' : 'Edit Fields'}
        </button>
      </div>

      {open && (
        <div className="space-y-4 border-t border-white/10 px-4 pb-5 pt-5">
          <TicketmasterSearch onPick={applyEvent} />

          <Field label="Event title" value={ticket.artist} onChange={(v) => patch({ artist: v })} />
          <Field label="Venue name" value={ticket.venue} onChange={(v) => patch({ venue: v })} />
          <Field label="Poster image URL" value={ticket.posterUrl} onChange={(v) => patch({ posterUrl: v })} />
          <Field
            label="Date & time"
            type="datetime-local"
            value={ticket.dateTime}
            onChange={(v) => v && patch({ dateTime: v })}
          />
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Venue latitude" value={ticket.lat} min={-90} max={90} step={0.0001} onCommit={(v) => patch({ lat: v })} />
            <NumberField label="Venue longitude" value={ticket.lng} min={-180} max={180} step={0.0001} onCommit={(v) => patch({ lng: v })} />
          </div>
          <OrderNumberField
            value={ticket.orderNumber}
            onChange={(value) => patch({ orderNumber: value })}
            onRefresh={() => patch({ orderNumber: newOrderNumber() })}
            eventName={ticket.artist}
          />
          <label className="block min-w-0"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/55">Entry info</span><select value={['Upper Level', 'Lower Level', 'Floor General Admission Pit'].includes(ticket.entryInfo ?? '') ? ticket.entryInfo : ticket.entryInfo ? '__custom__' : 'Upper Level'} onChange={(e) => patch({ entryInfo: e.target.value === '__custom__' ? (ticket.entryInfo && !['Upper Level', 'Lower Level', 'Floor General Admission Pit'].includes(ticket.entryInfo) ? ticket.entryInfo : '') : e.target.value })} className={inputCls}><option>Upper Level</option><option>Lower Level</option><option>Floor General Admission Pit</option><option value="__custom__">Custom</option></select></label>
          {ticket.entryInfo && !['Upper Level', 'Lower Level', 'Floor General Admission Pit'].includes(ticket.entryInfo) && <Field label="Custom entry info" value={ticket.entryInfo} onChange={(v) => patch({ entryInfo: v })} />}
          <Field label="Presenter override" value={ticket.presenter ?? ''} onChange={(v) => patch({ presenter: v })} />
          <select aria-label="Policy notice" value={ticket.policyNotice ?? 'NO BAGS PERMITTED'} onChange={(e) => patch({ policyNotice: e.target.value })} className={inputCls}><option>NO BAGS PERMITTED</option><option>CLEAR BAG POLICY ONLY (MAX 12&quot; x 6&quot; x 12&quot;)</option><option>MOBILE ENTRY ONLY - NO PAPER TICKETS</option></select>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Event city" value={ticket.venueCity ?? ''} onChange={(v) => patch({ venueCity: v })} />
            <Field label="State / province" value={ticket.venueState ?? ''} onChange={(v) => patch({ venueState: v.toUpperCase() })} />
          </div>
          <Field
            label="Event country code"
            value={ticket.countryCode ?? ''}
            onChange={(value) => {
              const countryCode = value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2)
              const currency = getCurrencyForCountry(countryCode)
              patch({
                countryCode,
                ...(currency ? {
                  currency,
                  receipt: { ...ticket.receipt, currencyPrefix: getCurrencyPrefix(currency) },
                } : {}),
              })
            }}
          />
          <Field label="Venue address" value={ticket.venueLocation ?? ''} onChange={(v) => patch({ venueLocation: v })} />
          <fieldset className="space-y-3 rounded-lg border border-tm-blue/40 bg-[#141b33] p-3">
            <legend className="px-1 text-xs font-bold uppercase tracking-wider text-white/70">Barcode behavior</legend>
            <label className="block min-w-0">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/55">Barcode mode</span>
              <select value={ticket.barcodeMode ?? 'countdown'} onChange={(e) => patch({ barcodeMode: e.target.value as Ticket['barcodeMode'] })} className={inputCls}>
                <option value="active">Active immediately</option>
                <option value="countdown">Countdown until active</option>
              </select>
            </label>
            {(ticket.barcodeMode ?? 'countdown') === 'countdown' && (
              <div className="grid grid-cols-3 gap-2">
                <NumberField label="Hours" value={ticket.barcodeCountdownHours ?? 72} min={0} max={8760} onCommit={(v) => patch({ barcodeCountdownHours: v })} />
                <NumberField label="Minutes" value={ticket.barcodeCountdownMinutes ?? 0} min={0} max={59} onCommit={(v) => patch({ barcodeCountdownMinutes: v })} />
                <NumberField label="Seconds" value={ticket.barcodeCountdownSeconds ?? 0} min={0} max={59} onCommit={(v) => patch({ barcodeCountdownSeconds: v })} />
              </div>
            )}
            <p className="text-xs leading-5 text-white/55">The barcode becomes active when the event is within the configured countdown window.</p>
          </fieldset>
          <Field label="Purchase date" type="datetime-local" value={getPurchaseDate(ticket)} onChange={(v) => v && patch({ purchaseDate: v })} />
          <Field label="Receipt order date" value={getReceiptOrderDate(ticket)} onChange={(v) => patchReceipt({ orderDate: v })} placeholder="MM/DD/YY" />
          <label className="block min-w-0">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/55">Ticket type</span>
            <select value={ticket.ticketTypeOverride ? '__custom__' : ticket.purchaseType} onChange={(e) => e.target.value === '__custom__' ? patch({ ticketTypeOverride: ticket.purchaseType }) : patch({ purchaseType: e.target.value, ticketTypeOverride: '' })} className={inputCls}>
              {['American Express® Presale', 'General Sale', 'Official Platinum', 'Artist Presale', 'VIP Nation Presale', 'Spotify Presale', 'Citi® Cardmember Presale'].map((type) => <option key={type} value={type}>{type}</option>)}
              <option value="__custom__">Custom override</option>
            </select>
          </label>
          <Field label="Custom ticket type override" value={ticket.ticketTypeOverride ?? ''} onChange={(v) => patch({ ticketTypeOverride: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Currency code"
              value={ticket.currency ?? 'USD'}
              onChange={(value) => {
                const currency = value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3)
                patch({ currency, receipt: { ...ticket.receipt, currencyPrefix: getCurrencyPrefix(currency) } })
              }}
            />
            <Field
              label="Currency / price prefix"
              value={ticket.receipt?.currencyPrefix ?? getCurrencyPrefix(ticket.currency)}
              onChange={(value) => patchReceipt({ currencyPrefix: value })}
            />
            <NumberField label="Default ticket price" value={ticket.ticketPrice ?? 0} min={0} max={100000} step={0.01} onCommit={(v) => patch({ ticketPrice: v })} />
            <NumberField label="Receipt fees" value={ticket.serviceFee ?? 0} min={0} max={100000} step={0.01} onCommit={(v) => patch({ serviceFee: v })} />
          </div>
          <fieldset className="flex flex-col gap-3 rounded-lg border border-white/10 p-3">
            <legend className="px-1 text-xs font-bold uppercase tracking-wider text-white/55">Receipt totals & delivery</legend>
            <ReceiptAmountField label="Subtotal" value={ticket.receipt?.subtotalOverride} calculated={getReceiptSubtotal(ticket)} onCommit={(value) => patchReceipt({ subtotalOverride: value })} />
            <Field label="Delivery method" value={ticket.receipt?.deliveryMethod ?? 'Mobile App Only'} onChange={(v) => patchReceipt({ deliveryMethod: v })} />
            <Field label="Delivery status / cost" value={ticket.receipt?.deliveryCostLabel ?? 'FREE'} onChange={(v) => patchReceipt({ deliveryCostLabel: v })} />
            <ReceiptAmountField label="Total" value={ticket.receipt?.totalOverride} calculated={getReceiptTotal(ticket)} onCommit={(value) => patchReceipt({ totalOverride: value })} />
          </fieldset>
          <fieldset className="flex flex-col gap-3 rounded-lg border border-white/10 p-3">
            <legend className="px-1 text-xs font-bold uppercase tracking-wider text-white/55">Receipt disclaimer</legend>
            <Field label="Disclaimer heading" value={ticket.receipt?.disclaimerTitle ?? 'This is not a ticket'} onChange={(v) => patchReceipt({ disclaimerTitle: v })} />
            <Field label="Disclaimer text" value={ticket.receipt?.disclaimerBody ?? 'Please be aware, this page cannot be used for entry to an event'} onChange={(v) => patchReceipt({ disclaimerBody: v })} />
          </fieldset>
          <div className="grid grid-cols-[110px_1fr] gap-3">
            <NumberField
              label="Quantity"
              value={ticket.seats.length}
              min={0}
              max={50}
              onCommit={(q) => patch({ quantity: q, seats: resizeSeats(ticket.seats, q) })}
            />
            <Field
              label="Purchase type badge"
              value={ticket.purchaseType}
              onChange={(v) => patch({ purchaseType: v })}
            />
          </div>

          <div className="space-y-3">
            {ticket.seats.map((seat, i) => (
              <SeatEditor key={seat.id} index={i} ticket={ticket} seat={seat} onChange={(p) => editSeat(seat.id, p)} />
            ))}
          </div>
        </div>
      )}

      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={() => deleteTicket(ticket.id)}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-md bg-[#d4202f] text-base font-extrabold text-white hover:bg-[#b81b28]"
        >
          <Trash2 size={20} aria-hidden="true" />
          Delete Ticket Completely
        </button>
      </div>
    </li>
  )
}

export function AdminDashboard({ onBack }: { onBack: () => void }) {
  const { tickets, addTicket, moveTicket, profile, setProfile } = useApp()
  const [newestId, setNewestId] = useState<string | null>(null)

  return (
    <div lang="en" dir="ltr" className="h-full overflow-y-auto pb-28 pt-[max(env(safe-area-inset-top),16px)]">
      <header className="sticky top-0 z-10 flex items-center gap-4 bg-[#111] px-4 py-3">
        <button type="button" onClick={onBack} aria-label="Back to Account" className="shrink-0">
          <ArrowLeft size={30} strokeWidth={2.4} />
        </button>
        <h1 className="text-2xl font-extrabold uppercase">Edit Details</h1>
      </header>

      <section className="space-y-4 px-4 pt-4" aria-label="Profile">
        <h2 className="text-xl font-extrabold">Profile</h2>
        <Field label="Full name" value={profile.name} onChange={(v) => setProfile({ name: v })} />
        <Field label="Email" type="email" value={profile.email} onChange={(v) => setProfile({ email: v })} />
        <Field label="Avatar initials" value={profile.initials} onChange={(v) => setProfile({ initials: v.toUpperCase().slice(0, 3) })} />
        <NumberField label="Past events to show in My Tickets" value={profile.pastEventsToShow} min={0} onCommit={(v) => setProfile({ pastEventsToShow: Math.max(0, Math.floor(v)) })} />
      </section>

      <section className="mt-10 px-4" aria-label="Master admin dashboard">
        <div className="mb-1 flex items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold uppercase">Master Admin Dashboard</h2>
          <button
            type="button"
            onClick={() => setNewestId(addTicket())}
            className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-tm-blue px-4 text-sm font-extrabold"
          >
            <Plus size={18} aria-hidden="true" />
            Add Ticket
          </button>
        </div>
        <p className="mb-5 text-sm text-white/60">
          Every field is editable. Toggle a ticket ON to show it in My Tickets, or delete it permanently.
        </p>

        {tickets.length === 0 ? (
          <p className="rounded-lg border border-dashed border-white/20 p-8 text-center text-white/60">
            No tickets. Use Add Ticket to create one.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {tickets.map((t, index) => (
              <div key={t.id} className="relative">
                <div className="mb-2 flex items-center justify-between rounded-lg border border-white/10 bg-[#1b1b1b] px-3 py-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/60">Display position {index + 1}</span>
                  <div className="flex gap-2">
                    <button type="button" aria-label={`Move ${t.artist} up`} disabled={index === 0} onClick={() => moveTicket(t.id, 'up')} className="rounded-md border border-white/15 p-2 disabled:opacity-30"><ArrowUp size={16} /></button>
                    <button type="button" aria-label={`Move ${t.artist} down`} disabled={index === tickets.length - 1} onClick={() => moveTicket(t.id, 'down')} className="rounded-md border border-white/15 p-2 disabled:opacity-30"><ArrowDown size={16} /></button>
                  </div>
                </div>
                <TicketEditor ticket={t} defaultOpen={t.id === newestId} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
