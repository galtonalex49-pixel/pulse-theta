import { dateBadge } from '@/lib/format'
import type { Ticket } from '@/lib/types'
import { DualTicketIcon } from '../icons'
import { useTranslation } from '@/lib/use-translation'

interface EventCardProps {
  ticket: Ticket
  onView?: () => void
  compact?: boolean
  past?: boolean
}

export function EventCard({ ticket, onView, compact = false, past = false }: EventCardProps) {
  const { locale, t } = useTranslation()
  const count = ticket.seats.length

  return (
    <article className={`bg-[#111] ${past ? 'grayscale' : ''}`}>
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ticket.posterUrl}
          alt={`${ticket.artist} poster`}
          className="aspect-[16/9] w-full object-cover object-top"
        />
        <span className="absolute bottom-0 left-0 max-w-[92%] truncate rounded-tr-xl bg-[#111] px-3 pb-2 pt-2.5 text-sm font-extrabold uppercase tracking-wide">
          {dateBadge(ticket.dateTime, locale)}
        </span>
      </div>
      <div className="px-4 pb-3 pt-3">
        <h2 className="type-event-title line-clamp-2 break-words text-[22px] font-extrabold uppercase leading-[1.2]">
          {ticket.artist}
        </h2>
        <div className="my-3 h-px w-full shrink-0 bg-[#37373b]" />
        {ticket.seats.some((seat) => seat.transferStatus.toLowerCase().includes('pending')) && (
          <p className="mb-3 rounded-md bg-[#172d58] px-3 py-2 text-sm font-bold text-blue-100">{t('digitalPassProcessing')}</p>
        )}
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-sm font-normal text-[#C8C8D2]">{ticket.venueLocation || ticket.venue}</p>
          <span className="flex shrink-0 items-center gap-2 text-sm font-bold text-white/90">
            <DualTicketIcon size={16} className="text-white" />
            <span>x{count}</span>
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onView}
        disabled={!onView}
        className="h-10 w-full bg-tm-blue text-base font-bold text-white transition-colors enabled:hover:bg-tm-blue-light"
      >
        {t('viewTickets')}
      </button>
    </article>
  )
}
