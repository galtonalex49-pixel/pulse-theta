'use client'

import { useState } from 'react'
import {
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
import { initials } from '@/lib/format'
import { AdminDashboard } from './admin-dashboard'

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 mt-10 px-4 text-[26px] font-extrabold">{children}</h2>
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
      <span className="flex w-8 shrink-0 justify-center text-white" aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate text-xl">{label}</span>
      <ChevronRight size={26} className="shrink-0 text-white/80" aria-hidden="true" />
    </>
  )
  const cls =
    'flex min-h-[52px] w-full items-center gap-3 border-b border-black/60 bg-[#232323] px-3 text-left'
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
    <div className="flex min-h-[72px] items-center gap-5 border-b border-black/60 bg-[#232323] px-5">
      <span className="flex w-8 shrink-0 justify-center" aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate text-xl">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-[40px] w-[78px] shrink-0 rounded-full transition-colors ${
          checked ? 'bg-tm-blue' : 'bg-[#5d5d5d]'
        }`}
      >
        <span
          className={`absolute top-[3px] h-[34px] w-[48px] rounded-full bg-white shadow transition-all ${
            checked ? 'left-[27px]' : 'left-[3px]'
          }`}
        />
      </button>
    </div>
  )
}

export function AccountTab() {
  const { profile, accountPage, setAccountPage, setTab, setLocationSheetOpen } = useApp()
  const [locationContent, setLocationContent] = useState(false)
  const [notifications, setNotifications] = useState(true)

  if (accountPage === 'edit') return <AdminDashboard onBack={() => setAccountPage('main')} />

  return (
    <div className="compact-screen mx-auto h-full w-full max-w-[430px] overflow-x-hidden overflow-y-auto px-4 pb-20 pt-[max(env(safe-area-inset-top),12px)]">
      <header className="flex items-center gap-5 px-4">
        <span
          aria-hidden="true"
          className="flex size-[84px] shrink-0 items-center justify-center rounded-full border-[5px] border-tm-blue text-[34px] font-extrabold"
        >
          {initials(profile.name)}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-[34px] font-extrabold leading-tight">{profile.name}</h1>
          <p className="truncate text-xl text-white/80">{profile.email}</p>
        </div>
      </header>

      <SectionTitle>Personalization</SectionTitle>
      <div>
        <Row icon={<Mail size={28} strokeWidth={1.5} />} label="My Inbox" />
        <Row icon={<Heart size={28} strokeWidth={1.5} />} label="Favorites" onClick={() => setTab('watchlist')} />
        <Row
          icon={<MapPin size={28} strokeWidth={1.5} />}
          label="Location"
          onClick={() => {
            setTab('home')
            setLocationSheetOpen(true)
          }}
        />
      </div>

      <SectionTitle>Permissions</SectionTitle>
      <div>
        <ToggleRow
          icon={<Navigation size={26} className="fill-white" />}
          label="Location Content"
          checked={locationContent}
          onChange={setLocationContent}
        />
        <ToggleRow
          icon={<Bell size={26} strokeWidth={1.5} />}
          label="Notifications"
          checked={notifications}
          onChange={setNotifications}
        />
      </div>

      <SectionTitle>Account</SectionTitle>
      <div>
        <Row
          icon={<UserPen size={28} strokeWidth={1.5} />}
          label="Edit Details"
          onClick={() => setAccountPage('edit')}
        />
        <Row icon={<ShieldCheck size={28} strokeWidth={1.5} />} label="Security" />
        <Row icon={<CreditCard size={28} strokeWidth={1.5} />} label="Saved Payment Methods" />
      </div>

      <SectionTitle>Help &amp; Guidance</SectionTitle>
      <div>
        <Row
          icon={<CircleHelp size={28} strokeWidth={1.5} />}
          label="Need Help?"
          href="https://help.ticketmaster.com"
        />
        <Row icon={<MessageSquareText size={28} strokeWidth={1.5} />} label="Give Us Feedback" />
        <Row icon={<Eye size={28} strokeWidth={1.5} />} label="Privacy" />
        <Row icon={<FileText size={28} strokeWidth={1.5} />} label="Legal" />
      </div>
    </div>
  )
}
