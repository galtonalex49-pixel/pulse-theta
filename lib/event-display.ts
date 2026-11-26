import { getCurrencyForCountry } from './currency'
import type { Ticket } from './types'

const REGION_CODES = new Set(
  'AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY AB BC MB NB NL NS NT NU ON PE QC SK YT'.split(' '),
)
const KNOWN_VENUES: Record<string, { city: string; state: string }> = {
  'intuit dome': { city: 'Inglewood', state: 'CA' },
  'sofi stadium': { city: 'Inglewood', state: 'CA' },
  'rose bowl': { city: 'Pasadena', state: 'CA' },
  'rose bowl stadium': { city: 'Pasadena', state: 'CA' },
  'scotiabank arena': { city: 'Toronto', state: 'ON' },
}

function getLegacyPlace(ticket: Ticket) {
  const parts = (ticket.venueLocation ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 0) return { city: '', state: '' }
  if (parts[0]?.toLowerCase().startsWith(ticket.venue.toLowerCase())) parts.shift()

  let end = parts.length - 1
  const country = ticket.countryCode?.toUpperCase()
  const lastPart = parts[end]?.toUpperCase() ?? ''
  if (country && lastPart === country) end -= 1
  else if (!REGION_CODES.has(lastPart) && getCurrencyForCountry(lastPart)) end -= 1

  const state = parts[end]?.toUpperCase() ?? ''
  if (end > 0 && REGION_CODES.has(state)) {
    return { city: parts[end - 1], state }
  }

  return { city: parts[end] ?? '', state: '' }
}

export function getTicketVenueLabel(ticket: Ticket) {
  const legacyPlace = getLegacyPlace(ticket)
  const knownPlace = KNOWN_VENUES[ticket.venue.trim().toLowerCase()]
  const city = ticket.venueCity?.trim() || legacyPlace.city || knownPlace?.city || ''
  const state = ticket.venueState?.trim() || legacyPlace.state || knownPlace?.state || ''
  const place = [city, state].filter(Boolean).join(', ')

  return place ? `${ticket.venue} - ${place}` : ticket.venueLocation || ticket.venue
}
