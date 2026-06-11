import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ActiveTimer {
  activityTypeId: string
  activityTypeName: string
  activityTypeEmoji: string
  activityTypeColor: string
  startedAt: string // ISO string
}

interface TimerStore {
  activeTimer: ActiveTimer | null
  startTimer: (timer: ActiveTimer) => void
  stopTimer: () => ActiveTimer | null
  clearTimer: () => void
}

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      activeTimer: null,

      startTimer: (timer) => set({ activeTimer: timer }),

      stopTimer: () => {
        const timer = get().activeTimer
        set({ activeTimer: null })
        return timer
      },

      clearTimer: () => set({ activeTimer: null }),
    }),
    {
      name: 'armin-active-timer',
    }
  )
)
