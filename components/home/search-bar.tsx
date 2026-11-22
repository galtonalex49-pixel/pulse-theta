'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useTranslation } from '@/lib/use-translation'

const KEYWORD_KEYS = ['festivals', 'shows', 'comedy', 'venues', 'artists', 'teams', 'performers'] as const

export function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation()
  const keywords = KEYWORD_KEYS.map((key) => t(key))
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % KEYWORD_KEYS.length), 2400)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="relative mx-4 flex h-[42px] items-center rounded-full bg-[#222] pl-2 pr-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-tm-blue">
        <Search size={18} strokeWidth={2.2} aria-hidden="true" />
      </span>
      <div className="relative ml-3 min-w-0 flex-1">
        {value === '' && (
          <p
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center gap-1 text-[13px] text-white/45"
          >
            <span>{t('searchFor')}</span>
            <span key={keywords[index]} className="animate-placeholder font-extrabold text-white/90">
              {keywords[index]}
            </span>
          </p>
        )}
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${t('searchFor')} ${keywords[index]}`}
          className="h-8 w-full bg-transparent text-[13px] font-bold text-white outline-none [&::-webkit-search-cancel-button]:appearance-none"
        />
      </div>
    </div>
  )
}
