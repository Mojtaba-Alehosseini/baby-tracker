import { AnimatePresence } from 'motion/react'
import { AppHeader } from '../components/AppHeader'
import { ActivityGrid } from '../components/ActivityGrid'
import { LiveTimerBanner } from '../components/LiveTimerBanner'
import { LogEntrySheet } from '../components/LogEntrySheet'
import { DayTimeline } from '../components/DayTimeline'
import { useActivityTypes } from '../hooks/useActivityTypes'
import { useActivityEntries } from '../hooks/useActivityEntries'
import { useTimerStore } from '../store/timerStore'
import { todayYYYYMMDD } from '../utils/formatters'

export function HomePage() {
  const { activityTypes } = useActivityTypes()
  const today = todayYYYYMMDD()
  const entries = useActivityEntries(today)
  const activeTimer = useTimerStore((s) => s.activeTimer)

  return (
    <div className="flex flex-col gap-5 pb-6">
      <AppHeader date={today} />

      {/* Live timer banner (conditionally shown) */}
      <AnimatePresence>
        {activeTimer && <LiveTimerBanner key="timer-banner" />}
      </AnimatePresence>

      {/* Activity quick-log grid */}
      <ActivityGrid activityTypes={activityTypes ?? []} />

      {/* Today's timeline */}
      <DayTimeline entries={entries ?? []} activityTypes={activityTypes ?? []} />

      {/* Sheet (log entry / stop timer / edit) */}
      <LogEntrySheet />
    </div>
  )
}
