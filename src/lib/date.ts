// Local calendar date as YYYY-MM-DD. Deliberately not toISOString(), which
// converts to UTC and can land on the wrong calendar day for timezones ahead
// of UTC (e.g. just after midnight local time is still "yesterday" in UTC).
export function toLocalDateISO(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
