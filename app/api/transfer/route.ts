import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'

const sender = 'Ticketmaster Transfer <transfers@ticketmaster.bbroot.com>'

function supabaseHeaders() {
  const key = process.env.SUPABASE_KEY
  const secret = process.env.SUPABASE_SECRET
  return { apikey: key ?? secret ?? '', Authorization: `Bearer ${secret ?? key ?? ''}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ticketId, recipientEmail, eventName, eventDate, venue, ticketDetails } = body
    if (!ticketId || !recipientEmail || !/^\S+@\S+\.\S+$/.test(recipientEmail)) return NextResponse.json({ error: 'Ticket and valid recipient email are required.' }, { status: 400 })
    if (!process.env.SUPABASE_URL || !process.env.RESEND_KEY) return NextResponse.json({ error: 'Transfer service is not configured.' }, { status: 503 })

    const transferToken = randomUUID()
    const createdAt = new Date().toISOString()
    const insert = await fetch(`${process.env.SUPABASE_URL}/rest/v1/transfers`, {
      method: 'POST', headers: supabaseHeaders(), body: JSON.stringify({ ticket_id: ticketId, recipient_email: recipientEmail.trim().toLowerCase(), status: 'pending', created_at: createdAt, transfer_token: transferToken, event_name: eventName, event_date: eventDate, venue, ticket_details: ticketDetails }),
    })
    if (!insert.ok) return NextResponse.json({ error: 'Could not save transfer.' }, { status: 502 })

    const origin = new URL(request.url).origin
    const claimUrl = `${origin}/claim?token=${encodeURIComponent(transferToken)}`
    const html = `<div style="margin:0;background:#f3f5f8;padding:32px 16px;font-family:Arial,sans-serif;color:#111827"><div style="max-width:600px;margin:auto;background:#fff"><div style="background:#071d49;padding:24px 32px"><div style="color:#fff;font-size:30px;font-weight:800;letter-spacing:-1px">ticketmaster</div></div><div style="padding:32px"><p style="font-size:16px">You have received a ticket transfer.</p><h1 style="font-size:26px;margin:24px 0 8px">${escapeHtml(eventName ?? 'Your event')}</h1><p style="font-size:16px;color:#4b5563;margin:0">${escapeHtml(eventDate ?? '')}<br>${escapeHtml(venue ?? '')}</p><a href="${claimUrl}" style="display:inline-block;margin-top:32px;background:#026cdf;color:#fff;text-decoration:none;padding:16px 28px;font-weight:700;font-size:17px">Accept Tickets</a><p style="font-size:12px;color:#6b7280;margin-top:28px">If you did not expect this transfer, you can ignore this email.</p></div></div></div>`
    const email = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `ticket-transfer/${transferToken}` }, body: JSON.stringify({ from: sender, to: [recipientEmail.trim()], subject: `You have received tickets for ${eventName ?? 'an event'}`, html }) })
    if (!email.ok) return NextResponse.json({ error: 'Transfer saved, but the email could not be sent.' }, { status: 502 })
    return NextResponse.json({ transferToken, claimUrl })
  } catch { return NextResponse.json({ error: 'Invalid transfer request.' }, { status: 400 }) }
}

function escapeHtml(value: string) { return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] ?? char) }
