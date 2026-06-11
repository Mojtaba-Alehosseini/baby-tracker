import Papa from 'papaparse'
import { db } from '../db'
import type { ActivityEntry, CsvRow } from '../db/types'
import { nanoid } from 'nanoid'

// ─── Fingerprint for deduplication ───────────────────────────────────────────
// Unique per logical activity: same date + startTime + activityType on the same day

function fingerprint(date: string, startTime: string, activityTypeId: string): string {
  return `${date}|${startTime}|${activityTypeId}`
}

// ─── Parse helpers ────────────────────────────────────────────────────────────

function parseRating(val: string): 1 | 2 | 3 | 4 | 5 | null {
  const n = parseInt(val, 10)
  if (n >= 1 && n <= 5) return n as 1 | 2 | 3 | 4 | 5
  return null
}

function parseCompanionIds(val: string): string[] {
  if (!val || val.trim() === '') return []
  return val.split('|').map((s) => s.trim()).filter(Boolean)
}

function parseInputMethod(val: string): 'timer' | 'manual' {
  return val === 'timer' ? 'timer' : 'manual'
}

// ─── Main import function ─────────────────────────────────────────────────────

export interface ImportResult {
  imported: number
  skipped: number   // duplicates
  errors: number    // rows that couldn't be parsed
}

/**
 * Parse a CSV file and import entries, skipping duplicates.
 * Deduplication key: date + startTime + activityTypeId (matched by name).
 */
export async function importFromCSV(file: File): Promise<ImportResult> {
  const text = await file.text()

  const parsed = Papa.parse<CsvRow>(text, {
    header: true,
    skipEmptyLines: true,
  })

  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    throw new Error(`CSV parse failed: ${parsed.errors[0].message}`)
  }

  // Build name→id lookup from current activity types
  const activityTypes = await db.activityTypes.toArray()
  const nameToId = new Map(activityTypes.map((a) => [a.name.toLowerCase(), a.id]))

  // Build existing fingerprints for deduplication
  const existingEntries = await db.activityEntries.toArray()
  const existingFingerprints = new Set(
    existingEntries.map((e) => fingerprint(e.date, e.startTime, e.activityTypeId))
  )

  const toInsert: ActivityEntry[] = []
  let skipped = 0
  let errors = 0

  for (const row of parsed.data) {
    try {
      // Resolve activity type by name (case-insensitive)
      const activityTypeId = nameToId.get(row.activityName?.toLowerCase() ?? '')
      if (!activityTypeId) {
        // Unknown activity type — skip but don't count as error
        skipped++
        continue
      }

      const date = row.date?.trim()
      const startTime = row.startTime?.trim()
      if (!date || !startTime) {
        errors++
        continue
      }

      const fp = fingerprint(date, startTime, activityTypeId)
      if (existingFingerprints.has(fp)) {
        skipped++
        continue
      }

      const now = new Date().toISOString()
      const entry: ActivityEntry = {
        id: row.id?.trim() || nanoid(),
        activityTypeId,
        date,
        startTime,
        endTime: row.endTime?.trim() ?? '',
        durationMinutes: parseInt(row.durationMinutes, 10) || 0,
        rating: parseRating(row.rating),
        notes: row.notes?.trim() ?? '',
        companionIds: parseCompanionIds(row.companions),
        inputMethod: parseInputMethod(row.inputMethod),
        createdAt: row.createdAt?.trim() || now,
        updatedAt: now,
      }

      toInsert.push(entry)
      existingFingerprints.add(fp) // prevent dupes within same import batch
    } catch {
      errors++
    }
  }

  if (toInsert.length > 0) {
    await db.activityEntries.bulkAdd(toInsert)
  }

  return { imported: toInsert.length, skipped, errors }
}
