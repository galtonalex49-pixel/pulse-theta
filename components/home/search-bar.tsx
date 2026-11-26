'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useTranslation } from '@/lib/use-translation'

const KEYWORD_KEYS = ['teams', 'performers', 'festivals', 'shows'] as const

export function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation()
  const keywords = KEYWORD_KEYS.map((key) => t(key))
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % KEYWORD_KEYS.length), 2400)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="relative mx-4 flex h-[56px] items-center rounded-full bg-[#1f1f24] px-2.5 pr-5">
      <span className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-tm-blue">
        <Search size={20} strokeWidth={2.1} className="text-white" aria-hidden="true" />
      </span>
      <div className="relative ml-3 min-w-0 flex-1">
        {value === '' && (
          <p
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center gap-1 text-[15px] text-[#b5b5c0]"
          >
            <span>{t('searchFor')}</span>
            <span key={keywords[index]} className="animate-placeholder font-extrabold text-white">
              {keywords[index]}
            </span>
          </p>
        )}
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${t('searchFor')} ${keywords[index]}`}
          className="h-10 w-full bg-transparent text-[15px] font-normal text-white outline-none [&::-webkit-search-cancel-button]:appearance-none"
        />
      </div>
    </div>
  )
}
