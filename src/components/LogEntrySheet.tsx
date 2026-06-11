import { useState, useEffect } from 'react'
import { Play, Square, Check } from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { EmojiRating } from './EmojiRating'
import { useUIStore } from '../store/uiStore'
import { useTimerStore } from '../store/timerStore'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { ActivityType, Companion } from '../db/types'
import { saveEntry, updateEntry } from '../hooks/useActivityEntries'
import { nowHHMM, todayYYYYMMDD, formatElapsed } from '../utils/formatters'

// ─── Shared form state type ────────────────────────────────────────────────────

interface FormState {
  date: string
  startTime: string
  endTime: string
  rating: 1 | 2 | 3 | 4 | 5 | null
  notes: string
  companionIds: string[]
}

function initForm(): FormState {
  const now = nowHHMM()
  return {
    date: todayYYYYMMDD(),
    startTime: now,
    endTime: now,
    rating: null,
    notes: '',
    companionIds: [],
  }
}

// ─── LogEntrySheet ─────────────────────────────────────────────────────────────

export function LogEntrySheet() {
  const { activeSheet, sheetActivityId, editEntryId, closeSheet, addToast } = useUIStore()
  const { activeTimer, startTimer, stopTimer } = useTimerStore()

  const isLogEntry = activeSheet === 'log-entry'
  const isStopTimer = activeSheet === 'stop-timer'
  const isEditEntry = activeSheet === 'edit-entry'
  const isOpen = isLogEntry || isStopTimer || isEditEntry

  const [form, setForm] = useState<FormState>(initForm)
  const [timerElapsed, setTimerElapsed] = useState(0)

  // Reactive data
  const activityType = useLiveQuery<ActivityType | undefined>(
    () =>
      sheetActivityId
        ? db.activityTypes.get(sheetActivityId)
        : activeTimer
        ? db.activityTypes.get(activeTimer.activityTypeId)
        : undefined,
    [sheetActivityId, activeTimer?.activityTypeId]
  )

  const companions = useLiveQuery<Companion[]>(
    () => (activityType?.allowCompanions ? db.companions.orderBy('name').toArray() : Promise.resolve([])),
    [activityType?.id]
  ) ?? []

  // Load existing entry for edit mode
  useEffect(() => {
    if (!isEditEntry || !editEntryId) return
    db.activityEntries.get(editEntryId).then((entry) => {
      if (entry) {
        setForm({
          date: entry.date,
          startTime: entry.startTime,
          endTime: entry.endTime,
          rating: entry.rating,
          notes: entry.notes,
          companionIds: entry.companionIds,
        })
      }
    })
  }, [isEditEntry, editEntryId])

  // Reset form when opening a new log-entry sheet
  useEffect(() => {
    if (isLogEntry) setForm(initForm())
  }, [isLogEntry, sheetActivityId])

  // Timer tick
  useEffect(() => {
    if (!isStopTimer || !activeTimer) return
    const startMs = new Date(activeTimer.startedAt).getTime()
    const tick = () => setTimerElapsed(Math.floor((Date.now() - startMs) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [isStopTimer, activeTimer])

  // ── Derived ──────────────────────────────────────────────────────────────────

  function durationMinutes(): number {
    const [sh, sm] = form.startTime.split(':').map(Number)
    const [eh, em] = form.endTime.split(':').map(Number)
    return Math.max(0, eh * 60 + em - (sh * 60 + sm))
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  function handleStartTimer() {
    if (!activityType) return
    startTimer({
      activityTypeId: activityType.id,
      activityTypeName: activityType.name,
      activityTypeEmoji: activityType.emoji,
      activityTypeColor: activityType.color,
      startedAt: new Date().toISOString(),
    })
    closeSheet()
    addToast(`${activityType.emoji} ${activityType.name} timer started`)
  }

  async function handleManualSave() {
    if (!activityType) return
    await saveEntry({
      activityTypeId: activityType.id,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      durationMinutes: durationMinutes(),
      rating: form.rating,
      notes: form.notes,
      companionIds: form.companionIds,
      inputMethod: 'manual',
    })
    closeSheet()
    addToast(`${activityType.emoji} ${activityType.name} saved`)
  }

  async function handleStopAndSave() {
    const timer = stopTimer()
    if (!timer || !activityType) return
    const startedAt = new Date(timer.startedAt)
    const endedAt = new Date()
    const durationMins = Math.round((endedAt.getTime() - startedAt.getTime()) / 60000)
    const startHHMM =
      String(startedAt.getHours()).padStart(2, '0') +
      ':' +
      String(startedAt.getMinutes()).padStart(2, '0')
    const endHHMM =
      String(endedAt.getHours()).padStart(2, '0') +
      ':' +
      String(endedAt.getMinutes()).padStart(2, '0')
    await saveEntry({
      activityTypeId: timer.activityTypeId,
      date: startedAt.toISOString().slice(0, 10),
      startTime: startHHMM,
      endTime: endHHMM,
      durationMinutes: durationMins,
      rating: form.rating,
      notes: form.notes,
      companionIds: form.companionIds,
      inputMethod: 'timer',
    })
    closeSheet()
    addToast(`${activityType.emoji} Saved! ${durationMins}m`)
  }

  async function handleEditSave() {
    if (!editEntryId) return
    await updateEntry(editEntryId, {
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      durationMinutes: durationMinutes(),
      rating: form.rating,
      notes: form.notes,
      companionIds: form.companionIds,
    })
    closeSheet()
    addToast('Entry updated')
  }

  // ── Derived sheet title ──────────────────────────────────────────────────────

  const sheetTitle = isStopTimer
    ? `Stop ${activityType?.name ?? 'Timer'}`
    : isEditEntry
    ? 'Edit Entry'
    : activityType
    ? `Log ${activityType.name}`
    : 'Log Activity'

  // ── Companion toggle ─────────────────────────────────────────────────────────

  function toggleCompanion(id: string) {
    setForm((f) => ({
      ...f,
      companionIds: f.companionIds.includes(id)
        ? f.companionIds.filter((c) => c !== id)
        : [...f.companionIds, id],
    }))
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={closeSheet} title={sheetTitle}>
      <div className="flex flex-col gap-5 pb-6">
        {/* ── Timer mode: elapsed display ─────────────────── */}
        {isStopTimer && activeTimer && (
          <div
            className="rounded-2xl px-4 py-4 flex flex-col items-center gap-1"
            style={{ backgroundColor: (activityType?.colorLight) ?? '#f1f5f9' }}
          >
            <span className="text-4xl font-bold tabular-nums text-slate-800">
              {formatElapsed(timerElapsed)}
            </span>
            <span className="text-sm text-slate-500">
              {activityType?.emoji} {activityType?.name}
            </span>
          </div>
        )}

        {/* ── Date (edit only) ────────────────────────────── */}
        {isEditEntry && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Date
            </label>
            <input
              type="date"
              value={form.date}
              max={todayYYYYMMDD()}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="glass w-full rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-coral/40"
            />
          </div>
        )}

        {/* ── Time range (manual + edit mode) ─────────────── */}
        {(isLogEntry || isEditEntry) && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Time
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                className="glass flex-1 rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-coral/40"
                aria-label="Start time"
              />
              <span className="text-slate-400 text-sm font-medium">–</span>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                className="glass flex-1 rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-coral/40"
                aria-label="End time"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5 pl-1">
              Duration: {durationMinutes()} min
            </p>
          </div>
        )}

        {/* ── Rating ──────────────────────────────────────── */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
            How did it go?
          </label>
          <EmojiRating
            value={form.rating}
            onChange={(r) => setForm((f) => ({ ...f, rating: r }))}
          />
        </div>

        {/* ── Companions ──────────────────────────────────── */}
        {activityType?.allowCompanions && companions.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
              Who joined?
            </label>
            <div className="flex flex-wrap gap-2">
              {companions.map((c) => {
                const selected = form.companionIds.includes(c.id)
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCompanion(c.id)}
                    className={`pressable px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                      selected
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'glass text-slate-600'
                    }`}
                  >
                    {c.emoji} {c.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Notes ───────────────────────────────────────── */}
        <div>
          <label
            htmlFor="entry-notes"
            className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide"
          >
            Notes
          </label>
          <textarea
            id="entry-notes"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Any observations…"
            rows={3}
            className="glass w-full rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-coral/40 resize-none"
          />
        </div>

        {/* ── Action buttons ───────────────────────────────── */}
        <div className="flex flex-col gap-2">
          {isStopTimer ? (
            <button
              type="button"
              onClick={handleStopAndSave}
              className="pressable w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-white text-sm shadow-soft transition-opacity"
              style={{ backgroundColor: activityType?.color ?? '#FF6B6B' }}
            >
              <Square size={16} fill="white" strokeWidth={0} />
              Stop &amp; Save
            </button>
          ) : isLogEntry ? (
            <>
              <button
                type="button"
                onClick={handleStartTimer}
                className="pressable w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-white text-sm shadow-soft"
                style={{ backgroundColor: activityType?.color ?? '#FF6B6B' }}
              >
                <Play size={16} fill="white" strokeWidth={0} />
                Start Timer
              </button>
              <button
                type="button"
                onClick={handleManualSave}
                className="pressable w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm glass text-slate-700"
              >
                <Check size={16} strokeWidth={2.5} />
                Save Manually
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleEditSave}
              className="pressable w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-white text-sm shadow-soft bg-coral"
            >
              <Check size={16} strokeWidth={2.5} />
              Save Changes
            </button>
          )}
        </div>
      </div>
    </BottomSheet>
  )
}
