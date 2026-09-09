import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getActiveCut, getCutDay } from '../services/cutService'
import type { Cut } from '../types/database'

export function Home() {
  const [cut, setCut] = useState<Cut | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getActiveCut()
      .then(setCut)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load cut'))
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

  const cutDay = getCutDay(cut)
  const today = new Date().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
      <p className="text-sm font-medium tracking-wide text-gray-500">CUT DAY {cutDay}</p>
      <p className="text-sm text-gray-400">{today}</p>
    </div>
  )
}
