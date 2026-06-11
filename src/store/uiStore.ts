import { create } from 'zustand'
import { nanoid } from 'nanoid'

export type SheetType = 'log-entry' | 'stop-timer' | 'edit-entry' | null

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface UIStore {
  activeSheet: SheetType
  sheetActivityId: string | null // for 'log-entry': which activity type
  editEntryId: string | null      // for 'edit-entry': which entry to edit
  toasts: Toast[]

  openLogEntry: (activityTypeId: string) => void
  openStopTimer: () => void
  openEditEntry: (entryId: string) => void
  closeSheet: () => void

  addToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void
}

export const useUIStore = create<UIStore>()((set, get) => ({
  activeSheet: null,
  sheetActivityId: null,
  editEntryId: null,
  toasts: [],

  openLogEntry: (activityTypeId) =>
    set({ activeSheet: 'log-entry', sheetActivityId: activityTypeId, editEntryId: null }),

  openStopTimer: () =>
    set({ activeSheet: 'stop-timer', sheetActivityId: null, editEntryId: null }),

  openEditEntry: (entryId) =>
    set({ activeSheet: 'edit-entry', sheetActivityId: null, editEntryId: entryId }),

  closeSheet: () =>
    set({ activeSheet: null, sheetActivityId: null, editEntryId: null }),

  addToast: (message, type = 'success') => {
    const id = nanoid(6)
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
    setTimeout(() => get().removeToast(id), 3500)
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
