import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePreferences } from '../contexts/PreferencesContext'
import { useToast } from '../contexts/ToastContext'
import { Skeleton } from '../components/Skeleton'
import { computeStats, computeWeightStats, endCut, getCuts, getEntries } from '../services/cutService'
import { formatLongDate, todayISO } from '../lib/date'
import { formatWeight, formatWeightDelta } from '../lib/weight'
import { downloadCsv, entriesToCsv } from '../lib/csv'
import { errorMessage } from '../lib/errors'
import type { Cut, DailyEntry } from '../types/database'

export function Settings() {
  const { user, signOut } = useAuth()
  const { weightUnit, setWeightUnit } = usePreferences()
  const { showToast, report } = useToast()
  const navigate = useNavigate()

  const [cuts, setCuts] = useState<Cut[] | null>(null)
  const [activeEntries, setActiveEntries] = useState<DailyEntry[]>([])
  const [confirmingEnd, setConfirmingEnd] = useState(false)
  const [ending, setEnding] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const allCuts = await getCuts()
      const active = allCuts.find((cut) => cut.status === 'ACTIVE') ?? null
      const entries = active ? await getEntries(active.id) : []
      return { allCuts, entries }
    }

    load().then(
      ({ allCuts, entries }) => {
        if (cancelled) return
        setCuts(allCuts)
        setActiveEntries(entries)
      },
      (err: unknown) => {
        if (cancelled) return
        setCuts([])
        showToast(errorMessage(err, 'Failed to load your cuts'))
      },
    )

    return () => {
      cancelled = true
    }
  }, [showToast])

  const activeCut = cuts?.find((cut) => cut.status === 'ACTIVE') ?? null
  const pastCuts = cuts?.filter((cut) => cut.status !== 'ACTIVE') ?? []
  const summary = activeCut ? computeStats(activeCut, activeEntries) : null
  const weight = activeCut ? computeWeightStats(activeCut, activeEntries) : null

  async function handleEndCut() {
    if (!activeCut) return
    setEnding(true)
    const ok = await report(async () => {
      await endCut(activeCut.id, todayISO())
      const refreshed = await getCuts()
      setCuts(refreshed)
      setActiveEntries([])
    }, 'Failed to end the cut')
    setEnding(false)
    setConfirmingEnd(false)
    if (ok) {
      showToast('Cut ended. Your history is still here.', 'success')
      navigate('/')
    }
  }

  function handleExport() {
    if (!activeCut) return
    const csv = entriesToCsv(activeCut, activeEntries, weightUnit)
    downloadCsv(`cut-${activeCut.start_date}.csv`, csv)
  }

  return (
    <div className="mx-auto max-w-md px-6 py-8">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Settings</h1>

      {user && <p className="mb-6 text-sm text-gray-500">Signed in as {user.email}</p>}

      <Card title="Current Cut">
        {cuts === null && <Skeleton className="h-20 w-full" />}
        {cuts !== null && !activeCut && (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-gray-400">No active cut.</p>
            <Link
              to="/start-cut"
              className="min-h-11 rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white"
            >
              Start a Cut
            </Link>
          </div>
        )}
        {activeCut && summary && (
          <>
            <dl className="flex flex-col gap-1 text-sm text-gray-600">
              <Row label="Start date" value={formatLongDate(activeCut.start_date)} />
              {activeCut.starting_weight != null && (
                <Row
                  label="Starting weight"
                  value={formatWeight(activeCut.starting_weight, weightUnit)}
                />
              )}
              {activeCut.target_weight != null && (
                <Row
                  label="Target weight"
                  value={formatWeight(activeCut.target_weight, weightUnit)}
                />
              )}
              {activeCut.calorie_target != null && (
                <Row label="Calorie target" value={`${activeCut.calorie_target} kcal`} />
              )}
              {activeCut.protein_target != null && (
                <Row label="Protein target" value={`${activeCut.protein_target} g`} />
              )}
            </dl>
            {activeCut.rules && (
              <p className="mt-3 whitespace-pre-wrap text-sm text-gray-500">{activeCut.rules}</p>
            )}

            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={handleExport}
                disabled={activeEntries.length === 0}
                className="min-h-11 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 disabled:opacity-40"
              >
                Export CSV
              </button>
              <button
                onClick={() => setConfirmingEnd(true)}
                className="min-h-11 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700"
              >
                End Cut
              </button>
            </div>
          </>
        )}
      </Card>

      <Card title="Weight units">
        <p className="mb-3 text-xs text-gray-400">
          Display only — weights are always stored in kg.
        </p>
        <div className="flex gap-2">
          {(['kg', 'lbs'] as const).map((unit) => (
            <button
              key={unit}
              aria-pressed={weightUnit === unit}
              onClick={() => report(() => setWeightUnit(unit), 'Failed to save preference')}
              className={`min-h-11 flex-1 rounded-lg border text-sm font-medium ${
                weightUnit === unit
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-300 text-gray-700'
              }`}
            >
              {unit}
            </button>
          ))}
        </div>
      </Card>

      <Card title="My Cuts">
        {cuts === null && <Skeleton className="h-16 w-full" />}
        {cuts !== null && pastCuts.length === 0 && (
          <p className="text-sm text-gray-400">
            Completed cuts show up here once you end your first one.
          </p>
        )}
        <ul className="flex flex-col">
          {pastCuts.map((cut) => (
            <li key={cut.id}>
              <Link
                to={`/cuts/${cut.id}`}
                className="flex min-h-11 items-center justify-between py-3 text-sm"
              >
                <span className="text-gray-700">
                  {formatLongDate(cut.start_date)} —{' '}
                  {cut.end_date ? formatLongDate(cut.end_date) : 'Present'}
                </span>
                <span className="text-gray-400">›</span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <button
        onClick={() => signOut()}
        className="min-h-11 w-full rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700"
      >
        Sign Out
      </button>

      {confirmingEnd && activeCut && summary && weight && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 px-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">End this cut?</h2>
            <dl className="mb-6 flex flex-col gap-1 text-sm text-gray-600">
              <Row label="Days" value={String(summary.greenDays + summary.redDays + summary.unloggedDays)} />
              <Row label="Green" value={String(summary.greenDays)} />
              <Row label="Red" value={String(summary.redDays)} />
              <Row
                label="Adherence"
                value={summary.adherence === null ? '—' : `${summary.adherence.toFixed(1)}%`}
              />
              <Row
                label="Weight change"
                value={weight.change == null ? '—' : formatWeightDelta(weight.change, weightUnit)}
              />
            </dl>
            <p className="mb-6 text-xs text-gray-400">
              Your history stays available afterwards.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmingEnd(false)}
                className="min-h-11 flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleEndCut}
                disabled={ending}
                className="min-h-11 flex-1 rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                {ending ? 'Ending...' : 'End Cut'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8 rounded-lg border border-gray-200 p-4">
      <h2 className="mb-2 text-sm font-medium text-gray-700">{title}</h2>
      {children}
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt>{label}</dt>
      <dd className="font-medium text-gray-900">{value}</dd>
    </div>
  )
}
