'use client'

import { useApp } from '@/lib/store'
import { TicketsLanding } from './landing'
import { OrderDetails } from './order-details'
import { Safetix } from './safetix'

export function MyTicketsTab() {
  const { ticketView, tickets } = useApp()
  const ticket = tickets.find((t) => t.id === ticketView.id && t.visible)

  if (ticket && ticketView.view === 'details') return <OrderDetails key={ticket.id} ticket={ticket} />
  if (ticket && ticketView.view === 'safetix') return <Safetix ticket={ticket} />
  return <TicketsLanding />
}
