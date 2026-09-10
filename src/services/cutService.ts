import { supabase } from '../lib/supabase'
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

export async function startCut(params: StartCutParams): Promise<Cut> {
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
