import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getWeightUnit, setWeightUnit as persistWeightUnit } from '../services/preferencesService'
import { useAuth } from './AuthContext'
import type { WeightUnit } from '../types/database'

interface PreferencesContextValue {
  weightUnit: WeightUnit
  setWeightUnit: (unit: WeightUnit) => Promise<void>
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [weightUnit, setUnit] = useState<WeightUnit>('kg')

  useEffect(() => {
    let cancelled = false

    // Signed out, fall back to the column default rather than leaking the
    // previous user's unit into the next session.
    const load = session ? getWeightUnit() : Promise.resolve<WeightUnit>('kg')

    load.then(
      (unit) => {
        if (!cancelled) setUnit(unit)
      },
      // A failed preference read shouldn't take a screen down.
      () => {},
    )

    return () => {
      cancelled = true
    }
  }, [session])

  async function setWeightUnit(unit: WeightUnit) {
    const previous = weightUnit
    setUnit(unit)
    try {
      await persistWeightUnit(unit)
    } catch (err) {
      setUnit(previous)
      throw err
    }
  }

  return (
    <PreferencesContext.Provider value={{ weightUnit, setWeightUnit }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) throw new Error('usePreferences must be used within a PreferencesProvider')
  return context
}
