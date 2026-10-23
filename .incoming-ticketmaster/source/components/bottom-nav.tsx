'use client'

import { Bookmark, CircleUser, UserRound } from 'lucide-react'
import { useApp } from '@/lib/store'
import type { TabId } from '@/lib/types'
import { HomeNavIcon, TicketsNavIcon } from './icons'

const TABS: { id: TabId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'watchlist', label: 'Watchlist' },
  { id: 'tickets', label: 'My Tickets' },
  { id: 'account', label: 'Account' },
]

function TabIcon({ id, active }: { id: TabId; active: boolean }) {
  if (id === 'home') return <HomeNavIcon active={active} />
  if (id === 'tickets') return <TicketsNavIcon active={active} />
  if (id === 'watchlist') {
    return (
      <Bookmark
        size={28}
        strokeWidth={1.8}
        className={active ? 'fill-tm-purple text-tm-purple' : ''}
        aria-hidden="true"
      />
    )
  }
  return active ? (
    <span className="flex size-[30px] items-center justify-center rounded-full bg-tm-blue-light">
      <UserRound size={20} className="fill-white text-white" aria-hidden="true" />
    </span>
  ) : (
    <CircleUser size={30} strokeWidth={1.6} aria-hidden="true" />
  )
}

export function BottomNav() {
  const { tab, setTab } = useApp()
  return (
    <nav
      aria-label="Primary"
      className="z-30 flex shrink-0 items-stretch border-t border-white/5 bg-tm-surface pb-[max(env(safe-area-inset-bottom),12px)] pt-2"
    >
      {TABS.map((t) => {
        const active = tab === t.id
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={active ? 'page' : undefined}
            className={`flex flex-1 shrink-0 flex-col items-center gap-1 py-1 text-[13px] ${
              active ? 'font-extrabold text-white' : 'font-medium text-[#8a8a8a]'
            }`}
          >
            <TabIcon id={t.id} active={active} />
            <span className="leading-none">{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
