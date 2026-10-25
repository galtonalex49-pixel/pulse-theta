import { NextResponse } from 'next/server'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
const headers = { apikey: supabaseKey ?? '', Authorization: `Bearer ${supabaseKey ?? ''}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }

function endpoint(query = '') { return `${supabaseUrl}/rest/v1/transfer_email_templates${query}` }

export async function GET(request: Request) {
  const ownerEmail = new URL(request.url).searchParams.get('ownerEmail')?.trim()
  if (!supabaseUrl || !supabaseKey || !ownerEmail) return NextResponse.json({ templates: [] })
  const response = await fetch(endpoint(`?owner_email=eq.${encodeURIComponent(ownerEmail)}&select=id,ticket_id,event_name,template_name,sender_name,recipient_name,recipient_email,event_date,venue,seat_info,event_url,subject,html,created_at,updated_at&order=created_at.desc`), { headers, cache: 'no-store' })
  if (!response.ok) return NextResponse.json({ error: 'Unable to load inbox.' }, { status: 502 })
  return NextResponse.json({ templates: await response.json() })
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null)
  if (!supabaseUrl || !supabaseKey || !body?.id || !body?.ownerEmail) return NextResponse.json({ error: 'Invalid template.' }, { status: 400 })
  const allowed = ['sender_name', 'recipient_name', 'recipient_email', 'event_date', 'venue', 'seat_info', 'event_url', 'subject', 'template_name', 'html']
  const patch = Object.fromEntries(Object.entries(body).filter(([key, value]) => allowed.includes(key) && typeof value === 'string'))
  patch.updated_at = new Date().toISOString()
  const response = await fetch(endpoint(`?id=eq.${encodeURIComponent(body.id)}&owner_email=eq.${encodeURIComponent(body.ownerEmail)}`), { method: 'PATCH', headers, body: JSON.stringify(patch) })
  if (!response.ok) return NextResponse.json({ error: 'Unable to save template.' }, { status: 502 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => null)
  if (!supabaseUrl || !supabaseKey || !body?.id || !body?.ownerEmail) return NextResponse.json({ error: 'Invalid template.' }, { status: 400 })
  const response = await fetch(endpoint(`?id=eq.${encodeURIComponent(body.id)}&owner_email=eq.${encodeURIComponent(body.ownerEmail)}`), { method: 'DELETE', headers })
  if (!response.ok) return NextResponse.json({ error: 'Unable to delete template.' }, { status: 502 })
  return NextResponse.json({ ok: true })
}
