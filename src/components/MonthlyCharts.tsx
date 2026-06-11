import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts'
import { format, parseISO, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns'
import type { ActivityEntry, ActivityType } from '../db/types'
import { formatDuration } from '../utils/formatters'

interface MonthlyChartsProps {
  entries: ActivityEntry[]
  activityTypes: ActivityType[]
  month: string // 'YYYY-MM'
}

const CHART_HEIGHT = 160

export function MonthlyCharts({ entries, activityTypes, month }: MonthlyChartsProps) {
  const typeMap = useMemo(
    () => new Map(activityTypes.map((a) => [a.id, a])),
    [activityTypes]
  )

  // ── Daily total minutes ───────────────────────────────────────────────────
  const dailyData = useMemo(() => {
    const [y, m] = month.split('-').map(Number)
    const start = startOfMonth(new Date(y, m - 1))
    const end = endOfMonth(start)
    const days = eachDayOfInterval({ start, end })
    return days.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const dayEntries = entries.filter((e) => e.date === dateStr)
      return {
        day: format(day, 'd'),
        minutes: dayEntries.reduce((s, e) => s + e.durationMinutes, 0),
      }
    })
  }, [entries, month])

  // ── Time per activity (pie-ish bar) ───────────────────────────────────────
  const activityData = useMemo(() => {
    const totals = new Map<string, number>()
    for (const e of entries) {
      totals.set(e.activityTypeId, (totals.get(e.activityTypeId) ?? 0) + e.durationMinutes)
    }
    return [...totals.entries()]
      .map(([id, mins]) => ({
        name: typeMap.get(id)?.name ?? 'Unknown',
        emoji: typeMap.get(id)?.emoji ?? '📝',
        color: typeMap.get(id)?.color ?? '#94a3b8',
        minutes: mins,
      }))
      .sort((a, b) => b.minutes - a.minutes)
  }, [entries, typeMap])

  // ── Mood trend ────────────────────────────────────────────────────────────
  const moodData = useMemo(() => {
    const [y, m] = month.split('-').map(Number)
    const start = startOfMonth(new Date(y, m - 1))
    const end = endOfMonth(start)
    const days = eachDayOfInterval({ start, end })
    return days
      .map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd')
        const rated = entries.filter((e) => e.date === dateStr && e.rating)
        const avg = rated.length
          ? rated.reduce((s, e) => s + (e.rating ?? 0), 0) / rated.length
          : null
        return { day: format(day, 'd'), rating: avg }
      })
      .filter((d) => d.rating !== null)
  }, [entries, month])

  if (entries.length === 0) {
    return (
      <section className="px-5" aria-label="Monthly charts">
        <h2 className="text-base font-semibold text-slate-700 mb-3">Monthly View</h2>
        <div className="glass rounded-3xl px-4 py-6 text-center">
          <p className="text-sm text-slate-400">No data for this month yet</p>
        </div>
      </section>
    )
  }

  return (
    <section className="px-5 flex flex-col gap-5" aria-label="Monthly charts">
      <h2 className="text-base font-semibold text-slate-700">Monthly View</h2>

      {/* Daily activity bar chart */}
      <div className="glass rounded-3xl px-4 pt-4 pb-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Daily Activity (minutes)
        </p>
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart data={dailyData} barCategoryGap="30%">
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              formatter={(v: number) => [formatDuration(v), 'Total']}
              contentStyle={{
                background: 'rgba(255,255,255,0.95)',
                border: 'none',
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
              {dailyData.map((_, i) => (
                <Cell key={i} fill="#FF6B6B" fillOpacity={0.7} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Activity breakdown */}
      {activityData.length > 0 && (
        <div className="glass rounded-3xl px-4 pt-4 pb-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Time by Activity
          </p>
          <div className="flex flex-col gap-2.5">
            {activityData.map((a) => {
              const total = activityData.reduce((s, x) => s + x.minutes, 0)
              const pct = total > 0 ? (a.minutes / total) * 100 : 0
              return (
                <div key={a.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium">
                      {a.emoji} {a.name}
                    </span>
                    <span className="text-slate-400 tabular-nums">
                      {formatDuration(a.minutes)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: a.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Mood trend */}
      {moodData.length > 1 && (
        <div className="glass rounded-3xl px-4 pt-4 pb-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Mood Trend
          </p>
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <LineChart data={moodData}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis domain={[1, 5]} hide />
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <Tooltip
                formatter={(v: number) => [v.toFixed(1), 'Mood']}
                contentStyle={{
                  background: 'rgba(255,255,255,0.95)',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="#FFB347"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#FFB347' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
