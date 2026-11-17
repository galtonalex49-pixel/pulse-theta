const DAYS_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

export function parseLocal(dt: string): Date {
  const [datePart, timePart = '19:00'] = dt.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  const [hh, mm] = timePart.split(':').map(Number)
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0)
}

function time12(date: Date) {
  const h = date.getHours()
  const m = date.getMinutes().toString().padStart(2, '0')
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return { text: `${h12}:${m}${suffix}`, spaced: `${h12}:${m} ${suffix}` }
}

/** SAT • 7 NOV 2026 • 7:00 PM */
export function dateBadge(dt: string) {
  const d = parseLocal(dt)
  return `${DAYS_SHORT[d.getDay()]} • ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()} • ${time12(d).spaced}`
}

/** Tue, Jan 12, 2027, 7:00 PM */
export function dateLong(dt: string) {
  const d = parseLocal(dt)
  const day = DAYS_SHORT[d.getDay()]
  const month = MONTHS_SHORT[d.getMonth()]
  return `${day[0]}${day.slice(1).toLowerCase()}, ${month[0]}${month.slice(1).toLowerCase()} ${d.getDate()}, ${d.getFullYear()}, ${time12(d).spaced}`
}

export function monthDay(dt: string) {
  const d = parseLocal(dt)
  return { month: MONTHS_SHORT[d.getMonth()], day: d.getDate().toString().padStart(2, '0') }
}

/** Tuesday • 7:00PM */
export function weekdayTime(dt: string) {
  const d = parseLocal(dt)
  return `${DAYS_LONG[d.getDay()]} • ${time12(d).text}`
}

export function yearOf(dt: string) {
  return parseLocal(dt).getFullYear()
}

export function countdownText(dt: string, now: Date) {
  const diff = parseLocal(dt).getTime() - now.getTime()
  if (diff <= 0) return 'Now'
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days >= 1) return `${days} ${days === 1 ? 'day' : 'days'}`
  if (hours >= 1) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
  const m = Math.max(1, minutes)
  return `${m} ${m === 1 ? 'minute' : 'minutes'}`
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
