import { dateBadge } from '@/lib/format'
import type { Ticket } from '@/lib/types'
import { DualTicketIcon } from '../icons'

interface EventCardProps {
  ticket: Ticket
  onView?: () => void
  compact?: boolean
  past?: boolean
}

export function EventCard({ ticket, onView, compact = false, past = false }: EventCardProps) {
  const count = ticket.seats.length

  return (
    <article className={`bg-[#111] ${past ? 'grayscale' : ''}`}>
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ticket.posterUrl}
          alt={`${ticket.artist} poster`}
          className={`w-full object-cover object-top ${compact ? 'aspect-[16/9]' : 'aspect-[16/10]'}`}
        />
        <span className="absolute bottom-0 left-0 max-w-[92%] truncate rounded-tr-xl bg-[#111] px-6 pb-3 pt-4 text-[16px] font-extrabold uppercase tracking-wide">
          {dateBadge(ticket.dateTime)}
        </span>
      </div>
      <div className="px-4 pb-4 pt-3">
        <h2
          className={`line-clamp-3 break-words font-extrabold uppercase leading-8 ${
            compact ? 'text-[24px]' : 'text-[30px]'
          }`}
        >
          {ticket.artist}
        </h2>
        <div className="my-5 h-1.5 w-[110px] shrink-0 bg-[#9a8f8b]" />
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-lg font-bold">{ticket.venue}</p>
          <span className="flex shrink-0 items-center gap-2 text-lg font-bold text-white/90">
            <DualTicketIcon size={20} />
            <span>x{count}</span>
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onView}
        disabled={!onView}
        className="h-[62px] w-full bg-tm-blue text-[24px] font-bold text-white transition-colors enabled:hover:bg-tm-blue-light"
      >
        View Tickets
      </button>
    </article>
  )
}
