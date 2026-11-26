import type { Seat, Ticket } from './types'
import { getCurrencyPrefix } from './currency'

export interface ReceiptLineItem {
  seat: Seat
  label: string
  unitPrice: number
}

function parseLocalDateTime(value: string) {
  const [datePart, timePart = '00:00'] = value.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hours, minutes] = timePart.split(':').map(Number)
  return new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0)
}

export function getPurchaseDate(ticket: Ticket) {
  if (ticket.purchaseDate) return ticket.purchaseDate
  const date = parseLocalDateTime(ticket.dateTime)
  date.setDate(date.getDate() - 7)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function formatPurchaseDate(ticket: Ticket) {
  const date = parseLocalDateTime(getPurchaseDate(ticket))
  const label = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date).toLocaleUpperCase('en-US')
  const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date)
  return `${label} • ${time}`
}

export function getReceiptOrderDate(ticket: Ticket) {
  if (ticket.receipt?.orderDate) return ticket.receipt.orderDate
  const [year, month, day] = getPurchaseDate(ticket).slice(0, 10).split('-')
  return `${month}/${day}/${year.slice(-2)}`
}

export function getReceiptLineItems(ticket: Ticket): ReceiptLineItem[] {
  return ticket.seats.map((seat) => ({
    seat,
    label: seat.ticketType || `${ticket.ticketTypeOverride || ticket.purchaseType} Seating`,
    unitPrice: seat.ticketPrice ?? ticket.ticketPrice ?? 0,
  }))
}

export function getReceiptCurrencyPrefix(ticket: Ticket) {
  if (ticket.receipt?.currencyPrefix !== undefined) return ticket.receipt.currencyPrefix
  return getCurrencyPrefix(ticket.currency)
}

export function formatReceiptAmount(ticket: Ticket, value: number) {
  const formatted = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${getReceiptCurrencyPrefix(ticket)}${formatted}`
}

export function getReceiptSubtotal(ticket: Ticket) {
  return ticket.receipt?.subtotalOverride ?? getReceiptLineItems(ticket).reduce((total, item) => total + item.unitPrice, 0)
}

export function getReceiptFees(ticket: Ticket) {
  return ticket.serviceFee ?? 0
}

export function getReceiptTotal(ticket: Ticket) {
  return ticket.receipt?.totalOverride ?? getReceiptSubtotal(ticket) + getReceiptFees(ticket)
}
