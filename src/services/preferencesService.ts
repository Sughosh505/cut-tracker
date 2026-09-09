import { supabase } from '../lib/supabase'
import type { Preferences, WeightUnit } from '../types/database'

/** A user has no preferences row until they change something, so a missing
 *  row is normal — fall back to the column default rather than erroring. */
export async function getWeightUnit(): Promise<WeightUnit> {
  const { data, error } = await supabase.from('preferences').select().maybeSingle()
  if (error) throw error
  return data?.weight_unit ?? 'kg'
}

export async function setWeightUnit(unit: WeightUnit): Promise<Preferences> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  const { data, error } = await supabase
    .from('preferences')
    .upsert({ user_id: user.id, weight_unit: unit }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) throw error
  return data
}
