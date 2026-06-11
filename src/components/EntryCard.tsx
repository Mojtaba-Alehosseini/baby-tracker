import { motion } from 'motion/react'
import { Pencil, Trash2 } from 'lucide-react'
import type { ActivityEntry, ActivityType, Companion } from '../db/types'
import { formatTime, formatDuration, ratingToEmoji } from '../utils/formatters'
import { useUIStore } from '../store/uiStore'
import { deleteEntry } from '../hooks/useActivityEntries'
import { useState } from 'react'

interface EntryCardProps {
  entry: ActivityEntry
  activityType: ActivityType | undefined
  companions: Companion[]
  showDate?: boolean
  animationDelay?: number
}

export function EntryCard({
  entry,
  activityType,
  companions,
  showDate = false,
  animationDelay = 0,
}: EntryCardProps) {
  const { openEditEntry, addToast } = useUIStore()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const color = activityType?.color ?? '#94a3b8'
  const colorLight = activityType?.colorLight ?? '#f1f5f9'
  const emoji = activityType?.emoji ?? '📝'
  const name = activityType?.name ?? 'Activity'

  const entryCompanions = companions.filter((c) => entry.companionIds.includes(c.id))

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    await deleteEntry(entry.id)
    addToast('Entry deleted', 'info')
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', duration: 0.4, bounce: 0.1, delay: animationDelay }}
      className="glass rounded-2xl px-4 py-3 flex items-start gap-3"
    >
      {/* Activity icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 mt-0.5"
        style={{ backgroundColor: colorLight }}
        aria-hidden="true"
      >
        {emoji}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-slate-800">{name}</span>
          {entry.rating && (
            <span className="text-base leading-none" aria-label={`Rating: ${entry.rating} of 5`}>
              {ratingToEmoji(entry.rating)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-slate-500">
            {formatTime(entry.startTime)} – {formatTime(entry.endTime)}
          </span>
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: color + '20', color }}
          >
            {formatDuration(entry.durationMinutes)}
          </span>
        </div>

        {entryCompanions.length > 0 && (
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            {entryCompanions.map((c) => (
              <span
                key={c.id}
                className="text-xs bg-slate-100/80 text-slate-600 px-2 py-0.5 rounded-full"
              >
                {c.emoji} {c.name}
              </span>
            ))}
          </div>
        )}

        {entry.notes && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{entry.notes}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1 shrink-0">
        <button
          onClick={() => openEditEntry(entry.id)}
          className="pressable w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100/60 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Edit entry"
        >
          <Pencil size={13} strokeWidth={2.5} />
        </button>
        <button
          onClick={handleDelete}
          className={`pressable w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${
            confirmDelete
              ? 'bg-rose-100 text-rose-500'
              : 'bg-slate-100/60 text-slate-400 hover:text-rose-400'
          }`}
          aria-label={confirmDelete ? 'Confirm delete' : 'Delete entry'}
        >
          <Trash2 size={13} strokeWidth={2.5} />
        </button>
      </div>
    </motion.div>
  )
}
