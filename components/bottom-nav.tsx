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
        size={20}
        strokeWidth={1.8}
        className={`size-5 ${active ? 'fill-tm-purple text-tm-purple' : ''}`}
        aria-hidden="true"
      />
    )
  }
  return active ? (
    <span className="flex size-5 items-center justify-center rounded-full bg-tm-blue-light" aria-hidden="true">
      <UserRound size={20} className="size-4 fill-white text-white" />
    </span>
  ) : (
    <CircleUser size={20} strokeWidth={1.6} className="size-5" aria-hidden="true" />
  )
}

export function BottomNav() {
  const { tab, setTab } = useApp()
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 z-[9999] flex h-[76px] w-full items-stretch justify-between border-t border-[#222] bg-[#0A0A0A] px-4 pb-[max(env(safe-area-inset-bottom),4px)] pt-1"
    >
      {TABS.map((t) => {
        const active = tab === t.id
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={active ? 'page' : undefined}
            className={`flex min-w-0 flex-1 basis-0 flex-col items-center justify-center overflow-hidden px-1 py-1 text-[14px] font-semibold leading-[18px] ${
              active ? 'text-white' : 'text-[#8a8a8a]'
            }}`}
          >
            <span className="flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
              <TabIcon id={t.id} active={active} />
            </span>
            <span className="mt-1 leading-[18px]">{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
