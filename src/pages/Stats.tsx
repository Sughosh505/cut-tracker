import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { WeightChart } from '../components/WeightChart'
import { computeWeightStats, getActiveCut, getEntries } from '../services/cutService'
import { usePreferences } from '../contexts/PreferencesContext'
import { formatRate, formatWeight, formatWeightDelta } from '../lib/weight'
import type { Cut, DailyEntry } from '../types/database'

export function Stats() {
  const { weightUnit } = usePreferences()
  const [cut, setCut] = useState<Cut | null | undefined>(undefined)
  const [entries, setEntries] = useState<DailyEntry[]>([])
  const [error, setError] = useState<string | null>(null)

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
        setError(err instanceof Error ? err.message : 'Failed to load stats')
      },
    )

    return () => {
      cancelled = true
    }
  }, [])

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

  const weight = computeWeightStats(cut, entries)

  return (
    <div className="flex flex-col gap-8 px-6 py-8">
      <section>
        <h1 className="mb-4 text-sm font-medium tracking-wide text-gray-500">WEIGHT</h1>
        <dl className="flex flex-col gap-2 text-sm">
          <Row
            label="Starting weight"
            value={
              weight.startingWeight == null
                ? '—'
                : formatWeight(weight.startingWeight, weightUnit)
            }
          />
          <Row
            label="Current weight"
            value={
              weight.currentWeight == null ? '—' : formatWeight(weight.currentWeight, weightUnit)
            }
          />
          <Row
            label="Change"
            value={weight.change == null ? '—' : formatWeightDelta(weight.change, weightUnit)}
          />
          <Row
            label="Avg weekly change"
            value={
              weight.avgWeeklyChange == null
                ? '—'
                : formatRate(weight.avgWeeklyChange, weightUnit)
            }
          />
        </dl>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-medium tracking-wide text-gray-500">TREND</h2>
        <WeightChart series={weight.series} unit={weightUnit} />
      </section>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900">{value}</dd>
    </div>
  )
}
