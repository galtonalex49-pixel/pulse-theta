'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type Transfer = { status: string; unlocks_at?: string; event_name?: string; event_date?: string; venue?: string }

function ClaimContent() {
  const params = useSearchParams()
  const token = params.get('token')
  const [transfer, setTransfer] = useState<Transfer | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (token) fetch(`/api/transfer/claim?token=${encodeURIComponent(token)}`).then(async (r) => { const data = await r.json(); if (!r.ok) throw new Error(data.error); setTransfer(data) }).catch((e) => setError(e.message)) }, [token])
  const accept = async () => { setBusy(true); const response = await fetch('/api/transfer/claim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) }); const data = await response.json(); if (!response.ok) setError(data.error); else setTransfer(data); setBusy(false) }
  if (error) return <main className="flex min-h-screen items-center justify-center bg-[#061b45] p-6 text-white"><div className="max-w-md rounded-2xl bg-white/10 p-8 text-center"><h1 className="text-2xl font-bold">Transfer unavailable</h1><p className="mt-3 text-white/70">{error}</p></div></main>
  if (!transfer) return <main className="flex min-h-screen items-center justify-center bg-[#061b45] text-white">Loading transfer…</main>
  return <main className="min-h-screen bg-[#f4f6f9] p-4 text-[#111827]"><div className="mx-auto max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl"><header className="bg-[#071d49] p-6 text-3xl font-extrabold text-white">ticketmaster</header><section className="p-7"><p className="text-sm font-bold uppercase tracking-wider text-[#026cdf]">Ticket transfer</p><h1 className="mt-4 text-3xl font-extrabold">{transfer.event_name || 'Your event'}</h1><p className="mt-3 text-lg text-gray-600">{transfer.event_date}<br />{transfer.venue}</p>{transfer.status === 'accepted' ? <div className="mt-8 rounded-xl bg-blue-50 p-5 text-blue-950"><p className="font-bold">Transfer Accepted!</p><p className="mt-2">Your digital passes are being prepared and will be fully visible in your account in 2 hours.</p></div> : <button type="button" onClick={accept} disabled={busy} className="mt-8 w-full rounded-lg bg-[#026cdf] px-6 py-4 text-lg font-bold text-white disabled:opacity-60">{busy ? 'Accepting…' : 'Accept Transfer'}</button>}</section></div></main>
}

export default function ClaimPage() {
  return <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[#061b45] text-white">Loading transfer…</main>}><ClaimContent /></Suspense>
}
