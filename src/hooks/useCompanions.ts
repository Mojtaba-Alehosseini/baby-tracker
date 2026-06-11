import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { Companion } from '../db/types'
import { nanoid } from 'nanoid'

export function useCompanions() {
  const companions = useLiveQuery(
    () => db.companions.orderBy('name').toArray(),
    [],
    [] as Companion[]
  )

  async function addCompanion(data: Omit<Companion, 'id' | 'createdAt'>) {
    const now = new Date().toISOString()
    await db.companions.add({ ...data, id: nanoid(), createdAt: now })
  }

  async function updateCompanion(id: string, data: Partial<Companion>) {
    await db.companions.update(id, data)
  }

  async function deleteCompanion(id: string) {
    // Also clean companion from all entries
    await db.transaction('rw', [db.companions, db.activityEntries], async () => {
      await db.companions.delete(id)
      const affected = await db.activityEntries
        .filter((e) => e.companionIds.includes(id))
        .toArray()
      for (const entry of affected) {
        await db.activityEntries.update(entry.id, {
          companionIds: entry.companionIds.filter((c) => c !== id),
        })
      }
    })
  }

  return { companions, addCompanion, updateCompanion, deleteCompanion }
}
