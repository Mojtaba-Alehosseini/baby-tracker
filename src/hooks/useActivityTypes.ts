import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { ActivityType } from '../db/types'
import { nanoid } from 'nanoid'

export function useActivityTypes() {
  const activityTypes = useLiveQuery(
    () => db.activityTypes.orderBy('sortOrder').toArray(),
    [],
    [] as ActivityType[]
  )

  async function addActivityType(
    data: Omit<ActivityType, 'id' | 'createdAt' | 'isDefault'>
  ) {
    const now = new Date().toISOString()
    const existing = await db.activityTypes.count()
    await db.activityTypes.add({
      ...data,
      id: nanoid(),
      sortOrder: data.sortOrder ?? existing,
      isDefault: false,
      createdAt: now,
    })
  }

  async function updateActivityType(id: string, data: Partial<ActivityType>) {
    await db.activityTypes.update(id, data)
  }

  async function deleteActivityType(id: string) {
    await db.activityTypes.delete(id)
  }

  async function reorderActivityTypes(orderedIds: string[]) {
    await db.transaction('rw', db.activityTypes, async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        await db.activityTypes.update(orderedIds[i], { sortOrder: i })
      }
    })
  }

  return {
    activityTypes,
    addActivityType,
    updateActivityType,
    deleteActivityType,
    reorderActivityTypes,
  }
}
