import Papa from 'papaparse'
import { db } from '../db'
import type { ActivityEntry, ActivityType } from '../db/types'
import { CSV_COLUMNS } from '../db/types'

// ─── Serialise one entry to a CSV row ────────────────────────────────────────

function entryToRow(
  entry: ActivityEntry,
  activityTypeMap: Map<string, ActivityType>
): Record<string, string> {
  const activityType = activityTypeMap.get(entry.activityTypeId)
  const companions = entry.companionIds ?? []

  return {
    id: entry.id,
    date: entry.date,
    startTime: entry.startTime,
    endTime: entry.endTime,
    durationMinutes: String(entry.durationMinutes),
    activityName: activityType?.name ?? 'Unknown',
    rating: entry.rating != null ? String(entry.rating) : '',
    notes: entry.notes ?? '',
    companions: companions.join('|'), // pipe-separated IDs
    inputMethod: entry.inputMethod,
    createdAt: entry.createdAt,
  }
}

// ─── Public export function ───────────────────────────────────────────────────

/**
 * Export all entries to a CSV Blob.
 * Returns the Blob and a suggested filename.
 */
export async function exportToCSV(): Promise<{ blob: Blob; filename: string }> {
  const [entries, activityTypes] = await Promise.all([
    db.activityEntries.orderBy('date').toArray(),
    db.activityTypes.toArray(),
  ])

  const activityTypeMap = new Map(activityTypes.map((a) => [a.id, a]))
  const rows = entries.map((e) => entryToRow(e, activityTypeMap))

  const csv = Papa.unparse(rows, {
    columns: [...CSV_COLUMNS],
    header: true,
  })

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const dateStr = new Date().toISOString().slice(0, 10)
  const filename = `armin-tracker-${dateStr}.csv`

  return { blob, filename }
}

/**
 * Trigger a browser download of the CSV file.
 */
export async function downloadCSV(): Promise<void> {
  const { blob, filename } = await exportToCSV()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
