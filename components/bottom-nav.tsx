'use client'

import { Bookmark, CircleUser } from 'lucide-react'
import { useApp } from '@/lib/store'
import { useTranslation } from '@/lib/use-translation'
import type { TabId } from '@/lib/types'
import { HomeNavIcon, TicketsNavIcon } from './icons'

const TABS: { id: TabId }[] = [
  { id: 'home' },
  { id: 'watchlist' },
  { id: 'tickets' },
  { id: 'account' },
]

function TabIcon({ id, active }: { id: TabId; active: boolean }) {
  if (id === 'home') return <HomeNavIcon active={active} />
  if (id === 'tickets') return <TicketsNavIcon active={active} />
  if (id === 'watchlist') {
    return (
      <Bookmark
        size={24}
        strokeWidth={1.8}
        className={`size-6 ${active ? 'fill-tm-purple text-tm-purple' : 'text-white'}`}
        aria-hidden="true"
      />
    )
  }
  return (
    <CircleUser
      size={24}
      strokeWidth={1.6}
      className={`size-6 ${active ? 'text-tm-blue' : 'text-white'}`}
      aria-hidden="true"
    />
  )
}

export function BottomNav() {
  const { tab, setTab } = useApp()
  const { t } = useTranslation()
  const labels: Record<TabId, string> = {
    home: t('home'),
    watchlist: t('watchlist'),
    tickets: t('myTickets'),
    account: t('account'),
  }
  return (
    <nav
      aria-label={t('primaryNavigation')}
      className="fixed bottom-0 left-1/2 z-30 flex h-[76px] w-full max-w-[430px] -translate-x-1/2 items-stretch justify-between border-t border-[#1c1c21] bg-[#08080a] px-4 pb-[max(env(safe-area-inset-bottom),4px)] pt-1"
    >
      {TABS.map((t) => {
        const active = tab === t.id
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={active ? 'page' : undefined}
            className={`flex min-w-0 flex-1 basis-0 flex-col items-center justify-center overflow-hidden px-1 py-1 text-[11px] leading-[15px] ${
              active ? 'font-extrabold text-white' : 'font-normal text-[#9e9ea8]'
            }`}
          >
            <span className="flex size-7 shrink-0 items-center justify-center" aria-hidden="true">
              <TabIcon id={t.id} active={active} />
            </span>
            <span className="mt-1 leading-[18px]">{labels[t.id]}</span>
          </button>
        )
      })}
    </nav>
  )
}
