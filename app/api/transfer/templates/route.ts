import { NextResponse } from 'next/server'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
const headers = { apikey: supabaseKey ?? '', Authorization: `Bearer ${supabaseKey ?? ''}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }

function endpoint(query = '') { return `${supabaseUrl}/rest/v1/transfer_email_templates${query}` }
function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char) }
function renderTemplate(input: { senderName: string; recipientName: string; eventName: string; eventDate: string; venue: string; seatInfo: string; eventUrl: string; bannerImage: string }) {
  const safe = Object.fromEntries(Object.entries(input).map(([key, value]) => [key, escapeHtml(value)])) as typeof input
  return `<!doctype html><html><body style="margin:0;background:#f3f5f8;color:#182230;font-family:Arial,sans-serif"><table role="presentation" width="100%" style="padding:32px 12px;background:#f3f5f8"><tr><td align="center"><table role="presentation" width="600" style="max-width:600px;width:100%;background:#fff"><tr><td style="height:6px;background:#1769e0"></td></tr><tr><td style="padding:28px 32px;text-align:center"><div style="font-size:26px;font-weight:700;color:#123b78">Ticketmasťer eTransfer</div><div style="font-size:22px;font-weight:700;margin-top:12px">${safe.eventName}</div><p style="font-size:18px">${safe.senderName} transferred tickets to you</p><p>Hi ${safe.recipientName},</p><p>There are tickets waiting to be accepted in your account.</p></td></tr><tr><td style="padding:0 32px"><img src="${safe.bannerImage}" alt="${safe.eventName}" style="display:block;width:100%;height:180px;object-fit:cover;background:#173b72"><div style="padding:24px;background:#f4f5fa"><h2 style="margin:0 0 12px">${safe.eventName}</h2><p style="line-height:1.6;margin:0">${safe.eventDate}<br>${safe.venue}<br>${safe.seatInfo}</p><a href="${safe.eventUrl}" style="display:block;margin-top:24px;padding:16px;text-align:center;background:#1769e0;color:#fff;text-decoration:none;font-weight:700">VIEW TRANSFER</a></div></td></tr><tr><td style="padding:28px 32px;color:#667085;font-size:13px;line-height:1.6">This email is not your ticket. Accept the transfer using your own account and phone.</td></tr></table></td></tr></table></body></html>`
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!supabaseUrl || !supabaseKey || !body?.ownerEmail || !body?.ticketId || !body?.eventName) return NextResponse.json({ error: 'Invalid ticket template.' }, { status: 400 })
  const values = {
    owner_email: String(body.ownerEmail), ticket_id: String(body.ticketId), event_name: String(body.eventName), template_name: typeof body.templateName === 'string' && body.templateName.trim() ? body.templateName.trim() : `${body.eventName} - Transfer Notice`,
    sender_name: String(body.senderName ?? 'Account Holder'), recipient_name: '', recipient_email: '', event_date: String(body.eventDate ?? 'Event date and time to be confirmed'), venue: String(body.venue ?? 'Venue to be confirmed'), seat_info: String(body.seatInfo ?? 'Seat details to be confirmed'), event_url: String(body.eventUrl ?? ''), banner_image: String(body.bannerImage ?? ''), subject: `Ticket transfer for ${body.eventName}`,
    html: renderTemplate({ senderName: String(body.senderName ?? 'Account Holder'), recipientName: 'Ticket Recipient', eventName: String(body.eventName), eventDate: String(body.eventDate ?? 'Event date and time to be confirmed'), venue: String(body.venue ?? 'Venue to be confirmed'), seatInfo: String(body.seatInfo ?? 'Seat details to be confirmed'), eventUrl: String(body.eventUrl ?? ''), bannerImage: String(body.bannerImage ?? '') }),
  }
  const existingResponse = await fetch(endpoint(`?owner_email=eq.${encodeURIComponent(values.owner_email)}&ticket_id=eq.${encodeURIComponent(values.ticket_id)}&template_name=eq.${encodeURIComponent(values.template_name)}&select=id&limit=1`), { headers, cache: 'no-store' })
  const existing = existingResponse.ok ? (await existingResponse.json() as Array<{ id: string }>)[0] : undefined
  const selectedResponse = await fetch(endpoint(`?owner_email=eq.${encodeURIComponent(values.owner_email)}&is_selected=eq.true&select=id&limit=1`), { headers, cache: 'no-store' })
  const hasSelected = selectedResponse.ok && (await selectedResponse.json() as Array<{ id: string }>).length > 0
  const response = await fetch(endpoint(existing ? `?id=eq.${encodeURIComponent(existing.id)}` : ''), { method: existing ? 'PATCH' : 'POST', headers, body: JSON.stringify({ ...values, is_selected: existing ? undefined : !hasSelected, updated_at: new Date().toISOString() }) })
  if (!response.ok) return NextResponse.json({ error: 'Unable to create template.' }, { status: 502 })
  return NextResponse.json({ template: existing ? { ...values, id: existing.id } : (await response.json())[0] })
}

export async function GET(request: Request) {
  const ownerEmail = new URL(request.url).searchParams.get('ownerEmail')?.trim()
  if (!supabaseUrl || !supabaseKey || !ownerEmail) return NextResponse.json({ templates: [] })
  const response = await fetch(endpoint(`?owner_email=eq.${encodeURIComponent(ownerEmail)}&select=id,ticket_id,event_name,template_name,sender_name,recipient_name,recipient_email,event_date,venue,seat_info,event_url,banner_image,logo_image,subject,html,is_selected,created_at,updated_at&order=created_at.desc`), { headers, cache: 'no-store' })
  if (!response.ok) return NextResponse.json({ error: 'Unable to load inbox.' }, { status: 502 })
  return NextResponse.json({ templates: await response.json() })
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null)
  if (!supabaseUrl || !supabaseKey || !body?.id || !body?.ownerEmail) return NextResponse.json({ error: 'Invalid template.' }, { status: 400 })
  const allowed = ['sender_name', 'recipient_name', 'recipient_email', 'event_date', 'venue', 'seat_info', 'event_url', 'banner_image', 'logo_image', 'subject', 'template_name', 'html']
  const patch = Object.fromEntries(Object.entries(body).filter(([key, value]) => allowed.includes(key) && typeof value === 'string'))
  patch.updated_at = new Date().toISOString()
  const response = await fetch(endpoint(`?id=eq.${encodeURIComponent(body.id)}&owner_email=eq.${encodeURIComponent(body.ownerEmail)}`), { method: 'PATCH', headers, body: JSON.stringify(patch) })
  if (!response.ok) return NextResponse.json({ error: 'Unable to save template.' }, { status: 502 })
  return NextResponse.json({ ok: true })
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null)
  if (!supabaseUrl || !supabaseKey || !body?.id || !body?.ownerEmail) return NextResponse.json({ error: 'Invalid template selection.' }, { status: 400 })
  const owner = encodeURIComponent(String(body.ownerEmail))
  await fetch(endpoint(`?owner_email=eq.${owner}&ticket_id=eq.${encodeURIComponent(String(body.ticketId))}`), { method: 'PATCH', headers, body: JSON.stringify({ is_selected: false, updated_at: new Date().toISOString() }) })
  const response = await fetch(endpoint(`?id=eq.${encodeURIComponent(String(body.id))}&owner_email=eq.${owner}`), { method: 'PATCH', headers, body: JSON.stringify({ is_selected: true, updated_at: new Date().toISOString() }) })
  if (!response.ok) return NextResponse.json({ error: 'Unable to select template.' }, { status: 502 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => null)
  if (!supabaseUrl || !supabaseKey || !body?.ownerEmail || (!body?.id && !body?.ticketId)) return NextResponse.json({ error: 'Invalid template.' }, { status: 400 })
  const filter = body.id ? `id=eq.${encodeURIComponent(body.id)}` : `ticket_id=eq.${encodeURIComponent(body.ticketId)}`
  const response = await fetch(endpoint(`?${filter}&owner_email=eq.${encodeURIComponent(body.ownerEmail)}`), { method: 'DELETE', headers })
  if (!response.ok) return NextResponse.json({ error: 'Unable to delete template.' }, { status: 502 })
  return NextResponse.json({ ok: true })
}
