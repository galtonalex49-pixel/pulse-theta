'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'

const KEYWORDS = ['Festivals', 'Shows', 'Comedy', 'Venues', 'Artists', 'Teams', 'Performers']

export function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % KEYWORDS.length), 2400)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="relative mx-4 flex h-[66px] items-center rounded-full bg-[#222] pl-3 pr-5">
      <span className="flex size-[50px] shrink-0 items-center justify-center rounded-full bg-tm-blue">
        <Search size={26} strokeWidth={2.2} aria-hidden="true" />
      </span>
      <div className="relative ml-4 min-w-0 flex-1">
        {value === '' && (
          <p
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center gap-1.5 text-xl text-white/45"
          >
            <span>Search for</span>
            <span key={KEYWORDS[index]} className="animate-placeholder font-extrabold text-white/90">
              {KEYWORDS[index]}
            </span>
          </p>
        )}
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`Search for ${KEYWORDS[index]}`}
          className="h-[50px] w-full bg-transparent text-xl font-bold text-white outline-none [&::-webkit-search-cancel-button]:appearance-none"
        />
      </div>
    </div>
  )
}
