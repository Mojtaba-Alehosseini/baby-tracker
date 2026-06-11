import { motion } from 'motion/react'
import type { ActivityEntry, ActivityType } from '../db/types'
import { formatTime, formatDuration } from '../utils/formatters'

interface DayTimelineProps {
  entries: ActivityEntry[]
  activityTypes: ActivityType[]
}

const DAY_START_HOUR = 6
const DAY_END_HOUR = 22
const TOTAL_MINUTES = (DAY_END_HOUR - DAY_START_HOUR) * 60

function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function toPercent(minutes: number): number {
  const clamped = Math.max(
    DAY_START_HOUR * 60,
    Math.min(DAY_END_HOUR * 60, minutes)
  )
  return ((clamped - DAY_START_HOUR * 60) / TOTAL_MINUTES) * 100
}

export function DayTimeline({ entries, activityTypes }: DayTimelineProps) {
  const typeMap = new Map(activityTypes.map((a) => [a.id, a]))
  const sorted = [...entries].sort((a, b) => a.startTime.localeCompare(b.startTime))

  const hourTicks = Array.from(
    { length: DAY_END_HOUR - DAY_START_HOUR + 1 },
    (_, i) => DAY_START_HOUR + i
  )

  return (
    <section className="px-5" aria-label="Day timeline">
      <h2 className="text-base font-semibold text-slate-700 mb-3">Today&apos;s Timeline</h2>
      <div className="glass rounded-3xl px-4 py-4 overflow-hidden">
        {/* Hour ticks */}
        <div className="relative h-4 mb-2">
          {hourTicks.filter((h) => h % 3 === 0).map((h) => {
            const pct = ((h - DAY_START_HOUR) / (DAY_END_HOUR - DAY_START_HOUR)) * 100
            return (
              <span
                key={h}
                className="absolute text-[10px] text-slate-300 -translate-x-1/2"
                style={{ left: `${pct}%` }}
              >
                {h === 12 ? '12pm' : h > 12 ? `${h - 12}pm` : `${h}am`}
              </span>
            )
          })}
        </div>

        {/* Timeline track */}
        <div className="relative h-10 bg-slate-100/60 rounded-full overflow-hidden">
          {sorted.map((entry, i) => {
            const type = typeMap.get(entry.activityTypeId)
            if (!type) return null
            const startPct = toPercent(timeToMinutes(entry.startTime))
            const endPct = toPercent(timeToMinutes(entry.endTime))
            const widthPct = Math.max(endPct - startPct, 1.5)
            return (
              <motion.div
                key={entry.id}
                className="absolute top-1 bottom-1 rounded-full flex items-center overflow-hidden cursor-default"
                style={{
                  left: `${startPct}%`,
                  width: `${widthPct}%`,
                  backgroundColor: type.color,
                  minWidth: 28,
                  transformOrigin: 'left center',
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{
                  type: 'spring',
                  duration: 0.5,
                  bounce: 0.1,
                  delay: i * 0.05,
                }}
                title={`${type.name}: ${formatTime(entry.startTime)}-${formatTime(entry.endTime)}`}
                aria-label={`${type.name} from ${formatTime(entry.startTime)} to ${formatTime(entry.endTime)}`}
              >
                <span className="px-1.5 text-xs">
                  {widthPct > 5 ? type.emoji : ''}
                </span>
              </motion.div>
            )
          })}
        </div>

        {/* Entry list below track */}
        {sorted.length === 0 ? (
          <p className="text-sm text-slate-400 text-center mt-4 mb-2">
            No activities yet today
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {sorted.map((entry) => {
              const type = typeMap.get(entry.activityTypeId)
              if (!type) return null
              return (
                <div key={entry.id} className="flex items-center gap-2.5 text-sm">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: type.color }}
                    aria-hidden="true"
                  />
                  <span className="text-slate-500 tabular-nums text-xs w-28 shrink-0">
                    {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                  </span>
                  <span className="text-slate-700 font-medium truncate">
                    {type.emoji} {type.name}
                  </span>
                  <span
                    className="text-xs font-medium ml-auto shrink-0 px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: type.color + '20', color: type.color }}
                  >
                    {formatDuration(entry.durationMinutes)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
