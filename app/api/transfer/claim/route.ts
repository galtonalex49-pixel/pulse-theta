import { NextResponse } from 'next/server'

function headers() { const key = process.env.SUPABASE_KEY; const secret = process.env.SUPABASE_SECRET; return { apikey: key ?? secret ?? '', Authorization: `Bearer ${secret ?? key ?? ''}`, 'Content-Type': 'application/json', Prefer: 'return=representation' } }

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token')
  if (!token || !process.env.SUPABASE_URL) return NextResponse.json({ error: 'Invalid transfer link.' }, { status: 400 })
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/transfers?transfer_token=eq.${encodeURIComponent(token)}&select=id,ticket_id,status,unlocks_at,event_name,event_date,venue,ticket_details`, { headers: headers(), cache: 'no-store' })
  if (!response.ok) return NextResponse.json({ error: 'Unable to load transfer.' }, { status: 502 })
  const rows = await response.json()
  if (!rows[0]) return NextResponse.json({ error: 'Transfer not found.' }, { status: 404 })
  return NextResponse.json(rows[0])
}

export async function POST(request: Request) {
  const { token } = await request.json().catch(() => ({ token: '' }))
  if (!token || !process.env.SUPABASE_URL) return NextResponse.json({ error: 'Invalid transfer link.' }, { status: 400 })
  const unlocksAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/transfers?transfer_token=eq.${encodeURIComponent(token)}&status=eq.pending`, { method: 'PATCH', headers: headers(), body: JSON.stringify({ status: 'accepted', unlocks_at: unlocksAt }) })
  if (!response.ok) return NextResponse.json({ error: 'Could not accept transfer.' }, { status: 502 })
  const rows = await response.json()
  if (!rows[0]) return NextResponse.json({ error: 'Transfer is already accepted or invalid.' }, { status: 409 })
  return NextResponse.json(rows[0])
}
