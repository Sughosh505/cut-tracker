import { useCallback, useEffect, useState } from 'react'
import { getActiveCut, getCut, getEntries } from '../services/cutService'
import { errorMessage } from '../lib/errors'
import type { Cut, DailyEntry } from '../types/database'

interface Loaded {
  key?: string
  cut: Cut | null
  entries: DailyEntry[]
}

export interface CutData {
  cut: Cut | null
  entries: DailyEntry[]
  setEntries: (update: (current: DailyEntry[]) => DailyEntry[]) => void
  loading: boolean
  error: string | null
}

/** Loads a cut and its entries. Pass a cut id for a historical cut, or nothing
 *  for the active one. */
export function useCutData(cutId?: string): CutData {
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const found = cutId ? await getCut(cutId) : await getActiveCut()
      const cutEntries = found ? await getEntries(found.id) : []
      return { key: cutId, cut: found, entries: cutEntries }
    }

    load().then(
      (result) => {
        if (!cancelled) setLoaded(result)
      },
      (err: unknown) => {
        if (cancelled) return
        setError(errorMessage(err, 'Something went wrong loading your cut'))
      },
    )

    return () => {
      cancelled = true
    }
  }, [cutId])

  const setEntries = useCallback((update: (current: DailyEntry[]) => DailyEntry[]) => {
    setLoaded((current) =>
      current ? { ...current, entries: update(current.entries) } : current,
    )
  }, [])

  // Stale while a different cut is in flight, so a switch shows the skeleton
  // rather than the previous cut's data.
  const ready = loaded !== null && loaded.key === cutId

  return {
    cut: ready ? loaded.cut : null,
    entries: ready ? loaded.entries : [],
    setEntries,
    loading: !ready && error === null,
    error,
  }
}
