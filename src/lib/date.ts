/** Local-calendar date helpers. All dates are ISO `YYYY-MM-DD` strings in the
 *  user's own timezone — never UTC, or logging late in the evening would land
 *  on the wrong day. */

export function toISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function parseISODate(iso: string): Date {
  return new Date(iso + 'T00:00:00')
}

export function addDays(iso: string, days: number): string {
  const date = parseISODate(iso)
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

export function daysBetween(fromISO: string, toISO: string): number {
  const ms = parseISODate(toISO).getTime() - parseISODate(fromISO).getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

export function formatLongDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Weeks run Monday–Sunday, per the calendar grid in spec section 4.2. */
export function mondayIndex(iso: string): number {
  return (parseISODate(iso).getDay() + 6) % 7
}

export function monthStart(iso: string): string {
  return iso.slice(0, 7) + '-01'
}

export function addMonths(iso: string, months: number): string {
  const date = parseISODate(monthStart(iso))
  date.setMonth(date.getMonth() + months)
  return toISODate(date)
}

export function daysInMonth(iso: string): number {
  const date = parseISODate(iso)
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

export function formatMonthTitle(iso: string): string {
  return parseISODate(iso).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export function formatDayTitle(iso: string): string {
  return parseISODate(iso).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
}
