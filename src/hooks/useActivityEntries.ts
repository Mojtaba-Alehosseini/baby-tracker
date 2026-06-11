import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { ActivityEntry } from '../db/types'
import { nanoid } from 'nanoid'

export function useActivityEntries(date?: string) {
  const entries = useLiveQuery(
    () => {
      if (date) {
        return db.activityEntries
          .where('date')
          .equals(date)
          .sortBy('startTime')
      }
      return db.activityEntries.orderBy('createdAt').reverse().toArray()
    },
    [date],
    [] as ActivityEntry[]
  )

  return entries
}

export function useRecentEntries(limit = 5) {
  return useLiveQuery(
    () =>
      db.activityEntries
        .orderBy('createdAt')
        .reverse()
        .limit(limit)
        .toArray(),
    [],
    [] as ActivityEntry[]
  )
}

export function useEntriesForDateRange(startDate: string, endDate: string) {
  return useLiveQuery(
    () =>
      db.activityEntries
        .where('date')
        .between(startDate, endDate, true, true)
        .toArray(),
    [startDate, endDate],
    [] as ActivityEntry[]
  )
}

export async function saveEntry(
  data: Omit<ActivityEntry, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = new Date().toISOString()
  const id = nanoid()
  await db.activityEntries.add({
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  })
  return id
}

export async function updateEntry(
  id: string,
  data: Partial<Omit<ActivityEntry, 'id' | 'createdAt'>>
): Promise<void> {
  const now = new Date().toISOString()
  await db.activityEntries.update(id, { ...data, updatedAt: now })
}

export async function deleteEntry(id: string): Promise<void> {
  await db.activityEntries.delete(id)
}

export async function getEntry(id: string): Promise<ActivityEntry | undefined> {
  return db.activityEntries.get(id)
}
