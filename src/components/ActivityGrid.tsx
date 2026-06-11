import { motion } from 'motion/react'
import type { ActivityType } from '../db/types'
import { useTimerStore } from '../store/timerStore'
import { useUIStore } from '../store/uiStore'

interface ActivityGridProps {
  activityTypes: ActivityType[]
}

export function ActivityGrid({ activityTypes }: ActivityGridProps) {
  const activeTimer = useTimerStore((s) => s.activeTimer)
  const { openLogEntry, openStopTimer } = useUIStore()

  function handleTap(activity: ActivityType) {
    if (activeTimer) {
      if (activeTimer.activityTypeId === activity.id) {
        openStopTimer()
      } else {
        openStopTimer() // prompt to stop the current timer first
      }
      return
    }
    openLogEntry(activity.id)
  }

  return (
    <section aria-label="Activity categories">
      <div className="grid grid-cols-2 gap-3 px-5">
        {activityTypes.map((activity, i) => {
          const isRunning = activeTimer?.activityTypeId === activity.id
          return (
            <motion.button
              key={activity.id}
              type="button"
              onClick={() => handleTap(activity)}
              className="pressable glass rounded-3xl p-4 flex flex-col items-start gap-2 text-left"
              style={{ '--glow-color': activity.color } as React.CSSProperties}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: 'spring',
                duration: 0.4,
                bounce: 0.15,
                delay: i * 0.04,
              }}
              whileTap={{ scale: 0.96 }}
              aria-label={`Log ${activity.name}`}
            >
              {/* Emoji */}
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: activity.colorLight }}
              >
                {activity.emoji}
              </div>

              {/* Name + running indicator */}
              <div className="w-full">
                <p className="text-sm font-semibold text-slate-800 leading-tight">
                  {activity.name}
                </p>
                {isRunning && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: activity.color }}
                    />
                    <span className="text-xs font-medium" style={{ color: activity.color }}>
                      Running
                    </span>
                  </div>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}
