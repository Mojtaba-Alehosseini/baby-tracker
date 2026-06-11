import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Square } from 'lucide-react'
import { useTimerStore } from '../store/timerStore'
import { useUIStore } from '../store/uiStore'
import { formatElapsed } from '../utils/formatters'

export function LiveTimerBanner() {
  const activeTimer = useTimerStore((s) => s.activeTimer)
  const openStopTimer = useUIStore((s) => s.openStopTimer)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!activeTimer) {
      setElapsed(0)
      return
    }
    const startMs = new Date(activeTimer.startedAt).getTime()
    const tick = () => setElapsed(Math.floor((Date.now() - startMs) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [activeTimer])

  if (!activeTimer) return null

  return (
    <motion.button
      type="button"
      onClick={openStopTimer}
      className="mx-5 pressable glass-strong rounded-2xl px-4 py-3 flex items-center gap-3 w-full text-left"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
      aria-label={`${activeTimer.activityTypeName} timer running — tap to stop`}
    >
      {/* Color dot pulse */}
      <div
        className="w-3 h-3 rounded-full animate-pulse shrink-0"
        style={{ backgroundColor: activeTimer.activityTypeColor }}
      />

      {/* Activity info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 leading-none mb-0.5">Now tracking</p>
        <p className="text-sm font-semibold text-slate-800 truncate">
          {activeTimer.activityTypeEmoji} {activeTimer.activityTypeName}
        </p>
      </div>

      {/* Elapsed time */}
      <span
        className="text-base font-bold tabular-nums"
        style={{ color: activeTimer.activityTypeColor }}
      >
        {formatElapsed(elapsed)}
      </span>

      {/* Stop button */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: activeTimer.activityTypeColor + '20' }}
      >
        <Square
          size={14}
          fill={activeTimer.activityTypeColor}
          strokeWidth={0}
          style={{ color: activeTimer.activityTypeColor }}
        />
      </div>
    </motion.button>
  )
}
