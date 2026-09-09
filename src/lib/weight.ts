import type { WeightUnit } from '../types/database'

/** Weight is always stored in kg. The unit preference is a display concern —
 *  convert at the edges (render and form input), never in the database. */
const KG_PER_LB = 0.45359237

export function kgToUnit(kg: number, unit: WeightUnit): number {
  return unit === 'lbs' ? kg / KG_PER_LB : kg
}

export function unitToKg(value: number, unit: WeightUnit): number {
  return unit === 'lbs' ? value * KG_PER_LB : value
}

export function formatWeight(kg: number, unit: WeightUnit, digits = 1): string {
  return `${kgToUnit(kg, unit).toFixed(digits)} ${unit}`
}

/** Signed, for weight change: "-2.6 kg", "+0.4 kg". */
export function formatWeightDelta(kgDelta: number, unit: WeightUnit, digits = 1): string {
  const value = kgToUnit(kgDelta, unit)
  const rounded = Number(value.toFixed(digits))
  const sign = rounded > 0 ? '+' : rounded < 0 ? '-' : ''
  return `${sign}${Math.abs(rounded).toFixed(digits)} ${unit}`
}

export function formatRate(kgPerWeek: number, unit: WeightUnit, digits = 2): string {
  const value = kgToUnit(kgPerWeek, unit)
  const rounded = Number(value.toFixed(digits))
  const sign = rounded > 0 ? '+' : rounded < 0 ? '-' : ''
  return `${sign}${Math.abs(rounded).toFixed(digits)} ${unit}/week`
}

/** Round-trips a stored kg value into a form field in the display unit. */
export function weightToInput(kg: number | null, unit: WeightUnit): string {
  return kg == null ? '' : String(Number(kgToUnit(kg, unit).toFixed(1)))
}
