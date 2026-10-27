'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type Transfer = {
  status: string
  event_name?: string
  event_date?: string
  venue?: string
  recipient_name?: string
  sender_name?: string
  ticket_count?: number
  section?: string
  row?: string
  seat?: string
  ticket_type?: string
}

function ClaimContent() {
  const params = useSearchParams()
  const token = params.get('token')
  const [transfer, setTransfer] = useState<Transfer | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [approvalOpen, setApprovalOpen] = useState(false)

  useEffect(() => {
    if (!token) return
    fetch(`/api/transfer/claim?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error)
        setTransfer(data)
        window.setTimeout(() => setLoading(false), 2000)
      })
      .catch((reason) => { setError(reason.message); setLoading(false) })
  }, [token])

  const accept = async () => {
    setBusy(true)
    const response = await fetch('/api/transfer/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    const data = await response.json()
    if (!response.ok) setError(data.error)
    else setApprovalOpen(true)
    setBusy(false)
  }

  if (error) return <main className="flex min-h-screen items-center justify-center bg-[#f5f8fc] p-6 text-[#14213d]"><div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-lg"><h1 className="text-2xl font-bold">Transfer unavailable</h1><p className="mt-3 text-slate-600">{error}</p></div></main>
  if (loading || !transfer) return <main className="flex min-h-screen flex-col items-center justify-center bg-white text-[#1769e0]"><div className="mb-6 text-2xl font-bold tracking-tight">ticket eTransfer<sup>®</sup></div><div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-[#1769e0]" aria-label="Loading" /><p className="mt-5 text-base text-slate-600">Loading your tickets...</p></main>

  const tickets = transfer.ticket_count || 1
  const sender = transfer.sender_name || 'The sender'
  return <main className="min-h-screen bg-[#f5f8fc] p-4 text-[#14213d] sm:p-8"><div className="mx-auto max-w-xl overflow-hidden rounded-3xl bg-white shadow-xl"><header className="border-b border-slate-100 px-6 py-5 text-2xl font-bold tracking-tight text-[#1769e0]">ticket eTransfer<sup>®</sup></header><section className="p-6 sm:p-8"><div className="rounded-2xl bg-[#1769e0] p-6 text-white"><p className="text-2xl font-bold">You've Got Tickets!</p><p className="mt-2 text-blue-100">Someone sent you a ticket transfer</p></div><div className="mt-7"><p className="text-lg font-semibold">Hi {transfer.recipient_name || 'there'},</p><p className="mt-2 text-slate-600">{sender} has sent you {tickets} {tickets === 1 ? 'ticket' : 'tickets'}.</p></div><div className="mt-6 rounded-2xl border border-slate-200 p-5"><h1 className="text-2xl font-bold">{transfer.event_name || 'Your event'}</h1><div className="mt-4 grid gap-3 text-sm text-slate-600"><p>Location: {transfer.venue || 'Event venue'}</p><p>Date and time: {transfer.event_date || 'To be announced'}</p><p>Tickets: {tickets}</p></div></div><div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 p-5 text-sm"><div><span className="block text-xs font-bold uppercase text-slate-400">Section</span><strong>{transfer.section || '—'}</strong></div><div><span className="block text-xs font-bold uppercase text-slate-400">Row</span><strong>{transfer.row || '—'}</strong></div><div><span className="block text-xs font-bold uppercase text-slate-400">Seat</span><strong>{transfer.seat || '—'}</strong></div><div><span className="block text-xs font-bold uppercase text-slate-400">Type</span><strong>{transfer.ticket_type || 'General admission'}</strong></div></div><button type="button" onClick={accept} disabled={busy} className="mt-7 w-full rounded-xl bg-[#1769e0] px-6 py-4 text-base font-bold text-white transition hover:bg-[#1258c2] disabled:opacity-60">{busy ? 'Processing...' : 'ACCEPT TICKETS'}</button></section></div>{approvalOpen && <div className="fixed inset-0 flex items-center justify-center bg-slate-950/45 p-5" role="dialog" aria-modal="true" aria-labelledby="approval-title"><div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl"><h2 id="approval-title" className="text-xl font-bold">Approval required</h2><p className="mt-4 leading-7 text-slate-600">Please contact {sender}, who initiated the transfer, to approve this ticket transfer. Once approved, return to this page to successfully accept your tickets.</p><button type="button" onClick={() => setApprovalOpen(false)} className="mt-6 w-full rounded-xl bg-[#1769e0] px-5 py-3 font-bold text-white">Okay</button></div></div>}</main>
}

export default function ClaimPage() { return <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-white text-[#1769e0]">Loading your tickets...</main>}><ClaimContent /></Suspense> }
