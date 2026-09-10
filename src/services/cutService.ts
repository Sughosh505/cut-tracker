import { supabase } from '../lib/supabase'
import { isDevMode } from '../lib/devMode'
import { toLocalDateISO } from '../lib/date'
import type { Cut } from '../types/database'

export interface StartCutParams {
  startDate: string
  startingWeight?: number
  targetWeight?: number
  calorieTarget?: number
  proteinTarget?: number
  rules?: string
  plannedEndDate?: string
}

// TEMPORARY: fake persistence for dev-mode testing without a Supabase project.
// Remove alongside devMode.ts.
const DEV_STORAGE_KEY = 'cut-tracker-dev-active-cut'

function devGetActiveCut(): Cut | null {
  const raw = localStorage.getItem(DEV_STORAGE_KEY)
  return raw ? (JSON.parse(raw) as Cut) : null
}

function devStartCut(params: StartCutParams): Cut {
  const now = new Date().toISOString()
  const cut: Cut = {
    id: 'dev-cut',
    user_id: 'dev-user',
    start_date: params.startDate,
    end_date: null,
    starting_weight: params.startingWeight ?? null,
    target_weight: params.targetWeight ?? null,
    calorie_target: params.calorieTarget ?? null,
    protein_target: params.proteinTarget ?? null,
    rules: params.rules ?? null,
    planned_end_date: params.plannedEndDate ?? null,
    status: 'ACTIVE',
    created_at: now,
    updated_at: now,
  }
  localStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(cut))
  return cut
}

export async function startCut(params: StartCutParams): Promise<Cut> {
  if (isDevMode) return devStartCut(params)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  const { data, error } = await supabase
    .from('cuts')
    .insert({
      user_id: user.id,
      start_date: params.startDate,
      starting_weight: params.startingWeight ?? null,
      target_weight: params.targetWeight ?? null,
      calorie_target: params.calorieTarget ?? null,
      protein_target: params.proteinTarget ?? null,
      rules: params.rules ?? null,
      planned_end_date: params.plannedEndDate ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getActiveCut(): Promise<Cut | null> {
  if (isDevMode) return devGetActiveCut()

  const { data, error } = await supabase
    .from('cuts')
    .select()
    .eq('status', 'ACTIVE')
    .maybeSingle()

  if (error) throw error
  return data
}

export function getCutDay(cut: Cut, today: Date = new Date()): number {
  const start = new Date(cut.start_date + 'T00:00:00')
  const current = new Date(toLocalDateISO(today) + 'T00:00:00')
  const diffMs = current.getTime() - start.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return diffDays + 1
}
