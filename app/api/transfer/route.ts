import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const domainPattern = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i
const PENDING_ICON = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pending_icon-pqTUKZyoXYe8lflGZ9hF3Y20RhILPl.png'
const ACCEPTED_ICON = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/accepted_icon-5MwtZoegNrVz96yFSPEWptBPfAz67L.png'
const COMPLETE_ICON = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/complete_icon-Lm6tVxRsNvyntxQ5bcfeHIHSzGZeVe.png'
const DATE_ICON = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/icon_5_transparent-CvuffgouCC3EPsaj4tcYUYK5c8genu.png'
const SECTION_ICON = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/icon_4_transparent-NsTtDvzZ2164RGRPz5e9lvnsFxeim9.png'

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character)
}


function createTransferEmail({ senderName, recipientName, eventName, eventDate, venue, seats, eventUrl, bannerImage, ticketQuantity }: {
  senderName: string
  recipientName: string
  eventName: string
  eventDate: string
  venue: string
  seats: string
  eventUrl: string
  bannerImage: string
  ticketQuantity: number
}) {
  const safeSenderName = escapeHtml(senderName)
  const safeRecipientName = escapeHtml(recipientName)
  const safeEventName = escapeHtml(eventName)
  const safeEventDate = escapeHtml(eventDate)
  const safeVenue = escapeHtml(venue)
  const safeSeats = escapeHtml(seats)
  const safeEventUrl = escapeHtml(eventUrl)
  const safeBannerImage = escapeHtml(bannerImage)
  const safeTicketQuantity = Math.max(1, ticketQuantity)
  const transferHeading = `${safeSenderName} has transferred you ${safeTicketQuantity} ${safeTicketQuantity === 1 ? 'ticket' : 'tickets'} to ${safeEventName}`
  const bannerMarkup = safeBannerImage
    ? '<img src="' + safeBannerImage + '" alt="' + safeEventName + ' event banner" width="536" style="display:block;width:100%;height:auto;max-height:260px;object-fit:cover" />'
    : '<div style="height:180px;background:#173b72;text-align:center;line-height:180px;color:#fff;font-size:18px;font-weight:700">' + safeEventName + '</div>'

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f3f5f8;color:#182230;font-family:Arial,Helvetica,sans-serif">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5f8;padding:32px 12px">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff">
          <tr><td style="height:6px;background:#123b78;font-size:0;line-height:0">&nbsp;</td></tr>
          <tr><td align="left" style="padding:22px 32px 18px;background:#ffffff"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ticket_eTransfer_final_transparent-SUL0qgI3AAwwj0cYgnJRzKJLfAND4o.png" alt="Ticket eTransfer®" width="320" height="80" style="display:block;width:320px;max-width:100%;height:80px;object-fit:contain;object-position:left center" /></td></tr>
          <tr><td style="padding:12px 32px 8px;text-align:left;font-size:18px;line-height:1.35;font-weight:700">${transferHeading}</td></tr>
          <tr><td style="padding:0 32px 24px;text-align:left;font-size:11px;line-height:1.5;color:#344054">${safeEventName}</td></tr>
          <tr><td style="padding:0 32px 28px">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
              <td align="center" width="33%"><img src="${PENDING_ICON}" width="42" height="42" alt="Pending" style="display:block;margin:0 auto;object-fit:contain" /><div style="padding-top:4px;font-size:11px;font-weight:700;color:#1769e0">Pending</div></td>
              <td align="center" style="width:8%;color:#b8c1cf;font-size:16px;line-height:42px">- -</td>
              <td align="center" width="33%"><img src="${ACCEPTED_ICON}" width="42" height="42" alt="Accepted" style="display:block;margin:0 auto;object-fit:contain" /><div style="padding-top:4px;font-size:11px;color:#667085">Accepted</div></td>
              <td align="center" style="width:8%;color:#b8c1cf;font-size:16px;line-height:42px">- -</td>
              <td align="center" width="33%"><img src="${COMPLETE_ICON}" width="42" height="42" alt="Complete" style="display:block;margin:0 auto;object-fit:contain" /><div style="padding-top:4px;font-size:11px;color:#667085">Complete</div></td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:0 32px 28px;text-align:left;font-size:11px;line-height:1.7"><p style="margin:0 0 18px">Hi ${safeRecipientName},</p><p style="margin:0">There are ticket(s) waiting to be accepted in your account. Accepting the ticket(s) will allow you to enter the event easily, using your own phone.</p></td></tr>
          <tr><td style="padding:0 48px 28px;text-align:center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #d9dee7;background:#f7f8fb"><tr><td style="padding:0">${bannerMarkup}<div style="padding:26px"><p style="margin:0 0 12px;font-size:11px;line-height:1.6;font-weight:700;color:#182230">${safeEventName}</p><p style="margin:0;text-align:center;color:#667085;font-size:11px;line-height:1.7"><img src="${DATE_ICON}" width="18" height="18" alt="" style="vertical-align:middle;margin-right:6px;object-fit:contain" />${safeEventDate}<br>${safeVenue}</p><p style="margin:18px 0 0;text-align:center;color:#182230;font-weight:700;font-size:11px;line-height:1.6"><img src="${SECTION_ICON}" width="18" height="18" alt="" style="vertical-align:middle;margin-right:6px;object-fit:contain" />${safeSeats}<br><span style="font-weight:400;color:#667085">Transfer Pending</span></p><a href="${safeEventUrl}" style="display:block;margin:24px auto 0;max-width:300px;background:#1257d6;color:#fff;text-align:center;text-decoration:none;padding:12px;font-weight:700;font-size:11px;letter-spacing:.3px">ACCEPT TICKETS</a><p style="margin:20px 0 0;color:#667085;font-size:11px;line-height:1.7">By clicking &quot;ACCEPT TICKETS&quot;, you agree to the applicable event terms.</p></div></td></tr></table></td></tr>
          <tr><td style="padding:0 48px 28px;text-align:center;color:#667085;font-size:11px;line-height:1.7">If the tickets were obtained fraudulently by the person transferring them, they may be canceled at any time and removed from your account.<br><br><strong style="color:#182230">This email is NOT your ticket.</strong></td></tr>
          <tr><td align="center" style="background:#202832;color:#fff;padding:48px 24px 42px;font-size:11px;line-height:1.7;text-align:center"><div style="font-size:15px;line-height:2.2;font-weight:700;margin-bottom:42px">Ticket eTransfer® &nbsp; | &nbsp; About &nbsp; | &nbsp; Terms of Use<br>Privacy</div><div style="font-size:15px;line-height:1.5;color:#5e9bff;text-decoration:underline;margin-bottom:22px">707 Virginia Street East, Suite 170, Charleston, WV 25301</div><div style="font-size:15px;line-height:1.5">© 2026 Ticket eTransfer®. All rights reserved.</div></td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { ticketId?: unknown; ownerEmail?: unknown; recipientEmail?: unknown; email?: unknown; senderName?: unknown; recipientName?: unknown; eventName?: unknown; eventDate?: unknown; venue?: unknown; seats?: unknown; ticketDetails?: { seats?: Array<{ section?: string; row?: string; seat?: string }> }; bannerImage?: unknown; eventUrl?: unknown; ticketQuantity?: unknown }
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
    const seats = typeof body.seats === 'string' && body.seats.trim() ? body.seats.trim() : body.ticketDetails?.seats?.map((seat) => `Section ${seat.section ?? '—'}, Row ${seat.row ?? '—'}, Seat ${seat.seat ?? '—'}`).join('; ') || 'Seat details to be confirmed'
    const ticketQuantity = body.ticketDetails?.seats?.length ?? (typeof body.ticketQuantity === 'number' && Number.isFinite(body.ticketQuantity) ? Math.max(1, Math.floor(body.ticketQuantity)) : 1)
    const eventUrl = typeof body.eventUrl === 'string' && /^https?:\/\//i.test(body.eventUrl.trim()) ? body.eventUrl.trim() : ''

    if (!emailPattern.test(recipientEmail)) {
      return NextResponse.json({ error: 'A valid recipientEmail or email is required.' }, { status: 400 })
    }

    const resendApiKey = process.env.RESEND_API_KEY ?? process.env.RESEND_EMAIL_RESEND_API_KEY
    const resendDomain = (process.env.RESEND_EMAIL_DOMAIN ?? process.env.SEQUENZY_FROM_DOMAIN)?.trim().toLowerCase()
    if (!resendApiKey || !resendDomain || !domainPattern.test(resendDomain)) {
      return NextResponse.json({ error: 'Resend email is not configured with a valid sending domain.' }, { status: 503 })
    }

    let response: Response
    try {
      response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `Ticket eTransfer® <transfers@${resendDomain}>`,
          to: [recipientEmail],
          subject: `You received tickets from ${senderName}`,
          html: createTransferEmail({ senderName, recipientName, eventName, eventDate, venue, seats, eventUrl, bannerImage: typeof body.bannerImage === 'string' && /^https?:\/\//i.test(body.bannerImage.trim()) ? body.bannerImage.trim() : '', ticketQuantity }),
        }),
        signal: AbortSignal.timeout(10_000),
      })
    } catch {
      return NextResponse.json({ error: 'Email could not be sent.' }, { status: 502 })
    }

    if (!response.ok) {
      console.error('[v0] Resend transfer email failed:', response.status)
      return NextResponse.json({ error: 'Email could not be sent.' }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid transfer request.' }, { status: 400 })
  }
}
