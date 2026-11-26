'use client'

import { Search } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function HomeSkeleton({ city }: { city: string }) {
  return (
    <div role="status" aria-label={`Loading events near ${city}`} aria-busy="true" className="pb-6">
      <span className="sr-only">Loading events near {city}</span>
      <div className="mx-4 flex h-[62px] items-center rounded-[999px] bg-[#2A2A2A] pl-2.5 pr-5" aria-hidden="true">
        <span className="flex size-[48px] shrink-0 items-center justify-center rounded-full bg-tm-blue">
          <Search size={26} strokeWidth={2.1} className="text-white" />
        </span>
        <Skeleton className="ml-3.5 h-4 w-36 rounded" />
      </div>

      <section className="mt-8" aria-hidden="true">
        <Skeleton className="mx-4 mb-4 h-6 w-28 rounded" />
        <div className="no-scrollbar flex gap-3 overflow-hidden px-4">
          {[0, 1].map((card) => (
            <div key={card} className="h-[220px] w-[248px] shrink-0 border border-white/[0.04] bg-[#171717]">
              <Skeleton className="h-[142px] rounded-none" />
              <div className="flex h-[78px] items-center gap-2 bg-black px-3 py-2">
                <div className="flex w-11 shrink-0 flex-col items-start gap-1">
                  <Skeleton className="h-2 w-6 rounded" />
                  <Skeleton className="h-7 w-8 rounded" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Skeleton className="h-3 w-4/5 rounded" />
                  <Skeleton className="h-3 w-full rounded" />
                </div>
                <Skeleton className="size-6 shrink-0 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8" aria-hidden="true">
        <div className="mb-5 flex items-center justify-between px-4">
          <Skeleton className="h-6 w-44 rounded" />
          <Skeleton className="h-4 w-12 rounded" />
        </div>
        <div className="trending-carousel no-scrollbar flex snap-x snap-mandatory gap-3 overflow-hidden px-4 pb-1">
          {[0, 1].map((column) => (
            <div key={column} className="flex w-[88%] shrink-0 snap-start flex-col gap-2.5">
              {[0, 1, 2].map((row) => (
                <div key={row} className="flex min-h-[68px] items-center gap-2">
                  <span className="trending-rank w-12 shrink-0 text-center text-[32px] leading-none">{String(column * 3 + row + 1).padStart(2, '0')}</span>
                  <div className="flex min-h-[64px] min-w-0 flex-1 items-center gap-2 border border-[#26262c] bg-[#111215] px-2 py-1.5">
                    <Skeleton className="h-12 w-[68px] shrink-0 rounded-[6px]" />
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <Skeleton className="h-3.5 w-4/5 rounded" />
                      <Skeleton className="h-3 w-2/5 rounded" />
                    </div>
                    <Skeleton className="size-9 shrink-0 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8" aria-hidden="true">
        <div className="mb-4 flex items-center justify-between px-4">
          <Skeleton className="h-6 w-36 rounded" />
          <Skeleton className="h-4 w-12 rounded" />
        </div>
        <div className="no-scrollbar flex gap-3 overflow-hidden px-4">
          <Skeleton className="h-[196px] w-[220px] shrink-0 rounded-none" />
          <Skeleton className="h-[196px] w-[220px] shrink-0 rounded-none" />
        </div>
      </section>
    </div>
  )
}
