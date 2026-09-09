import { Link, useParams } from 'react-router-dom'
import { CalendarGrid } from '../components/CalendarGrid'
import { CutStatsView } from '../components/CutStatsView'
import { ScreenSkeleton } from '../components/Skeleton'
import { useCutData } from '../hooks/useCutData'
import { formatLongDate } from '../lib/date'

/** Read-only view of a past cut: no day sheet, no editing. */
export function CutDetail() {
  const { cutId } = useParams<{ cutId: string }>()
  const { cut, entries, loading, error } = useCutData(cutId)

  if (loading) return <ScreenSkeleton />

  if (error || !cut) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-gray-500">{error ?? "That cut doesn't exist."}</p>
        <Link
          to="/settings"
          className="min-h-11 rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700"
        >
          Back to Settings
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 px-6 py-8">
      <header>
        <Link to="/settings" className="text-sm text-gray-500">
          ‹ Settings
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-gray-900">
          {formatLongDate(cut.start_date)} — {cut.end_date ? formatLongDate(cut.end_date) : 'Present'}
        </h1>
        <p className="text-sm text-gray-400">Read-only</p>
      </header>

      <CalendarGrid cut={cut} entries={entries} />
      <CutStatsView cut={cut} entries={entries} />
    </div>
  )
}
