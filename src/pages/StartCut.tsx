import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { startCut } from '../services/cutService'
import { toLocalDateISO } from '../lib/date'

export function StartCut() {
  const navigate = useNavigate()
  const [startDate, setStartDate] = useState(toLocalDateISO())
  const [startingWeight, setStartingWeight] = useState('')
  const [targetWeight, setTargetWeight] = useState('')
  const [calorieTarget, setCalorieTarget] = useState('')
  const [proteinTarget, setProteinTarget] = useState('')
  const [rules, setRules] = useState('')
  const [plannedEndDate, setPlannedEndDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await startCut({
        startDate,
        startingWeight: startingWeight ? Number(startingWeight) : undefined,
        targetWeight: targetWeight ? Number(targetWeight) : undefined,
        calorieTarget: calorieTarget ? Number(calorieTarget) : undefined,
        proteinTarget: proteinTarget ? Number(proteinTarget) : undefined,
        rules: rules || undefined,
        plannedEndDate: plannedEndDate || undefined,
      })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start cut')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-8">
      <h1 className="mb-1 text-xl font-semibold text-gray-900">Start a Cut</h1>
      <p className="mb-6 text-sm text-gray-500">Only the start date is required.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Start date
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="min-h-11 rounded-lg border border-gray-300 px-3"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Starting weight (kg)
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            value={startingWeight}
            onChange={(e) => setStartingWeight(e.target.value)}
            className="min-h-11 rounded-lg border border-gray-300 px-3"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Target weight (kg)
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            value={targetWeight}
            onChange={(e) => setTargetWeight(e.target.value)}
            className="min-h-11 rounded-lg border border-gray-300 px-3"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Calorie target (kcal)
          <input
            type="number"
            inputMode="numeric"
            value={calorieTarget}
            onChange={(e) => setCalorieTarget(e.target.value)}
            className="min-h-11 rounded-lg border border-gray-300 px-3"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Protein target (g)
          <input
            type="number"
            inputMode="numeric"
            value={proteinTarget}
            onChange={(e) => setProteinTarget(e.target.value)}
            className="min-h-11 rounded-lg border border-gray-300 px-3"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Cutting rules
          <textarea
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            rows={3}
            className="rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Planned end date
          <input
            type="date"
            value={plannedEndDate}
            onChange={(e) => setPlannedEndDate(e.target.value)}
            className="min-h-11 rounded-lg border border-gray-300 px-3"
          />
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="min-h-11 rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? 'Starting...' : 'Start Cut'}
        </button>
      </form>
    </div>
  )
}
