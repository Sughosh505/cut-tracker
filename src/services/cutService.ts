import { supabase } from '../lib/supabase'
import { addDays, daysBetween, todayISO } from '../lib/date'
import type { Cut, DailyEntry, DayStatus } from '../types/database'

export interface StartCutParams {
  startDate: string
  startingWeight?: number
  targetWeight?: number
  calorieTarget?: number
  proteinTarget?: number
  rules?: string
  plannedEndDate?: string
}

async function requireUserId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')
  return user.id
}

export async function startCut(params: StartCutParams): Promise<Cut> {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('cuts')
    .insert({
      user_id: userId,
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

export function getCutDay(cut: Cut, today: string = todayISO()): number {
  return daysBetween(cut.start_date, today) + 1
}

export async function getEntries(cutId: string): Promise<DailyEntry[]> {
  const { data, error } = await supabase
    .from('daily_entries')
    .select()
    .eq('cut_id', cutId)
    .order('date', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getEntryForDate(cutId: string, date: string): Promise<DailyEntry | null> {
  const { data, error } = await supabase
    .from('daily_entries')
    .select()
    .eq('cut_id', cutId)
    .eq('date', date)
    .maybeSingle()

  if (error) throw error
  return data
}

export function getToday(cutId: string): Promise<DailyEntry | null> {
  return getEntryForDate(cutId, todayISO())
}

/** Creates today's entry or swaps the status of an existing one. Optional
 *  fields on an existing entry (weight, notes, ...) are left untouched. */
export async function logDay(
  cutId: string,
  date: string,
  status: DayStatus,
): Promise<DailyEntry> {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('daily_entries')
    .upsert(
      { user_id: userId, cut_id: cutId, date, status },
      { onConflict: 'user_id,cut_id,date' },
    )
    .select()
    .single()

  if (error) throw error
  return data
}

export interface EntryValues {
  status: DayStatus
  weight?: number | null
  calories?: number | null
  protein?: number | null
  training?: boolean | null
  notes?: string | null
}

/** Full save from the day detail sheet — creates the entry for a previously
 *  unlogged day, or overwrites every field of an existing one. */
export async function saveEntry(
  cutId: string,
  date: string,
  values: EntryValues,
): Promise<DailyEntry> {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('daily_entries')
    .upsert(
      {
        user_id: userId,
        cut_id: cutId,
        date,
        status: values.status,
        weight: values.weight ?? null,
        calories: values.calories ?? null,
        protein: values.protein ?? null,
        training: values.training ?? null,
        notes: values.notes ?? null,
      },
      { onConflict: 'user_id,cut_id,date' },
    )
    .select()
    .single()

  if (error) throw error
  return data
}

/** Weight-only edit from the home screen, so logging a weigh-in can't clobber
 *  notes or macros already on the day. */
export async function updateEntryWeight(
  cutId: string,
  date: string,
  weight: number | null,
): Promise<DailyEntry> {
  const { data, error } = await supabase
    .from('daily_entries')
    .update({ weight })
    .eq('cut_id', cutId)
    .eq('date', date)
    .select()
    .single()

  if (error) throw error
  return data
}

export interface WeightPoint {
  date: string
  weight: number
  /** 7-point rolling mean, per spec section 6: this day plus the previous six
   *  days that have weight data. Days without weight are skipped, never
   *  interpolated, so a gap shifts the window rather than flattening it. */
  movingAverage: number
}

export function buildWeightSeries(entries: DailyEntry[]): WeightPoint[] {
  const weighed = entries
    .filter((entry): entry is DailyEntry & { weight: number } => entry.weight != null)
    .sort((a, b) => a.date.localeCompare(b.date))

  return weighed.map((entry, i) => {
    const window = weighed.slice(Math.max(0, i - 6), i + 1)
    const sum = window.reduce((total, point) => total + point.weight, 0)
    return {
      date: entry.date,
      weight: entry.weight,
      movingAverage: sum / window.length,
    }
  })
}

export interface WeightStats {
  /** kg throughout — callers convert for display. */
  startingWeight: number | null
  currentWeight: number | null
  change: number | null
  avgWeeklyChange: number | null
  series: WeightPoint[]
}

export function computeWeightStats(cut: Cut, entries: DailyEntry[]): WeightStats {
  const series = buildWeightSeries(entries)
  const first = series[0] ?? null
  const latest = series[series.length - 1] ?? null

  // The cut's declared starting weight is the baseline when it exists; without
  // one, the first logged weigh-in stands in.
  const startingWeight = cut.starting_weight ?? first?.weight ?? null
  const baselineDate = cut.starting_weight != null ? cut.start_date : first?.date

  const currentWeight = latest?.weight ?? null
  const change =
    startingWeight != null && currentWeight != null ? currentWeight - startingWeight : null

  let avgWeeklyChange: number | null = null
  if (change != null && baselineDate && latest) {
    const daysElapsed = daysBetween(baselineDate, latest.date)
    if (daysElapsed > 0) avgWeeklyChange = (change / daysElapsed) * 7
  }

  return { startingWeight, currentWeight, change, avgWeeklyChange, series }
}

export interface CutStats {
  greenDays: number
  redDays: number
  trackedDays: number
  /** null until at least one day is logged — 0% would read as failure. */
  adherence: number | null
  currentStreak: number
  bestStreak: number
  unloggedDays: number
}

/** Grey (unlogged) days are excluded from adherence entirely; they break streaks. */
export function computeStats(
  cut: Cut,
  entries: DailyEntry[],
  today: string = todayISO(),
): CutStats {
  const byDate = new Map(entries.map((entry) => [entry.date, entry.status]))

  let greenDays = 0
  let redDays = 0
  let bestStreak = 0
  let runningStreak = 0
  let unloggedDays = 0

  const lastDay = cut.end_date && cut.end_date < today ? cut.end_date : today

  for (let date = cut.start_date; date <= lastDay; date = addDays(date, 1)) {
    const status = byDate.get(date)
    if (status === 'GREEN') {
      greenDays++
      runningStreak++
      bestStreak = Math.max(bestStreak, runningStreak)
    } else {
      if (status === 'RED') redDays++
      else if (date < today) unloggedDays++ // today isn't "missed" until it's over
      runningStreak = 0
    }
  }

  // Current streak counts back from the most recent logged day, so a not-yet-
  // logged today does not zero out a live streak.
  let currentStreak = 0
  const loggedDates = entries.map((entry) => entry.date).sort()
  const mostRecent = loggedDates[loggedDates.length - 1]
  if (mostRecent) {
    for (let date = mostRecent; date >= cut.start_date; date = addDays(date, -1)) {
      if (byDate.get(date) !== 'GREEN') break
      currentStreak++
    }
  }

  const trackedDays = greenDays + redDays

  return {
    greenDays,
    redDays,
    trackedDays,
    adherence: trackedDays > 0 ? (greenDays / trackedDays) * 100 : null,
    currentStreak,
    bestStreak,
    unloggedDays,
  }
}
