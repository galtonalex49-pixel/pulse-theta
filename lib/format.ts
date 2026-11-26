import { translate } from './i18n'

export function parseLocal(dt: string): Date {
  const [datePart, timePart = '19:00'] = dt.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  const [hh, mm] = timePart.split(':').map(Number)
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0)
}

function formatDate(date: Date, locale: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(locale, options).format(date)
}

function formatTime(date: Date, locale: string) {
  return formatDate(date, locale, { hour: 'numeric', minute: '2-digit' })
}

export function dateBadge(dt: string, locale = 'en-US') {
  const date = parseLocal(dt)
  const label = formatDate(date, locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  return `${label} • ${formatTime(date, locale)}`.toLocaleUpperCase(locale)
}

export function dateLong(dt: string, locale = 'en-US') {
  const date = parseLocal(dt)
  const dateLabel = formatDate(date, locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  return `${dateLabel}, ${formatTime(date, locale)}`
}

export function monthDay(dt: string, locale = 'en-US') {
  const date = parseLocal(dt)
  const parts = new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short' }).formatToParts(date)
  const month = parts.find((part) => part.type === 'month')?.value ?? ''
  const day = parts.find((part) => part.type === 'day')?.value ?? ''
  return { month: month.toLocaleUpperCase(locale), day }
}

export function weekdayTime(dt: string, locale = 'en-US') {
  const date = parseLocal(dt)
  const weekday = formatDate(date, locale, { weekday: 'long' })
  return `${weekday} • ${formatTime(date, locale)}`
}

export function yearOf(dt: string) {
  return parseLocal(dt).getFullYear()
}

export function countdownText(dt: string, now: Date, locale = 'en-US') {
  const diff = parseLocal(dt).getTime() - now.getTime()
  if (diff <= 0) return translate(locale, 'countdownNow')
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days >= 1) {
    const unit = translate(locale, days === 1 ? 'countdownDay' : 'countdownDaysUnit')
    return translate(locale, 'countdownDays', { count: days, unit })
  }
  if (hours >= 1) {
    const unit = translate(locale, hours === 1 ? 'countdownHour' : 'countdownHoursUnit')
    return translate(locale, 'countdownHours', { count: hours, unit })
  }
  const count = Math.max(1, minutes)
  const unit = translate(locale, count === 1 ? 'countdownMinute' : 'countdownMinutesUnit')
  return translate(locale, 'countdownMinutes', { count, unit })
}

export function isPast(dt: string, now: Date) {
  return parseLocal(dt).getTime() < now.getTime()
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

export function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export function generateOrderNumber(existing: Iterable<string> = []) {
  const used = new Set(existing)
  const digits = '0123456789'
  const lettersAndDigits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const randomCharacter = (characters: string) => characters[Math.floor(Math.random() * characters.length)]
  let candidate = ''

  do {
    const leadingDigit = String(1 + Math.floor(Math.random() * 9))
    const numberPart = Array.from({ length: 5 }, () => randomCharacter(digits)).join('')
    const eventCode = Array.from({ length: 3 }, () => randomCharacter(lettersAndDigits)).join('')
    candidate = `#${leadingDigit}-${numberPart}/${eventCode}`
  } while (used.has(candidate))

  return candidate
}
