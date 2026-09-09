import { useState, type FormEvent } from 'react'
import { formatDayTitle } from '../lib/date'
import { unitToKg, weightToInput } from '../lib/weight'
import { usePreferences } from '../contexts/PreferencesContext'
import type { EntryValues } from '../services/cutService'
import type { DailyEntry, DayStatus } from '../types/database'

const STATUS_BUTTON: Record<DayStatus, string> = {
  GREEN: 'bg-green-500 active:bg-green-600',
  RED: 'bg-red-500 active:bg-red-600',
}

function numberOrNull(value: string): number | null {
  return value.trim() === '' ? null : Number(value)
}

function asInput(value: number | null | undefined): string {
  return value == null ? '' : String(value)
}

export function DayDetailSheet({
  date,
  cutDay,
  entry,
  onSave,
  onClose,
}: {
  date: string
  cutDay: number
  entry: DailyEntry | null
  onSave: (values: EntryValues) => Promise<void>
  onClose: () => void
}) {
  const { weightUnit } = usePreferences()
  const [status, setStatus] = useState<DayStatus | null>(entry?.status ?? null)
  const [weight, setWeight] = useState(weightToInput(entry?.weight ?? null, weightUnit))
  const [calories, setCalories] = useState(asInput(entry?.calories))
  const [protein, setProtein] = useState(asInput(entry?.protein))
  const [training, setTraining] = useState(entry?.training ?? false)
  const [notes, setNotes] = useState(entry?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!status) {
      setError('Pick GREEN or RED for this day.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave({
        status,
        weight: weight.trim() === '' ? null : unitToKg(Number(weight), weightUnit),
        calories: numberOrNull(calories),
        protein: numberOrNull(protein),
        training,
        notes: notes.trim() === '' ? null : notes.trim(),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex flex-col justify-end bg-black/30">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="flex-1 cursor-default"
      />
      <div className="mx-auto max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white px-6 pb-8 pt-6">
        <header className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">{formatDayTitle(date)}</h2>
          <p className="text-sm text-gray-500">CUT DAY {cutDay}</p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <div className="flex gap-3">
              {(['GREEN', 'RED'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={status === option}
                  onClick={() => setStatus(option)}
                  className={`min-h-12 flex-1 rounded-xl text-sm font-semibold tracking-wide text-white ${
                    STATUS_BUTTON[option]
                  } ${status === option ? 'ring-2 ring-gray-900 ring-offset-2' : 'opacity-60'}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Weight ({weightUnit})
            <input
              type="number"
              step="0.1"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="min-h-11 rounded-lg border border-gray-300 px-3"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Calories (kcal)
            <input
              type="number"
              inputMode="numeric"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="min-h-11 rounded-lg border border-gray-300 px-3"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Protein (g)
            <input
              type="number"
              inputMode="numeric"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              className="min-h-11 rounded-lg border border-gray-300 px-3"
            />
          </label>

          <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={training}
              onChange={(e) => setTraining(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300"
            />
            Trained today
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-11 flex-1 rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
