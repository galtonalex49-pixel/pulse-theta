'use client'

import { useState } from 'react'
import {
  ArrowRight,
  Bell,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Eye,
  FileText,
  Heart,
  Mail,
  MapPin,
  MessageSquareText,
  Navigation,
  ShieldCheck,
  UserPen,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { useTranslation } from '@/lib/use-translation'
import { AdminDashboard } from './admin-dashboard'

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-2 mt-6 text-base font-extrabold leading-5">{children}</h2>
}

function Row({
  icon,
  label,
  onClick,
  href,
}: {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  href?: string
}) {
  const content = (
    <>
      <span className="flex w-7 shrink-0 justify-center text-[#d4d4dc]" aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-white">{label}</span>
      <ChevronRight size={19} className="shrink-0 text-[#9e9ea8]" aria-hidden="true" />
    </>
  )
  const cls =
    'flex min-h-[48px] w-full items-center gap-3 border-b border-[#26262c] bg-transparent px-3 text-left last:border-b-0'
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {content}
      </a>
    )
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {content}
    </button>
  )
}

function ToggleRow({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ReactNode
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex min-h-[52px] items-center gap-3 border-b border-[#26262c] px-3 last:border-b-0">
      <span className="flex w-7 shrink-0 justify-center text-[#d4d4dc]" aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-white">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-[30px] w-[52px] shrink-0 rounded-full transition-colors ${
          checked ? 'bg-tm-blue' : 'bg-[#52525b]'
        }`}
      >
        <span
          className={`absolute top-[3px] size-6 rounded-full bg-white shadow transition-all ${
            checked ? 'left-[25px]' : 'left-[3px]'
          }`}
        />
      </button>
    </div>
  )
}

export function AccountTab() {
  const { accountPage, setAccountPage, setTab, setLocationSheetOpen } = useApp()
  const { t } = useTranslation()
  const [locationContent, setLocationContent] = useState(false)
  const [notifications, setNotifications] = useState(true)

  if (accountPage === 'edit') return <AdminDashboard onBack={() => setAccountPage('main')} />

  return (
    <div className="compact-screen mx-auto h-full w-full max-w-[430px] overflow-x-hidden overflow-y-auto px-4 pb-20 pt-[max(env(safe-area-inset-top),12px)]">
      <header className="mb-6">
        <button
          type="button"
          onClick={() => setAccountPage('edit')}
          aria-label="Sign in or manage account details"
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-tm-blue text-base font-extrabold text-white"
        >
          Sign In <ArrowRight size={20} aria-hidden="true" />
        </button>
      </header>

      <SectionTitle>{t('personalization')}</SectionTitle>
      <div className="overflow-hidden rounded-[10px] border border-[#26262c] bg-[#1a1a1e]">
        <Row icon={<Mail size={20} strokeWidth={1.6} />} label="My Inbox" onClick={() => setAccountPage('edit')} />
        <Row icon={<Heart size={20} strokeWidth={1.6} />} label={t('favorites')} onClick={() => setTab('watchlist')} />
        <Row
          icon={<MapPin size={20} strokeWidth={1.5} />}
          label={t('location')}
          onClick={() => {
            setTab('home')
            setLocationSheetOpen(true)
          }}
        />
      </div>

      <SectionTitle>{t('permissions')}</SectionTitle>
      <div className="overflow-hidden rounded-[10px] border border-[#26262c] bg-[#1a1a1e]">
        <ToggleRow
          icon={<Navigation size={20} className="fill-current" />}
          label={t('locationContent')}
          checked={locationContent}
          onChange={setLocationContent}
        />
        <ToggleRow
          icon={<Bell size={20} strokeWidth={1.6} />}
          label={t('notifications')}
          checked={notifications}
          onChange={setNotifications}
        />
      </div>

      <SectionTitle>{t('accountSection')}</SectionTitle>
      <div className="overflow-hidden rounded-[10px] border border-[#26262c] bg-[#1a1a1e]">
        <Row
          icon={<UserPen size={20} strokeWidth={1.5} />}
          label={t('editDetails')}
          onClick={() => setAccountPage('edit')}
        />
        <Row icon={<ShieldCheck size={20} strokeWidth={1.5} />} label={t('security')} />
        <Row icon={<CreditCard size={20} strokeWidth={1.5} />} label={t('savedPaymentMethods')} />
      </div>

      <SectionTitle>{t('helpGuidance')}</SectionTitle>
      <div className="overflow-hidden rounded-[10px] border border-[#26262c] bg-[#1a1a1e]">
        <Row
          icon={<CircleHelp size={20} strokeWidth={1.5} />}
          label={t('needHelp')}
          href="https://help.ticketmaster.com"
        />
        <Row icon={<MessageSquareText size={20} strokeWidth={1.5} />} label={t('feedback')} />
        <Row icon={<Eye size={20} strokeWidth={1.5} />} label={t('privacy')} />
        <Row icon={<FileText size={20} strokeWidth={1.5} />} label={t('legal')} />
      </div>
    </div>
  )
}
