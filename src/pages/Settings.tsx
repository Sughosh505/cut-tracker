import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getActiveCut, getCutDay } from '../services/cutService'
import { formatLongDate } from '../lib/date'
import type { Cut } from '../types/database'

export function Settings() {
  const { user, signOut } = useAuth()
  const [cut, setCut] = useState<Cut | null | undefined>(undefined)

  useEffect(() => {
    getActiveCut().then(setCut)
  }, [])

  return (
    <div className="mx-auto max-w-md px-6 py-8">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Settings</h1>

      {user && <p className="mb-6 text-sm text-gray-500">Signed in as {user.email}</p>}

      <div className="mb-8 rounded-lg border border-gray-200 p-4">
        <h2 className="mb-2 text-sm font-medium text-gray-700">Current Cut</h2>
        {cut === undefined && <p className="text-sm text-gray-400">Loading...</p>}
        {cut === null && <p className="text-sm text-gray-400">No active cut.</p>}
        {cut && (
          <dl className="flex flex-col gap-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <dt>Cut day</dt>
              <dd>{getCutDay(cut)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Start date</dt>
              <dd>{formatLongDate(cut.start_date)}</dd>
            </div>
            {cut.starting_weight != null && (
              <div className="flex justify-between">
                <dt>Starting weight</dt>
                <dd>{cut.starting_weight} kg</dd>
              </div>
            )}
            {cut.target_weight != null && (
              <div className="flex justify-between">
                <dt>Target weight</dt>
                <dd>{cut.target_weight} kg</dd>
              </div>
            )}
          </dl>
        )}
      </div>

      <button
        onClick={() => signOut()}
        className="min-h-11 w-full rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700"
      >
        Sign Out
      </button>
    </div>
  )
}
