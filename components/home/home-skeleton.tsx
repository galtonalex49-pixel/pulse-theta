'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function HomeSkeleton({ city }: { city: string }) {
  return (
    <div role="status" aria-label={`Loading events near ${city}`} aria-busy="true" className="pb-6">
      <span className="sr-only">Loading events near {city}</span>
      <Skeleton className="mx-4 h-[62px] rounded-full" />

      <section className="mt-8" aria-hidden="true">
        <Skeleton className="mx-4 mb-4 h-6 w-28 rounded" />
        <div className="no-scrollbar flex gap-3 overflow-hidden px-4">
          {[0, 1].map((card) => (
            <div key={card} className="h-[220px] w-[280px] shrink-0 border border-white/[0.04] bg-[#171717]">
              <Skeleton className="h-[142px] rounded-none" />
              <div className="flex h-[78px] items-center gap-3 px-3">
                <Skeleton className="h-10 w-9 rounded" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-3 w-3/4 rounded" />
                  <Skeleton className="h-3 w-full rounded" />
                </div>
                <Skeleton className="size-6 rounded-full" />
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
        <div className="flex flex-col gap-2.5 px-4">
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex min-h-[68px] items-center gap-2">
              <Skeleton className="h-8 w-11 rounded" />
              <div className="flex min-w-0 flex-1 items-center gap-2.5 border border-white/[0.04] bg-[#151515] px-2 py-1.5">
                <Skeleton className="size-[54px] shrink-0 rounded-none" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-3.5 w-4/5 rounded" />
                  <Skeleton className="h-3 w-2/5 rounded" />
                </div>
                <Skeleton className="size-7 rounded-full" />
              </div>
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
