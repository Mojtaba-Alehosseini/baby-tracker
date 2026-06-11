import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { WeekInsightCards } from '../components/WeekInsightCards'
import { MonthlyCharts } from '../components/MonthlyCharts'
import { useActivityTypes } from '../hooks/useActivityTypes'
import { useEntriesForDateRange } from '../hooks/useActivityEntries'
import { formatMonth } from '../utils/formatters'

type ViewMode = 'week' | 'month'

function getCurrentWeekBounds(offset: number): { start: string; end: string; label: string } {
  const base = subDays(new Date(), offset * 7)
  const s = startOfWeek(base, { weekStartsOn: 1 })
  const e = endOfWeek(base, { weekStartsOn: 1 })
  const sStr = format(s, 'yyyy-MM-dd')
  const eStr = format(e, 'yyyy-MM-dd')
  const label =
    offset === 0
      ? 'This Week'
      : offset === 1
      ? 'Last Week'
      : `${format(s, 'MMM d')} – ${format(e, 'MMM d')}`
  return { start: sStr, end: eStr, label }
}

function getCurrentMonthBounds(offset: number): { start: string; end: string; month: string; label: string } {
  const base = new Date()
  base.setMonth(base.getMonth() - offset)
  base.setDate(1)
  const s = startOfMonth(base)
  const e = endOfMonth(base)
  const sStr = format(s, 'yyyy-MM-dd')
  const eStr = format(e, 'yyyy-MM-dd')
  const monthStr = format(s, 'yyyy-MM')
  const label = offset === 0 ? 'This Month' : format(s, 'MMMM yyyy')
  return { start: sStr, end: eStr, month: monthStr, label }
}

export function StoryPage() {
  const [mode, setMode] = useState<ViewMode>('week')
  const [offset, setOffset] = useState(0)

  const { activityTypes } = useActivityTypes()

  const { start, end, label, ...rest } = useMemo(
    () =>
      mode === 'week'
        ? getCurrentWeekBounds(offset)
        : getCurrentMonthBounds(offset),
    [mode, offset]
  )
  const month = (rest as { month?: string }).month ?? format(new Date(), 'yyyy-MM')

  const entries = useEntriesForDateRange(start, end) ?? []

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Header */}
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-bold text-slate-800">Insights</h1>
      </div>

      {/* View mode toggle */}
      <div className="px-5">
        <div className="glass rounded-2xl p-1 flex gap-1" role="group" aria-label="View mode">
          {(['week', 'month'] as ViewMode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setOffset(0) }}
              className={`pressable flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                mode === m
                  ? 'bg-white shadow-soft text-slate-800'
                  : 'text-slate-400'
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Period navigation */}
      <div className="px-5 flex items-center justify-between">
        <button
          onClick={() => setOffset((o) => o + 1)}
          className="pressable w-9 h-9 glass rounded-xl flex items-center justify-center text-slate-500"
          aria-label="Previous period"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <button
          onClick={() => setOffset((o) => Math.max(0, o - 1))}
          disabled={offset === 0}
          className="pressable w-9 h-9 glass rounded-xl flex items-center justify-center text-slate-500 disabled:opacity-30"
          aria-label="Next period"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Content */}
      {mode === 'week' ? (
        <WeekInsightCards entries={entries} activityTypes={activityTypes ?? []} />
      ) : (
        <MonthlyCharts entries={entries} activityTypes={activityTypes ?? []} month={month} />
      )}
    </div>
  )
}
