import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DayDetailSheet } from '../components/DayDetailSheet'
import {
  getActiveCut,
  getCutDay,
  getEntries,
  saveEntry,
  type EntryValues,
} from '../services/cutService'
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

function pad(day: number, month: string): string {
  return `${month.slice(0, 7)}-${String(day).padStart(2, '0')}`
}

export function Calendar() {
  const [cut, setCut] = useState<Cut | null | undefined>(undefined)
  const [entries, setEntries] = useState<DailyEntry[]>([])
  const [month, setMonth] = useState(() => monthStart(todayISO()))
  const [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const today = todayISO()

  useEffect(() => {
    let cancelled = false

    async function loadCut() {
      const activeCut = await getActiveCut()
      const cutEntries = activeCut ? await getEntries(activeCut.id) : []
      return { activeCut, cutEntries }
    }

    loadCut().then(
      ({ activeCut, cutEntries }) => {
        if (cancelled) return
        setCut(activeCut)
        setEntries(cutEntries)
        // Land on the month the cut is actually in, not on today's month, in
        // case the whole cut is in the past.
        if (activeCut && today > (activeCut.end_date ?? today)) {
          setMonth(monthStart(activeCut.end_date ?? today))
        }
      },
      (err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load calendar')
      },
    )

    return () => {
      cancelled = true
    }
  }, [today])

  const byDate = useMemo(
    () => new Map(entries.map((entry) => [entry.date, entry])),
    [entries],
  )

  if (error) {
    return <div className="p-6 text-sm text-red-500">{error}</div>
  }

  if (cut === undefined) {
    return <div className="flex h-full items-center justify-center text-gray-400">Loading...</div>
  }

  if (cut === null) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-gray-500">No active cut to show.</p>
        <Link
          to="/start-cut"
          className="min-h-11 rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white"
        >
          Start a Cut
        </Link>
      </div>
    )
  }

  const lastDay = cut.end_date && cut.end_date < today ? cut.end_date : today
  const canGoBack = month > monthStart(cut.start_date)
  const canGoForward = month < monthStart(lastDay)

  const leadingBlanks = mondayIndex(month)
  const days = Array.from({ length: daysInMonth(month) }, (_, i) => pad(i + 1, month))

  async function handleSave(date: string, values: EntryValues) {
    if (!cut) return
    const saved = await saveEntry(cut.id, date, values)
    setEntries((current) => [...current.filter((e) => e.date !== date), saved])
    setSelected(null)
  }

  return (
    <div className="px-4 py-8">
      <header className="mb-6 flex items-center justify-between px-2">
        <button
          onClick={() => setMonth(addMonths(month, -1))}
          disabled={!canGoBack}
          aria-label="Previous month"
          className="min-h-11 min-w-11 rounded-lg text-lg text-gray-600 disabled:opacity-25"
        >
          ‹
        </button>
        <h1 className="text-sm font-medium tracking-wide text-gray-700">
          {formatMonthTitle(month).toUpperCase()}
        </h1>
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
              onClick={() => setSelected(date)}
              disabled={!inCut}
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

      {selected && (
        <DayDetailSheet
          date={selected}
          cutDay={getCutDay(cut, selected)}
          entry={byDate.get(selected) ?? null}
          onSave={(values) => handleSave(selected, values)}
          onClose={() => setSelected(null)}
        />
      )}
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
