import { useState } from 'react'
import { CalendarGrid } from '../components/CalendarGrid'
import { DayDetailSheet } from '../components/DayDetailSheet'
import { NoActiveCut } from '../components/NoActiveCut'
import { ScreenSkeleton } from '../components/Skeleton'
import { useCutData } from '../hooks/useCutData'
import { useToast } from '../contexts/ToastContext'
import { getCutDay, saveEntry, type EntryValues } from '../services/cutService'

export function Calendar() {
  const { cut, entries, setEntries, loading, error } = useCutData()
  const { showToast } = useToast()
  const [selected, setSelected] = useState<string | null>(null)

  if (loading) return <ScreenSkeleton />
  if (error) return <NoActiveCut message={error} />
  if (!cut) return <NoActiveCut message="No active cut to show." />

  const entry = entries.find((item) => item.date === selected) ?? null

  async function handleSave(date: string, values: EntryValues) {
    if (!cut) return
    const saved = await saveEntry(cut.id, date, values)
    setEntries((current) => [...current.filter((item) => item.date !== date), saved])
    setSelected(null)
    showToast('Day saved.', 'success')
  }

  return (
    <div className="px-4 py-8">
      <CalendarGrid cut={cut} entries={entries} onSelectDay={setSelected} />

      {selected && (
        <DayDetailSheet
          date={selected}
          cutDay={getCutDay(cut, selected)}
          entry={entry}
          onSave={(values) => handleSave(selected, values)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
