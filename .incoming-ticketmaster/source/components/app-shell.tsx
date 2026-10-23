'use client'

import { AppProvider, useApp } from '@/lib/store'
import { BottomNav } from './bottom-nav'
import { HomeTab } from './home/home-tab'
import { LocationSheet } from './home/location-sheet'
import { WatchlistTab } from './watchlist/watchlist-tab'
import { MyTicketsTab } from './tickets/my-tickets-tab'
import { AccountTab } from './account/account-tab'

function ActiveTab() {
  const { tab } = useApp()
  switch (tab) {
    case 'home':
      return <HomeTab />
    case 'watchlist':
      return <WatchlistTab />
    case 'tickets':
      return <MyTicketsTab />
    case 'account':
      return <AccountTab />
  }
}

export function AppShell() {
  return (
    <AppProvider>
      <div className="flex h-dvh w-full justify-center bg-black">
        <div className="relative flex h-full w-full max-w-[480px] flex-col overflow-hidden bg-tm-surface">
          <main className="relative min-h-0 flex-1">
            <ActiveTab />
          </main>
          <BottomNav />
          <LocationSheet />
        </div>
      </div>
    </AppProvider>
  )
}
