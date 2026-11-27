'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Contact, FileText, Plus, Send } from 'lucide-react'
import { useApp } from '@/lib/store'
import { useTranslation } from '@/lib/use-translation'
import { dateBadge } from '@/lib/format'
import type { Seat, Ticket } from '@/lib/types'

type Step = 'loading' | 'auth' | 'select' | 'method' | 'details'

interface Group {
  key: string
  section: string
  row: string
  seats: Seat[]
}

function groupSeats(seats: Seat[]): Group[] {
  const map = new Map<string, Group>()
  for (const seat of seats) {
    const key = `${seat.section}|${seat.row}`
    const group = map.get(key) ?? { key, section: seat.section, row: seat.row, seats: [] }
    group.seats.push(seat)
    map.set(key, group)
  }
  return [...map.values()]
}

function SheetFrame({
  title,
  closeLabel,
  onClose,
  children,
  footer,
  tall = true,
}: {
  title: string
  closeLabel: string
  onClose: () => void
  children: React.ReactNode
  footer: React.ReactNode
  tall?: boolean
}) {
  return (
    <div className="absolute inset-0 z-50 mx-auto w-full max-w-[430px]" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/70"
      />
      <div
        className={`absolute inset-x-0 bottom-0 flex flex-col overflow-hidden rounded-t-[28px] bg-white text-[#222] ${
          tall ? 'h-[82%]' : 'h-[82%]'
        }`}
      >
        <div className="flex shrink-0 justify-center pt-3">
          <span className="h-1.5 w-[84px] rounded-full bg-[#c9c9c9]" />
        </div>
        <h2 className="shrink-0 border-b border-[#e3e3e3] pb-5 pt-5 text-center text-[21px] font-medium uppercase">
          {title}
        </h2>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        <div className="shrink-0 border-t border-[#e3e3e3] bg-[#f4f4f4] px-5 pb-[max(env(safe-area-inset-bottom),24px)] pt-5">
          {footer}
        </div>
      </div>
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoComplete,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  type?: string
  autoComplete?: string
}) {
  const id = `transfer-${label.replace(/\W/g, '').toLowerCase()}`
  return (
    <div className="mb-7">
      <label htmlFor={id} className="mb-3 block text-[18px]">
        {label}*
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-[4px] border-2 border-[#d4d4d4] bg-white px-3 text-[13px] text-[#222] outline-none placeholder:text-[#9a9a9a] focus:border-tm-blue"
      />
    </div>
  )
}

export function TransferModal({ ticket, onClose }: { ticket: Ticket; onClose: () => void }) {
  const { updateTicket, profile } = useApp()
  const { locale, t } = useTranslation()
  const [step, setStep] = useState<Step>('loading')
  const [code, setCode] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')
  const [email, setEmail] = useState('')
  const [contactsNote, setContactsNote] = useState('')
  const [sendError, setSendError] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setStep('auth'), 2600)
    return () => clearTimeout(timeout)
  }, [])

  const transferable = useMemo(() => ticket.seats.filter((s) => !s.transferStatus), [ticket.seats])
  const groups = useMemo(() => groupSeats(transferable), [transferable])
  const selectedSeats = transferable.filter((s) => selected.has(s.id))
  const selectedGroups = groupSeats(selectedSeats)
  const n = selectedSeats.length

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const pickContact = async () => {
    const nav = navigator as Navigator & {
      contacts?: { select: (props: string[], opts: { multiple: boolean }) => Promise<{ name?: string[]; email?: string[] }[]> }
    }
    if (!nav.contacts) {
      setContactsNote(t('contactsUnavailable'))
      return
    }
    try {
      const [contact] = await nav.contacts.select(['name', 'email'], { multiple: false })
      if (!contact) return
      const [firstName = '', ...rest] = (contact.name?.[0] ?? '').split(' ')
      setFirst(firstName)
      setLast(rest.join(' '))
      setEmail(contact.email?.[0] ?? '')
      setStep('details')
    } catch {
      setContactsNote(t('contactsUnable'))
    }
  }

  const complete = async () => {
    setSending(true)
    setSendError('')
    try {
      const senderName = profile.name?.trim() || t('accountHolder')
      const eventName = ticket.artist?.trim() || t('selectedEvent')
      const recipientName = `${first.trim()} ${last.trim()}`.trim()
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: ticket.id,
          ownerEmail: profile.email,
          eventUrl: `https://www.ticketmaster.com/search?q=${encodeURIComponent(ticket.artist)}`,
          bannerImage: ticket.posterUrl,
          recipientEmail: email.trim(),
          email: email.trim(),
          senderName,
          eventName,
          recipientName,
          eventDate: dateBadge(ticket.dateTime, locale),
          venue: ticket.venue,
          ticketDetails: { seats: selectedSeats, orderNumber: ticket.orderNumber },
        }),
      })
      if (!response.ok) {
        const result = await response.json().catch(() => null) as { error?: unknown } | null
        setSendError(typeof result?.error === 'string' ? result.error : t('unableSendTransfer'))
        setSending(false)
        return
      }
    } catch {
      setSendError(t('unableReachTransfer'))
      setSending(false)
      return
    }
    const label = `${first.trim()} ${last.trim().charAt(0)}`.toUpperCase()
    updateTicket(ticket.id, { seats: ticket.seats.map((s) => selected.has(s.id) ? { ...s, transferStatus: `Transfer Pending: ${label}` } : s) })
    setSending(false)
    onClose()
  }

  const formValid = first.trim() !== '' && last.trim() !== '' && /^\S+@\S+\.\S+$/.test(email.trim())

  if (step === 'loading') {
    return (
      <div
        className="absolute inset-0 z-50 flex flex-col bg-[#f7f8fc] text-[#222]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transfer-loading-title"
      >
        <div className="relative h-[20%] min-h-[150px] shrink-0 overflow-hidden bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ticket.posterUrl} alt="" className="h-full w-full object-cover object-top opacity-50" />
        </div>
        <header className="relative flex h-[76px] shrink-0 items-center justify-center bg-[#2a5bdc] text-white">
          <button type="button" onClick={onClose} className="absolute left-5 text-[20px] font-medium">
            {t('cancel')}
          </button>
          <h2 id="transfer-loading-title" className="text-[20px] font-medium">{t('preparingTransfer')}</h2>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center gap-7 px-6 pb-12 text-center">
          <div className="relative size-[88px]" aria-hidden="true">
            <span className="transfer-spinner-ring transfer-spinner-ring-outer" />
            <span className="transfer-spinner-ring transfer-spinner-ring-middle" />
            <span className="transfer-spinner-ring transfer-spinner-ring-inner" />
          </div>
          <div role="status" aria-live="polite">
            <p className="text-[19px] font-semibold">{t('gettingTicketsReady')}</p>
            <p className="mt-2 text-[15px] text-[#666]">{t('justAMoment')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'auth') {
    return (
      <div className="absolute inset-0 z-50 flex flex-col bg-white" role="dialog" aria-modal="true" aria-label={t('authentication')}>
        <div className="relative h-[20%] min-h-[150px] shrink-0 overflow-hidden bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ticket.posterUrl} alt="" className="h-full w-full object-cover object-top opacity-50" />
          <span className="absolute bottom-0 left-4 max-w-[90%] truncate bg-[#111]/90 px-6 pb-2 pt-3 text-[16px] font-extrabold uppercase tracking-wide text-white/60">
            {dateBadge(ticket.dateTime, locale)}
          </span>
        </div>
        <header className="relative flex h-[76px] shrink-0 items-center justify-center bg-[#2a5bdc] text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute left-5 text-[20px] font-medium"
          >
            {t('cancel')}
          </button>
          <h2 className="text-[20px] font-medium">{t('authentication')}</h2>
        </header>
        <div className="flex flex-1 items-center overflow-y-auto px-4 pb-16 pt-6">
          <div className="w-full rounded-lg bg-white p-7 text-[#222] shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
            <h3 className="text-[26px] font-extrabold leading-tight">{t('authenticateAccount')}</h3>
            <p className="mt-6 text-[18px] leading-snug">
              {t('oneTimeCodeSent')} {t('enterCodeBelow')}
            </p>
            <label htmlFor="one-time-code" className="mt-8 block text-[18px] text-[#555]">
              {t('oneTimeCode')}
            </label>
            <input
              id="one-time-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-3 h-[56px] w-full rounded-[4px] border-2 border-[#2a5bdc] bg-white px-4 text-[20px] outline-none"
            />
            <p className="mt-5 text-lg text-[#555]">{t('receiveCodeWait')}</p>
            <button
              type="button"
              disabled={code.trim() === ''}
              onClick={() => setStep('select')}
              className="mt-8 h-[56px] w-full rounded-[4px] bg-tm-blue text-2xl font-medium text-white disabled:bg-[#e0e0e0] disabled:text-[#888]"
            >
              {t('confirmCode')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'select') {
    return (
      <SheetFrame
        title={t('selectTicketsToTransfer')}
        closeLabel={t('closeTransfer')}
        onClose={onClose}
        footer={
          <div className="flex items-center justify-between">
            <span className="text-[21px]">{t('selectedCount', { count: n })}</span>
            <button
              type="button"
              disabled={n < 1}
              onClick={() => setStep('method')}
              className="flex items-center gap-3 text-[21px] font-medium uppercase text-tm-blue disabled:text-[#a5a5a5]"
            >
              {t('transferTo')}
              <ChevronRight size={26} aria-hidden="true" />
            </button>
          </div>
        }
      >
        {groups.length === 0 ? (
          <p className="px-6 py-12 text-center text-xl text-[#666]">
            {t('allTransferInProgress')}
          </p>
        ) : (
          groups.map((g) => (
            <section key={g.key} className="mx-5 border-b border-[#e3e3e3] pb-8">
              <div className="flex items-center justify-between py-8">
                <p className="min-w-0 truncate text-[21px]">
{t('section')} <b className="font-extrabold">{g.section}</b>, {t('row')} <b className="font-extrabold">{g.row}</b>
                </p>
                <p className="flex shrink-0 items-center gap-4 text-[21px]">
                  <FileText size={22} className="text-[#888]" aria-hidden="true" />
                  {g.seats.length} <b className="font-extrabold">{g.seats.length === 1 ? t('ticketUpper') : t('ticketsUpper')}</b>
                </p>
              </div>
              <ul className="flex flex-wrap gap-4">
                {g.seats.map((seat) => {
                  const checked = selected.has(seat.id)
                  return (
                    <li key={seat.id}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={checked}
                        onClick={() => toggle(seat.id)}
                        className={`flex w-[100px] flex-col overflow-hidden rounded-lg bg-white shadow-[0_4px_14px_rgba(0,0,0,0.14)] ${
                          checked ? 'outline outline-2 -outline-offset-2 outline-tm-blue' : ''
                        }`}
                      >
                        <span className="bg-tm-blue px-1 py-3 text-center text-[20px] font-medium uppercase text-white">
                          {t('seat')} {seat.seat}
                        </span>
                        <span className="flex h-[88px] items-center justify-center">
                          {checked ? (
                            <span className="flex size-[40px] items-center justify-center rounded-full bg-tm-blue">
                              <Check size={24} strokeWidth={3} className="text-white" aria-hidden="true" />
                            </span>
                          ) : (
                            <span className="size-[40px] rounded-full border-2 border-[#8a8a8a]" />
                          )}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))
        )}
      </SheetFrame>
    )
  }

  if (step === 'method') {
    return (
      <SheetFrame
        title={t('transferTo')}
        closeLabel={t('closeTransfer')}
        tall={false}
        onClose={onClose}
        footer={
          <button
            type="button"
            onClick={() => setStep('select')}
            className="flex items-center gap-4 text-[21px] font-medium text-tm-blue"
          >
            <ChevronLeft size={26} aria-hidden="true" />
            {t('back')}
          </button>
        }
      >
        <div className="px-5 pt-8">
          <button
            type="button"
            onClick={pickContact}
            className="flex h-[64px] w-full items-center justify-center gap-5 rounded-md border-2 border-[#333] text-[21px] font-medium"
          >
            {t('selectFromContacts')}
            <Contact size={34} strokeWidth={1.4} aria-hidden="true" />
          </button>
          {contactsNote && <p className="mt-3 text-base text-[#b00020]">{contactsNote}</p>}
          <button
            type="button"
            onClick={() => setStep('details')}
            className="mt-6 flex h-[64px] w-full items-center justify-center gap-5 rounded-md border-2 border-[#333] text-[21px] font-medium"
          >
            {t('enterEmailOrMobile')}
            <Plus size={34} strokeWidth={1.4} className="rounded-full border-2 border-[#333] p-1" aria-hidden="true" />
          </button>
          <div className="mt-8 flex flex-col items-center text-center">
            <span className="flex size-[110px] items-center justify-center rounded-full bg-[#eef0f5]">
              <Send size={56} strokeWidth={1.2} className="-ml-1 text-[#8a8f99]" aria-hidden="true" />
            </span>
            <p className="mt-8 text-[20px] text-[#555]">{t('transferTicketsBy')}</p>
            <p className="mt-5 text-[18px] leading-snug text-[#666]">
              {t('enterEmailToSend')}
            </p>
          </div>
        </div>
      </SheetFrame>
    )
  }

  return (
    <SheetFrame
      title={t('transferTickets')}
      closeLabel={t('closeTransfer')}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setStep('method')}
            className="flex items-center gap-4 text-[21px] font-medium text-tm-blue"
          >
            <ChevronLeft size={26} aria-hidden="true" />
            {t('back')}
          </button>
          <button
            type="button"
            disabled={!formValid || sending}
            onClick={complete}
            className="h-[42px] min-w-[150px] rounded-[4px] bg-tm-blue px-4 text-[13px] font-medium text-white disabled:bg-[#b4c3ee]"
          >
            {sending ? t('sending') : t('sendTransfer')}
          </button>
        </div>
      }
    >
      <div className="px-5 pt-8">
        <h3 className="text-[26px]">
          {t(n === 1 ? 'ticketSelected' : 'ticketsSelected', { count: n })}
        </h3>
        <div className="mb-8 mt-4 space-y-1 text-[18px]">
          {selectedGroups.map((g) => (
            <p key={g.key}>
              {t('section')} <b className="font-extrabold">{g.section}</b>, {t('row')} <b className="font-extrabold">{g.row}</b>, {t('seat')}{g.seats.length === 1 ? '' : 's'}{' '}
              <b className="font-extrabold">{g.seats.map((s) => s.seat).join(', ')}</b>
            </p>
          ))}
        </div>
        <TextField label={t('firstName')} value={first} onChange={setFirst} placeholder={t('enterFirstName')} autoComplete="given-name" />
        <TextField label={t('lastName')} value={last} onChange={setLast} placeholder={t('enterLastName')} autoComplete="family-name" />
        <TextField label={t('email')} type="email" value={email} onChange={setEmail} placeholder={t('enterEmailAddress')} autoComplete="email" />
        {sendError && <p role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{sendError}</p>}
      </div>
    </SheetFrame>
  )
}
