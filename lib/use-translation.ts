'use client'

import { useCallback } from 'react'
import { useApp } from './store'
import { cityLocale } from './locations'
import { translate, type TranslationKey, type TranslationValues } from './i18n'

export function useTranslation() {
  const { location } = useApp()
  const locale = cityLocale(location)
  const t = useCallback(
    (key: TranslationKey, values?: TranslationValues) => translate(locale, key, values),
    [locale],
  )

  return { locale, t }
}
