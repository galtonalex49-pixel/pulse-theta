import type { City } from './types'

export const POPULAR_CITIES: City[] = [
  { name: 'London', label: 'UK', flag: 'gb', tmCountry: 'GB', locale: 'en-GB', tmCity: 'London', trendingLabel: 'The UK', lat: 51.5072, lng: -0.1276 },
  { name: 'New York City', label: 'New York, US', flag: 'us', tmCountry: 'US', locale: 'en-US', tmCity: 'New York', trendingLabel: 'The United States', lat: 40.7128, lng: -74.006 },
  { name: 'Toronto', label: 'Ontario, CA', flag: 'ca', tmCountry: 'CA', locale: 'en-CA', tmCity: 'Toronto', trendingLabel: 'Canada', lat: 43.6532, lng: -79.3832 },
  { name: 'Sydney', label: 'New South Wales, AU', flag: 'au', tmCountry: 'AU', locale: 'en-AU', tmCity: 'Sydney', trendingLabel: 'Australia', lat: -33.8688, lng: 151.2093 },
  { name: 'Auckland', label: 'NZ', flag: 'nz', tmCountry: 'NZ', locale: 'en-NZ', tmCity: 'Auckland', trendingLabel: 'New Zealand', lat: -36.8509, lng: 174.7645 },
  { name: 'Dublin', label: 'IE', flag: 'ie', tmCountry: 'IE', locale: 'en-IE', tmCity: 'Dublin', trendingLabel: 'Ireland', lat: 53.3498, lng: -6.2603 },
  { name: 'Mexico City', label: 'Ciudad de México, MX', flag: 'mx', tmCountry: 'MX', locale: 'es-MX', tmCity: 'Mexico City', trendingLabel: 'Mexico', lat: 19.4326, lng: -99.1332 },
  { name: 'Brussels', label: 'Brussels-Capital Region, BE', flag: 'be', tmCountry: 'BE', locale: 'fr-BE', tmCity: 'Brussels', trendingLabel: 'Belgium', lat: 50.8503, lng: 4.3517 },
  { name: 'Prague', label: 'Praha, CZ', flag: 'cz', tmCountry: 'CZ', locale: 'cs-CZ', tmCity: 'Prague', trendingLabel: 'the Czech Republic', lat: 50.0755, lng: 14.4378 },
  { name: 'Copenhagen', label: 'Hovedstaden, DK', flag: 'dk', tmCountry: 'DK', locale: 'da-DK', tmCity: 'Copenhagen', trendingLabel: 'Denmark', lat: 55.6761, lng: 12.5683 },
  { name: 'Berlin', label: 'DE', flag: 'de', tmCountry: 'DE', locale: 'de-DE', tmCity: 'Berlin', trendingLabel: 'Germany', lat: 52.52, lng: 13.405 },
  { name: 'Madrid', label: 'ES', flag: 'es', tmCountry: 'ES', locale: 'es-ES', tmCity: 'Madrid', trendingLabel: 'Spain', lat: 40.4168, lng: -3.7038 },
  { name: 'Amsterdam', label: 'Noord-Holland, NL', flag: 'nl', tmCountry: 'NL', locale: 'nl-NL', tmCity: 'Amsterdam', trendingLabel: 'the Netherlands', lat: 52.3676, lng: 4.9041 },
  { name: 'Oslo', label: 'NO', flag: 'no', tmCountry: 'NO', locale: 'nb-NO', tmCity: 'Oslo', trendingLabel: 'Norway', lat: 59.9139, lng: 10.7522 },
  { name: 'Vienna', label: 'Wien, AT', flag: 'at', tmCountry: 'AT', locale: 'de-AT', tmCity: 'Vienna', trendingLabel: 'Austria', lat: 48.2082, lng: 16.3738 },
  { name: 'Warsaw', label: 'Mazowieckie, PL', flag: 'pl', tmCountry: 'PL', locale: 'pl-PL', tmCity: 'Warsaw', trendingLabel: 'Poland', lat: 52.2297, lng: 21.0122 },
  { name: 'Johannesburg', label: 'Gauteng, ZA', flag: 'za', tmCountry: 'ZA', locale: 'en-ZA', tmCity: 'Johannesburg', trendingLabel: 'South Africa', lat: -26.2041, lng: 28.0473 },
  { name: 'Helsinki', label: 'Uusimaa, FI', flag: 'fi', tmCountry: 'FI', locale: 'fi-FI', tmCity: 'Helsinki', trendingLabel: 'Finland', lat: 60.1699, lng: 24.9384 },
  { name: 'Stockholm', label: 'SE', flag: 'se', tmCountry: 'SE', locale: 'sv-SE', tmCity: 'Stockholm', trendingLabel: 'Sweden', lat: 59.3293, lng: 18.0686 },
  { name: 'Zurich', label: 'CH', flag: 'ch', tmCountry: 'CH', locale: 'de-CH', tmCity: 'Zurich', trendingLabel: 'Switzerland', lat: 47.3769, lng: 8.5417 },
  { name: 'Dubai', label: 'AE', flag: 'ae', tmCountry: 'AE', locale: 'ar-AE', tmCity: 'Dubai', trendingLabel: 'the UAE', lat: 25.2048, lng: 55.2708 },
]

const byName = (n: string) => POPULAR_CITIES.find((c) => c.name === n)!

export const DEFAULT_CITY = byName('London')
export const DEFAULT_RECENT: City[] = [byName('London'), byName('New York City'), byName('Toronto')]

export function cityLine(city: City) {
  return `${city.name}, ${city.label}`
}

export function cityLocale(city: City): string {
  const normalizedCity = city.tmCity.trim().toLowerCase()
  const normalizedCountry = city.tmCountry.trim().toUpperCase()
  return (
    POPULAR_CITIES.find(
      (popularCity) =>
        popularCity.tmCity.toLowerCase() === normalizedCity &&
        popularCity.tmCountry.toUpperCase() === normalizedCountry,
    )?.locale ?? 'en-US'
  )
}

export function cityCountryLabel(city: City, locale: string): string {
  if (!city.tmCountry) return city.name
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(city.tmCountry) ?? city.trendingLabel
  } catch {
    return city.trendingLabel
  }
}

export function nearestCity(lat: number, lng: number): City {
  let best = POPULAR_CITIES[0]
  let bestD = Infinity
  for (const c of POPULAR_CITIES) {
    const d = (c.lat - lat) ** 2 + (c.lng - lng) ** 2
    if (d < bestD) {
      bestD = d
      best = c
    }
  }
  return best
}
