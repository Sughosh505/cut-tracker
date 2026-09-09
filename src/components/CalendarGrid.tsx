import { useMemo, useState } from 'react'
import {
  addMonths,
  daysInMonth,
  formatMonthTitle,
  mondayIndex,
  monthStart,
  todayISO,
} from '../lib/date'
import type { Cut, DailyEntry } from '../types/database'

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const CELL_STYLE = {
  GREEN: 'bg-green-500 text-white',
  RED: 'bg-red-500 text-white',
  GREY: 'bg-gray-100 text-gray-500',
  OUTSIDE: 'text-gray-300',
} as const

function dateInMonth(day: number, month: string): string {
  return `${month.slice(0, 7)}-${String(day).padStart(2, '0')}`
}

export function CalendarGrid({
  cut,
  entries,
  onSelectDay,
}: {
  cut: Cut
  entries: DailyEntry[]
  /** Omit to render read-only, for a completed cut. */
  onSelectDay?: (date: string) => void
}) {
  const today = todayISO()
  const lastDay = cut.end_date && cut.end_date < today ? cut.end_date : today

  // A live cut opens on the current month; a finished one opens at its start,
  // where its entries begin, rather than on a trailing empty month.
  const [month, setMonth] = useState(() =>
    monthStart(cut.end_date ? cut.start_date : lastDay),
  )

  const byDate = useMemo(() => new Map(entries.map((entry) => [entry.date, entry])), [entries])

  const canGoBack = month > monthStart(cut.start_date)
  const canGoForward = month < monthStart(lastDay)
  const leadingBlanks = mondayIndex(month)
  const days = Array.from({ length: daysInMonth(month) }, (_, i) => dateInMonth(i + 1, month))

  return (
    <div>
      <header className="mb-6 flex items-center justify-between px-2">
        <button
          onClick={() => setMonth(addMonths(month, -1))}
          disabled={!canGoBack}
          aria-label="Previous month"
          className="min-h-11 min-w-11 rounded-lg text-lg text-gray-600 disabled:opacity-25"
        >
          ‹
        </button>
        <h2 className="text-sm font-medium tracking-wide text-gray-700">
          {formatMonthTitle(month).toUpperCase()}
        </h2>
        <button
          onClick={() => setMonth(addMonths(month, 1))}
          disabled={!canGoForward}
          aria-label="Next month"
          className="min-h-11 min-w-11 rounded-lg text-lg text-gray-600 disabled:opacity-25"
        >
          ›
        </button>
      </header>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((label, i) => (
          <div key={i} className="pb-2 text-xs font-medium text-gray-400">
            {label}
          </div>
        ))}

        {Array.from({ length: leadingBlanks }, (_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {days.map((date) => {
          const inCut = date >= cut.start_date && date <= lastDay
          const entry = byDate.get(date)
          const state = !inCut ? 'OUTSIDE' : (entry?.status ?? 'GREY')

          return (
            <button
              key={date}
              onClick={() => onSelectDay?.(date)}
              disabled={!inCut || !onSelectDay}
              className={`flex aspect-square items-center justify-center rounded-lg text-sm ${
                CELL_STYLE[state]
              } ${date === today ? 'ring-2 ring-gray-900' : ''}`}
            >
              {Number(date.slice(8))}
            </button>
          )
        })}
      </div>

      <div className="mt-6 flex justify-center gap-4 text-xs text-gray-500">
        <Legend className="bg-green-500" label="Green" />
        <Legend className="bg-red-500" label="Red" />
        <Legend className="bg-gray-100" label="Unlogged" />
      </div>
    </div>
  )
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded ${className}`} />
      {label}
    </span>
  )
}
