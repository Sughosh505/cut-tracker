import { kgToUnit } from './weight'
import type { Cut, DailyEntry, WeightUnit } from '../types/database'

const COLUMNS = ['date', 'cut_day', 'status', 'weight', 'calories', 'protein', 'training', 'notes']

function escape(value: string | number | null): string {
  if (value == null) return ''
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function entriesToCsv(cut: Cut, entries: DailyEntry[], unit: WeightUnit): string {
  const header = COLUMNS.map((column) => (column === 'weight' ? `weight_${unit}` : column))

  const rows = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((entry) => {
      const cutDay =
        Math.round(
          (new Date(entry.date + 'T00:00:00').getTime() -
            new Date(cut.start_date + 'T00:00:00').getTime()) /
            86_400_000,
        ) + 1

      return [
        entry.date,
        cutDay,
        entry.status,
        entry.weight == null ? null : Number(kgToUnit(entry.weight, unit).toFixed(2)),
        entry.calories,
        entry.protein,
        entry.training == null ? null : entry.training ? 'yes' : 'no',
        entry.notes,
      ].map(escape)
    })

  return [header.join(','), ...rows.map((row) => row.join(','))].join('\n')
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
