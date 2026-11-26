'use client'

import { useEffect, useState } from 'react'
import { AppProvider, useApp } from '@/lib/store'
import { useTranslation } from '@/lib/use-translation'
import { BottomNav } from './bottom-nav'
import { HomeTab } from './home/home-tab'
import { LocationSheet } from './home/location-sheet'
import { WatchlistTab } from './watchlist/watchlist-tab'
import { MyTicketsTab } from './tickets/my-tickets-tab'
import { AccountTab } from './account/account-tab'

function ActiveTab({ isHomeLoading }: { isHomeLoading: boolean }) {
  const { tab } = useApp()
  switch (tab) {
    case 'home':
      return <HomeTab isHomeLoading={isHomeLoading} />
    case 'watchlist':
      return <WatchlistTab />
    case 'tickets':
      return <MyTicketsTab />
    case 'account':
      return <AccountTab />
  }
}

function AppContent() {
  const { locale } = useTranslation()
  const { location, tab, ticketView } = useApp()
  const [isHomeLoading, setIsHomeLoading] = useState(true)
  const immersiveTicketView = tab === 'tickets' && ticketView.view !== 'landing'
  const locationKey = `${location.tmCountry}:${location.tmCity}`

  useEffect(() => {
    setIsHomeLoading(true)
    const timer = window.setTimeout(() => setIsHomeLoading(false), 2400)
    return () => window.clearTimeout(timer)
  }, [locationKey])

  return (
    <div lang={locale} dir={locale.startsWith('ar') ? 'rtl' : 'ltr'} className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-tm-black">
      <main className={`relative min-h-0 flex-1 ${immersiveTicketView ? '' : 'pb-[76px]'}`}>
        <ActiveTab isHomeLoading={isHomeLoading} />
      </main>
      {!immersiveTicketView && <BottomNav />}
      <LocationSheet />
    </div>
  )
}

export function AppShell() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
