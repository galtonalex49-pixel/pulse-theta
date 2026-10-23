'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { ArrowLeft, Plus, Search, Trash2 } from 'lucide-react'
import { resizeSeats, useApp } from '@/lib/store'
import { dateBadge } from '@/lib/format'
import type { Seat, TMEvent, Ticket } from '@/lib/types'
import { TicketCountIcon } from '../icons'

const fetchEvents = (url: string): Promise<{ events: TMEvent[] }> => fetch(url).then((r) => r.json())

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
  max: number
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
          if (e.target.value !== '' && Number.isFinite(n) && n >= min && n <= max) onCommit(n)
        }}
        onBlur={() => setDraft(String(value))}
        className={inputCls}
      />
    </label>
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
                  <span className="block truncate text-sm font-extrabold">{event.name}</span>
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
  seat,
  onChange,
}: {
  index: number
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
    </fieldset>
  )
}

function TicketEditor({ ticket, defaultOpen }: { ticket: Ticket; defaultOpen: boolean }) {
  const { updateTicket, deleteTicket } = useApp()
  const [open, setOpen] = useState(defaultOpen)
  const patch = (p: Partial<Ticket>) => updateTicket(ticket.id, p)

  const applyEvent = (event: TMEvent) =>
    patch({
      artist: event.name,
      venue: event.venue || ticket.venue,
      posterUrl: event.image ?? ticket.posterUrl,
      dateTime: event.dateTime ?? ticket.dateTime,
      lat: event.lat ?? ticket.lat,
      lng: event.lng ?? ticket.lng,
    })

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
          <h3 className="truncate text-xl font-extrabold uppercase">{ticket.artist || 'Untitled'}</h3>
          <p className="flex items-center gap-2 truncate text-sm text-white/60">
            <span className="truncate">{ticket.venue}</span>
            <TicketCountIcon size={16} className="shrink-0" />
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
          <Field label="Order number" value={ticket.orderNumber} onChange={(v) => patch({ orderNumber: v })} />
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
              <SeatEditor key={seat.id} index={i} seat={seat} onChange={(p) => editSeat(seat.id, p)} />
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
  const { tickets, addTicket, profile, setProfile } = useApp()
  const [newestId, setNewestId] = useState<string | null>(null)

  return (
    <div className="h-full overflow-y-auto pb-28 pt-[max(env(safe-area-inset-top),16px)]">
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
          <ul className="flex flex-col gap-6">
            {tickets.map((t) => (
              <TicketEditor key={t.id} ticket={t} defaultOpen={t.id === newestId} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
