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

function ScaledApp() {
  const { appZoom } = useApp()
  const scale = 0.7 + appZoom * 0.3

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-tm-surface">
      <div
        className="app-scale relative flex h-full w-full flex-col overflow-hidden bg-tm-surface"
        style={{ '--app-content-scale': scale } as React.CSSProperties}
      >
        <main className="relative min-h-0 flex-1">
          <ActiveTab />
        </main>
        <BottomNav />
        <LocationSheet />
      </div>
    </div>
  )
}

export function AppShell() {
  return (
    <AppProvider>
      <ScaledApp />
    </AppProvider>
  )
}
