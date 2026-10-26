'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Pencil, Save, Trash2 } from 'lucide-react'
import { useApp } from '@/lib/store'

type Template = { id: string; ticket_id: string; event_name: string; template_name: string; is_selected?: boolean; banner_image?: string; sender_name: string; recipient_name: string; recipient_email: string; event_date: string; venue: string; seat_info: string; event_url: string; subject: string; html: string }

export function MyInbox({ onBack }: { onBack: () => void }) {
  const { profile, tickets } = useApp()
  const [templates, setTemplates] = useState<Template[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<Template>>({})

  const load = async () => {
    const response = await fetch(`/api/transfer/templates?ownerEmail=${encodeURIComponent(profile.email)}`, { cache: 'no-store' })
    if (response.ok) {
      const activeIds = new Set(tickets.map((ticket) => ticket.id))
      setTemplates(((await response.json()).templates ?? []).filter((template: Template) => activeIds.has(template.ticket_id)))
    }
  }
  useEffect(() => { void load() }, [profile.email, tickets])

  const save = async (template: Template) => {
    await fetch('/api/transfer/templates', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: template.id, ownerEmail: profile.email, ...draft }) })
    setEditing(null)
    await load()
  }
  const selectTemplate = async (id: string) => {
    const response = await fetch('/api/transfer/templates', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ownerEmail: profile.email }) })
    if (response.ok) await load()
  }

  const remove = async (id: string) => {
    if (!window.confirm('Delete this transfer template?')) return
    await fetch('/api/transfer/templates', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ownerEmail: profile.email }) })
    setTemplates((items) => items.filter((item) => item.id !== id))
    if (selected === id) setSelected(null)
  }

  return <div className="compact-screen mx-auto h-full w-full max-w-[430px] overflow-x-hidden overflow-y-auto px-4 pb-20 pt-[max(env(safe-area-inset-top),12px)]">
    <button type="button" onClick={onBack} className="mb-6 text-lg text-tm-blue">← Account</button>
    <h1 className="text-[32px] font-extrabold">My Inbox</h1>
    <p className="mt-2 text-base text-white/70">Transfer notices generated from your sent tickets.</p>
    <div className="mt-7 flex flex-col gap-3">
      {templates.length === 0 ? <div className="rounded-xl border border-white/15 bg-white/5 p-6 text-center text-white/70">Your generated transfer templates will appear here after you send a ticket transfer.</div> : templates.map((template) => {
        const open = selected === template.id
        const isEditing = editing === template.id
        return <article key={template.id} className="overflow-hidden rounded-xl border border-white/15 bg-[#232323]">
          <button type="button" onClick={() => setSelected(open ? null : template.id)} className="flex w-full items-center gap-3 p-4 text-left"><span className="min-w-0 flex-1"><strong className="block truncate text-lg">{template.template_name}</strong><span className="block truncate text-sm text-white/60">To {template.recipient_name || 'future recipient'} · {template.recipient_email || 'selected at transfer'}</span></span>{open ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}</button>
          {open && <div className="border-t border-white/10 p-4">
            {isEditing ? <div className="flex flex-col gap-3">{(['sender_name', 'recipient_name', 'recipient_email', 'event_date', 'venue', 'seat_info', 'event_url', 'subject'] as const).map((key) => <label key={key} className="flex flex-col gap-1 text-sm text-white/70"><span>{key.replaceAll('_', ' ')}</span><input value={(draft[key] as string) ?? template[key]} onChange={(event) => setDraft((value) => ({ ...value, [key]: event.target.value }))} className="rounded-md border border-white/20 bg-black/20 px-3 py-2 text-white outline-none focus:border-tm-blue" /></label>)}<div className="flex gap-2"><button type="button" onClick={() => void save(template)} className="flex items-center gap-2 rounded-md bg-tm-blue px-3 py-2 font-semibold"><Save aria-hidden="true" />Save</button><button type="button" onClick={() => setEditing(null)} className="rounded-md border border-white/20 px-3 py-2">Cancel</button></div></div> : <><div className="mb-3 flex flex-wrap gap-2"><button type="button" onClick={() => void selectTemplate(template.id)} disabled={template.is_selected} className="rounded-md bg-tm-blue px-3 py-2 text-sm font-semibold disabled:opacity-60">{template.is_selected ? 'Selected for all transfers' : 'Use for all transfers'}</button><button type="button" onClick={() => { setEditing(template.id); setDraft(template) }} className="flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 text-sm"><Pencil aria-hidden="true" />Edit</button><button type="button" onClick={() => void remove(template.id)} className="flex items-center gap-2 rounded-md border border-red-400/40 px-3 py-2 text-sm text-red-200"><Trash2 aria-hidden="true" />Delete</button></div><iframe title={`Preview of ${template.template_name}`} srcDoc={template.html} className="h-[560px] w-full rounded-lg bg-white" sandbox="allow-popups allow-popups-to-escape-sandbox" /></>}
          </div>}
        </article>
      })}
    </div>
  </div>
}
