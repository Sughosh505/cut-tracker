import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  computeStats,
  computeWeightStats,
  getActiveCut,
  getCutDay,
  getEntries,
  logDay,
  updateEntryWeight,
  type CutStats,
} from '../services/cutService'
import { usePreferences } from '../contexts/PreferencesContext'
import { formatLongDate, todayISO } from '../lib/date'
import { formatWeightDelta, unitToKg, weightToInput } from '../lib/weight'
import type { Cut, DailyEntry, DayStatus, WeightUnit } from '../types/database'

const STATUS_LABEL: Record<DayStatus, string> = { GREEN: 'GREEN', RED: 'RED' }
const STATUS_SWATCH: Record<DayStatus, string> = { GREEN: 'bg-green-500', RED: 'bg-red-500' }
const STATUS_TEXT: Record<DayStatus, string> = { GREEN: 'text-green-600', RED: 'text-red-600' }
const STATUS_BUTTON: Record<DayStatus, string> = {
  GREEN: 'bg-green-500 active:bg-green-600',
  RED: 'bg-red-500 active:bg-red-600',
}

export function Home() {
  const { weightUnit } = usePreferences()
  const [cut, setCut] = useState<Cut | null | undefined>(undefined)
  const [entries, setEntries] = useState<DailyEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<DayStatus | null>(null)
  const [changing, setChanging] = useState(false)
  const [saving, setSaving] = useState(false)

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
      },
      (err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load cut')
      },
    )

    return () => {
      cancelled = true
    }
  }, [])

  async function handleLog(status: DayStatus) {
    if (!cut) return
    setSaving(true)
    setError(null)
    try {
      const entry = await logDay(cut.id, today, status)
      setEntries((current) => [...current.filter((e) => e.date !== today), entry])
      setPending(null)
      setChanging(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (error && cut === undefined) {
    return <div className="p-6 text-sm text-red-500">{error}</div>
  }

  if (cut === undefined) {
    return <div className="flex h-full items-center justify-center text-gray-400">Loading...</div>
  }

  if (cut === null) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-gray-500">You don't have an active cut yet.</p>
        <Link
          to="/start-cut"
          className="min-h-11 rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white"
        >
          Start a Cut
        </Link>
      </div>
    )
  }

  const todayEntry = entries.find((entry) => entry.date === today) ?? null
  const stats = computeStats(cut, entries, today)
  const weight = computeWeightStats(cut, entries)

  async function handleWeight(weightKg: number | null) {
    if (!cut) return
    const saved = await updateEntryWeight(cut.id, today, weightKg)
    setEntries((current) => [...current.filter((e) => e.date !== today), saved])
  }

  return (
    <div className="flex flex-col gap-8 px-6 py-10">
      <header className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm font-medium tracking-wide text-gray-500">
          CUT DAY {getCutDay(cut, today)}
        </p>
        <p className="text-sm text-gray-400">{formatLongDate(today)}</p>
      </header>

      {todayEntry && !changing ? (
        <section className="flex flex-col items-center gap-4">
          <div className={`h-16 w-16 rounded-2xl ${STATUS_SWATCH[todayEntry.status]}`} />
          <p className={`text-lg font-semibold tracking-wide ${STATUS_TEXT[todayEntry.status]}`}>
            {STATUS_LABEL[todayEntry.status]}
          </p>
          <button
            onClick={() => setChanging(true)}
            className="min-h-11 rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700"
          >
            Change Status
          </button>
        </section>
      ) : (
        <section className="flex flex-col items-center gap-4">
          <p className="text-sm font-medium tracking-wide text-gray-500">
            {changing ? 'CHANGE TODAY TO' : 'LOG TODAY'}
          </p>
          <div className="flex w-full gap-3">
            {(['GREEN', 'RED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => (changing ? setPending(status) : handleLog(status))}
                disabled={saving}
                className={`min-h-16 flex-1 rounded-xl text-base font-semibold tracking-wide text-white disabled:opacity-50 ${STATUS_BUTTON[status]}`}
              >
                {STATUS_LABEL[status]}
              </button>
            ))}
          </div>
          {changing && (
            <button
              onClick={() => {
                setChanging(false)
                setPending(null)
              }}
              className="min-h-11 text-sm font-medium text-gray-500"
            >
              Cancel
            </button>
          )}
        </section>
      )}

      {pending && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-sm text-gray-600">
            Change today to <span className={STATUS_TEXT[pending]}>{STATUS_LABEL[pending]}</span>?
          </p>
          <div className="flex w-full gap-3">
            <button
              onClick={() => setPending(null)}
              className="min-h-11 flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => handleLog(pending)}
              disabled={saving}
              className="min-h-11 flex-1 rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Confirm'}
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-center text-sm text-red-500">{error}</p>}

      {todayEntry && (
        <WeightPrompt
          key={todayEntry.id}
          entry={todayEntry}
          unit={weightUnit}
          onSave={handleWeight}
        />
      )}

      {stats.unloggedDays > 0 && (
        <Link
          to="/calendar"
          className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600"
        >
          <span>
            You have {stats.unloggedDays} unlogged {stats.unloggedDays === 1 ? 'day' : 'days'}.
          </span>
          <span className="font-medium text-gray-900">View</span>
        </Link>
      )}

      <StatsBlock stats={stats} weightChange={weight.change} unit={weightUnit} />
    </div>
  )
}

function WeightPrompt({
  entry,
  unit,
  onSave,
}: {
  entry: DailyEntry
  unit: WeightUnit
  onSave: (weightKg: number | null) => Promise<void>
}) {
  const [editing, setEditing] = useState(entry.weight == null)
  const [value, setValue] = useState(weightToInput(entry.weight, unit))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSave(value.trim() === '' ? null : unitToKg(Number(value), unit))
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save weight')
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-sm">
        <span className="text-gray-600">
          Weight {weightToInput(entry.weight, unit)} {unit}
        </span>
        <button onClick={() => setEditing(true)} className="font-medium text-gray-900">
          Edit
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div className="flex items-end gap-2">
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-gray-700">
          Today's weight ({unit}) — optional
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="min-h-11 rounded-lg border border-gray-300 px-3"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="min-h-11 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 disabled:opacity-50"
        >
          {saving ? '...' : 'Save'}
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  )
}

function StatsBlock({
  stats,
  weightChange,
  unit,
}: {
  stats: CutStats
  weightChange: number | null
  unit: WeightUnit
}) {
  return (
    <dl className="flex flex-col gap-4 border-t border-gray-200 pt-6">
      <Stat
        label="Current Streak"
        value={`${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'}`}
      />
      <Stat
        label="Adherence"
        value={stats.adherence === null ? '—' : `${stats.adherence.toFixed(1)}%`}
      />
      {weightChange !== null && (
        <Stat label="Weight" value={formatWeightDelta(weightChange, unit)} />
      )}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-sm text-gray-600">
          <dt>Green</dt>
          <dd className="font-medium text-gray-900">{stats.greenDays}</dd>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <dt>Red</dt>
          <dd className="font-medium text-gray-900">{stats.redDays}</dd>
        </div>
      </div>
    </dl>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-2xl font-semibold text-gray-900">{value}</dd>
    </div>
  )
}
