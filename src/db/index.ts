import Dexie, { type Table } from 'dexie'
import { nanoid } from 'nanoid'
import type { ActivityType, ActivityEntry, Companion } from './types'
import { DEFAULT_ACTIVITIES } from './types'

class ArminTrackerDB extends Dexie {
  activityTypes!: Table<ActivityType, string>
  activityEntries!: Table<ActivityEntry, string>
  companions!: Table<Companion, string>

  constructor() {
    super('ArminTrackerDB')

    this.version(1).stores({
      activityTypes: 'id, sortOrder, createdAt',
      activityEntries:
        'id, activityTypeId, date, [date+activityTypeId], createdAt',
      companions: 'id, name, createdAt',
    })

    // Seed default activity types on first run
    this.on('populate', async () => {
      const now = new Date().toISOString()
      await this.activityTypes.bulkAdd(
        DEFAULT_ACTIVITIES.map((a) => ({
          ...a,
          id: nanoid(),
          createdAt: now,
        }))
      )
    })
  }
}

export const db = new ArminTrackerDB()
export type { ActivityType, ActivityEntry, Companion }
