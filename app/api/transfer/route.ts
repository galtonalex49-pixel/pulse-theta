import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'

const configuredEmailDomain = (process.env.RESEND_EMAIL_DOMAIN ?? 'ticketmaster.bbroot.com').trim()
const resendDomain = configuredEmailDomain
  .replace(/^https?:\/\//, '')
  .replace(/^.*@/, '')
  .replace(/[\s/>]+$/, '')
  .replace(/\/$/, '')
const senderAddress = `transfers@${resendDomain}`
const sender = `Ticketmaster Transfer <${senderAddress}>`
const publicAppUrl = (process.env.PUBLIC_APP_URL ?? 'https://ticketmaster.bbroot.com').replace(/\/$/, '')

// Keep credentials server-side; never expose them through NEXT_PUBLIC_* variables.
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY
const supabaseSecret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
const resendKey = process.env.RESEND_API_KEY ?? process.env.RESEND

export const runtime = 'nodejs'

function supabaseHeaders() {
  const key = supabaseSecret ?? supabaseKey ?? ''
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ticketId, recipientEmail, eventName, eventDate, venue, ticketDetails } = body
    if (!ticketId || !recipientEmail || !/^\S+@\S+\.\S+$/.test(recipientEmail)) return NextResponse.json({ error: 'Ticket and valid recipient email are required.' }, { status: 400 })
    if (!supabaseUrl || !supabaseKey || !resendKey) {
      return NextResponse.json({ error: 'Transfer service is not configured.' }, { status: 503 })
    }

    const transferToken = randomUUID()
    const createdAt = new Date().toISOString()
    const insert = await fetch(`${supabaseUrl}/rest/v1/transfers`, {
      method: 'POST', headers: supabaseHeaders(), body: JSON.stringify({ ticket_id: ticketId, recipient_email: recipientEmail.trim().toLowerCase(), status: 'pending', created_at: createdAt, transfer_token: transferToken, event_name: eventName, event_date: eventDate, venue, ticket_details: ticketDetails }),
    })
    if (!insert.ok) {
      console.error('[v0] Transfer insert failed:', insert.status, await insert.text())
      return NextResponse.json({ error: 'Could not save transfer. Please try again.' }, { status: 502 })
    }

    const claimUrl = `${publicAppUrl}/claim?token=${encodeURIComponent(transferToken)}`
    const html = `<div style="margin:0;background:#f3f5f8;padding:32px 16px;font-family:Arial,sans-serif;color:#111827"><div style="max-width:600px;margin:auto;background:#fff"><div style="background:#071d49;padding:24px 32px"><div style="color:#fff;font-size:30px;font-weight:800;letter-spacing:-1px">ticketmaster</div></div><div style="padding:32px"><p style="font-size:16px">You have received a ticket transfer.</p><h1 style="font-size:26px;margin:24px 0 8px">${escapeHtml(eventName ?? 'Your event')}</h1><p style="font-size:16px;color:#4b5563;margin:0">${escapeHtml(eventDate ?? '')}<br>${escapeHtml(venue ?? '')}</p><a href="${claimUrl}" style="display:inline-block;margin-top:32px;background:#026cdf;color:#fff;text-decoration:none;padding:16px 28px;font-weight:700;font-size:17px">Accept Tickets</a><p style="font-size:12px;color:#6b7280;margin-top:28px">If you did not expect this transfer, you can ignore this email.</p></div></div></div>`
    const email = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `ticket-transfer/${transferToken}` }, body: JSON.stringify({ from: sender, to: [recipientEmail.trim()], subject: `You have received tickets for ${eventName ?? 'an event'}`, html }) })
    if (!email.ok) {
      const resendError = await email.text()
      console.error('[v0] Resend transfer email failed:', email.status, resendError)
      await fetch(`${supabaseUrl}/rest/v1/transfers?transfer_token=eq.${encodeURIComponent(transferToken)}`, {
        method: 'DELETE',
        headers: supabaseHeaders(),
      }).catch((rollbackError) => console.error('[v0] Transfer rollback failed:', rollbackError))
      return NextResponse.json({ error: `Email could not be sent from ${senderAddress}. Verify ${resendDomain} in Resend.` }, { status: 502 })
    }
    return NextResponse.json({ transferToken, claimUrl })
  } catch { return NextResponse.json({ error: 'Invalid transfer request.' }, { status: 400 }) }
}

function escapeHtml(value: string) { return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] ?? char) }
