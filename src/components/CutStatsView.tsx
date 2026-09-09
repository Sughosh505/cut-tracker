import { WeightChart } from './WeightChart'
import { computeStats, computeWeightStats, getCutDay } from '../services/cutService'
import { usePreferences } from '../contexts/PreferencesContext'
import { formatLongDate, todayISO } from '../lib/date'
import { formatRate, formatWeight, formatWeightDelta, kgToUnit } from '../lib/weight'
import type { Cut, DailyEntry } from '../types/database'

export function CutStatsView({ cut, entries }: { cut: Cut; entries: DailyEntry[] }) {
  const { weightUnit } = usePreferences()
  const today = todayISO()
  const lastDay = cut.end_date && cut.end_date < today ? cut.end_date : today

  const stats = computeStats(cut, entries, today)
  const weight = computeWeightStats(cut, entries)

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-sm font-medium tracking-wide text-gray-500">
          CUT DAY {getCutDay(cut, lastDay)}
        </h2>
        <dl className="mt-3 flex flex-col gap-2 text-sm">
          <Row label="Start" value={formatLongDate(cut.start_date)} />
          <Row
            label={cut.end_date ? 'Ended' : 'Today'}
            value={formatLongDate(cut.end_date ?? today)}
          />
        </dl>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium tracking-wide text-gray-500">ADHERENCE</h2>
        {stats.trackedDays === 0 ? (
          <Empty>Log a day to start tracking adherence.</Empty>
        ) : (
          <dl className="flex flex-col gap-2 text-sm">
            <Row label="Green days" value={String(stats.greenDays)} />
            <Row label="Red days" value={String(stats.redDays)} />
            <Row
              label="Adherence"
              value={stats.adherence === null ? '—' : `${stats.adherence.toFixed(1)}%`}
              emphasis
            />
          </dl>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium tracking-wide text-gray-500">STREAKS</h2>
        <div className="flex gap-8">
          <Stat
            label="Current"
            value={`${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'}`}
          />
          <Stat
            label="Best"
            value={`${stats.bestStreak} ${stats.bestStreak === 1 ? 'day' : 'days'}`}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium tracking-wide text-gray-500">WEIGHT</h2>
        {weight.startingWeight === null && weight.currentWeight === null ? (
          <Empty>Log a weight on any day to see your trend.</Empty>
        ) : (
          <>
            <dl className="flex flex-col gap-2 text-sm">
              <Row
                label="Starting weight"
                value={
                  weight.startingWeight == null
                    ? '—'
                    : formatWeight(weight.startingWeight, weightUnit)
                }
              />
              <Row
                label="Current weight"
                value={
                  weight.currentWeight == null
                    ? '—'
                    : formatWeight(weight.currentWeight, weightUnit)
                }
              />
              <Row
                label="Change"
                value={weight.change == null ? '—' : formatWeightDelta(weight.change, weightUnit)}
                emphasis
              />
              <Row
                label="Avg weekly change"
                value={
                  weight.avgWeeklyChange == null
                    ? '—'
                    : formatRate(weight.avgWeeklyChange, weightUnit)
                }
              />
            </dl>

            {cut.target_weight != null &&
              weight.startingWeight != null &&
              weight.currentWeight != null && (
                <ProgressBar
                  start={weight.startingWeight}
                  current={weight.currentWeight}
                  target={cut.target_weight}
                />
              )}
          </>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium tracking-wide text-gray-500">TREND</h2>
        <WeightChart series={weight.series} unit={weightUnit} />
      </section>
    </div>
  )
}

function ProgressBar({
  start,
  current,
  target,
}: {
  start: number
  current: number
  target: number
}) {
  const { weightUnit } = usePreferences()
  const span = start - target
  const done = span === 0 ? 1 : (start - current) / span
  const percent = Math.min(Math.max(done, 0), 1) * 100

  return (
    <div className="mt-6">
      <div className="relative h-2 rounded-full bg-gray-200">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gray-900"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <Marker label="Starting" value={formatWeight(start, weightUnit)} align="text-left" />
        <Marker
          label={`${Math.round(percent)}% there`}
          value={formatWeight(current, weightUnit)}
          align="text-center"
        />
        <Marker label="Target" value={formatWeight(target, weightUnit)} align="text-right" />
      </div>
      <span className="sr-only">
        {kgToUnit(Math.max(current - target, 0), weightUnit).toFixed(1)} {weightUnit} to target
      </span>
    </div>
  )
}

function Marker({ label, value, align }: { label: string; value: string; align: string }) {
  return (
    <span className={`flex flex-col ${align}`}>
      <span>{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </span>
  )
}

function Row({
  label,
  value,
  emphasis = false,
}: {
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd className={emphasis ? 'font-semibold text-gray-900' : 'font-medium text-gray-900'}>
        {value}
      </dd>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-2xl font-semibold text-gray-900">{value}</span>
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-400">{children}</p>
}
