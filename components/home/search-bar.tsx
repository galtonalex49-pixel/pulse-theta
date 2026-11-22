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
    <div className="relative mx-4 flex h-[62px] items-center rounded-full bg-[#242424] pl-2.5 pr-5">
      <span className="flex size-[48px] shrink-0 items-center justify-center rounded-full bg-tm-blue">
        <Search size={26} strokeWidth={2.1} aria-hidden="true" />
      </span>
      <div className="relative ml-3.5 min-w-0 flex-1">
        {value === '' && (
          <p
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center gap-1 text-base text-white/55"
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
          className="h-10 w-full bg-transparent text-base font-medium text-white outline-none [&::-webkit-search-cancel-button]:appearance-none"
        />
      </div>
    </div>
  )
}
