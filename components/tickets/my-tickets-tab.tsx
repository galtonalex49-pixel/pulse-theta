'use client'

import { useApp } from '@/lib/store'
import { TicketsLanding } from './landing'
import { OrderDetails } from './order-details'
import { Safetix } from './safetix'

export function MyTicketsTab() {
  const { ticketView, tickets } = useApp()
  const ticket = tickets.find((t) => t.id === ticketView.id && t.visible)

  return (
    <div className="h-full min-h-0 overflow-hidden">
      {ticket && ticketView.view === 'details' ? <OrderDetails key={ticket.id} ticket={ticket} /> : null}
      {ticket && ticketView.view === 'safetix' ? <Safetix ticket={ticket} /> : null}
      {!ticket || ticketView.view === 'landing' ? <TicketsLanding /> : null}
    </div>
  )
}
