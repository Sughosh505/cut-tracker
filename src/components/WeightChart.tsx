import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatDayTitle } from '../lib/date'
import { kgToUnit } from '../lib/weight'
import type { WeightPoint } from '../services/cutService'
import type { WeightUnit } from '../types/database'

// The trend line is the read; raw weigh-ins are supporting detail, so they stay
// recessive gray. Green and red are reserved for adherence status.
const TREND_COLOR = '#2563eb'
const RAW_COLOR = '#6b7280'

function shortDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function WeightChart({ series, unit }: { series: WeightPoint[]; unit: WeightUnit }) {
  if (series.length < 2) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        Log weight on at least two days to see your trend.
      </p>
    )
  }

  const data = series.map((point) => ({
    date: point.date,
    weight: Number(kgToUnit(point.weight, unit).toFixed(1)),
    movingAverage: Number(kgToUnit(point.movingAverage, unit).toFixed(2)),
  }))

  const values = data.flatMap((point) => [point.weight, point.movingAverage])
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = Math.max((max - min) * 0.1, 0.3)

  return (
    <figure className="m-0">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={shortDate}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              minTickGap={24}
            />
            <YAxis
              domain={[min - pad, max + pad]}
              tickFormatter={(value: number) => value.toFixed(1)}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            <Tooltip
              content={(props) => (
                <WeightTooltip {...(props as unknown as TooltipProps)} unit={unit} />
              )}
              cursor={{ stroke: '#d1d5db' }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="none"
              dot={{ r: 3, fill: RAW_COLOR }}
              activeDot={{ r: 5, fill: RAW_COLOR }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="movingAverage"
              stroke={TREND_COLOR}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: TREND_COLOR }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <figcaption className="mt-3 flex justify-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: RAW_COLOR }} />
          Daily weigh-in
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded" style={{ background: TREND_COLOR }} />
          7-day average
        </span>
      </figcaption>
    </figure>
  )
}

/** Recharts types the tooltip payload loosely; this is the shape we actually
 *  render from. */
interface TooltipProps {
  active?: boolean
  label?: string | number
  payload?: ReadonlyArray<{ dataKey?: string | number; value?: number | string }>
}

function numeric(value: number | string | undefined): number | null {
  const parsed = Number(value)
  return value == null || Number.isNaN(parsed) ? null : parsed
}

function WeightTooltip({ active, payload, label, unit }: TooltipProps & { unit: WeightUnit }) {
  if (!active || !payload?.length) return null

  const weight = numeric(payload.find((item) => item.dataKey === 'weight')?.value)
  const trend = numeric(payload.find((item) => item.dataKey === 'movingAverage')?.value)

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 font-medium text-gray-900">{formatDayTitle(String(label))}</p>
      {weight != null && (
        <p className="text-gray-600">
          Weigh-in {weight.toFixed(1)} {unit}
        </p>
      )}
      {trend != null && (
        <p className="text-gray-600">
          7-day avg {trend.toFixed(1)} {unit}
        </p>
      )}
    </div>
  )
}
