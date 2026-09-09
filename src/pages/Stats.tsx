import { CutStatsView } from '../components/CutStatsView'
import { NoActiveCut } from '../components/NoActiveCut'
import { ScreenSkeleton } from '../components/Skeleton'
import { useCutData } from '../hooks/useCutData'

export function Stats() {
  const { cut, entries, loading, error } = useCutData()

  if (loading) return <ScreenSkeleton />
  if (error) return <NoActiveCut message={error} />
  if (!cut) return <NoActiveCut message="No active cut to show." />

  return (
    <div className="px-6 py-8">
      <CutStatsView cut={cut} entries={entries} />
    </div>
  )
}
