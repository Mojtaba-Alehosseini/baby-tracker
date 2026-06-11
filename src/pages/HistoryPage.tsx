import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Search } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { ActivityEntry, ActivityType, Companion } from '../db/types'
import { EntryCard } from '../components/EntryCard'
import { LogEntrySheet } from '../components/LogEntrySheet'
import { formatDate } from '../utils/formatters'

function groupByDate(entries: ActivityEntry[]): Map<string, ActivityEntry[]> {
  const groups = new Map<string, ActivityEntry[]>()
  for (const e of [...entries].sort((a, b) => {
    const d = b.date.localeCompare(a.date)
    return d !== 0 ? d : b.startTime.localeCompare(a.startTime)
  })) {
    const group = groups.get(e.date) ?? []
    group.push(e)
    groups.set(e.date, group)
  }
  return groups
}

export function HistoryPage() {
  const [search, setSearch] = useState('')
  const [filterTypeId, setFilterTypeId] = useState<string | null>(null)

  const entries = useLiveQuery<ActivityEntry[]>(
    () => db.activityEntries.orderBy('date').reverse().toArray(),
    []
  ) ?? []

  const activityTypes = useLiveQuery<ActivityType[]>(
    () => db.activityTypes.orderBy('sortOrder').toArray(),
    []
  ) ?? []

  const companions = useLiveQuery<Companion[]>(
    () => db.companions.toArray(),
    []
  ) ?? []

  const typeMap = useMemo(
    () => new Map(activityTypes.map((a) => [a.id, a])),
    [activityTypes]
  )

  const filtered = useMemo(() => {
    let result = entries
    if (filterTypeId) {
      result = result.filter((e) => e.activityTypeId === filterTypeId)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (e) =>
          (e.notes ?? '').toLowerCase().includes(q) ||
          (typeMap.get(e.activityTypeId)?.name ?? '').toLowerCase().includes(q)
      )
    }
    return result
  }, [entries, filterTypeId, search, typeMap])

  const grouped = useMemo(() => groupByDate(filtered), [filtered])

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Header */}
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-bold text-slate-800">History</h1>
      </div>

      {/* Search */}
      <div className="px-5">
        <div className="glass rounded-2xl flex items-center gap-2 px-3">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="search"
            placeholder="Search notes or activities…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 py-3 text-sm text-slate-800 placeholder:text-slate-300 bg-transparent outline-none"
          />
        </div>
      </div>

      {/* Activity type filter chips */}
      <div className="px-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setFilterTypeId(null)}
          className={`pressable shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
            filterTypeId === null
              ? 'bg-slate-800 text-white'
              : 'glass text-slate-500'
          }`}
        >
          All
        </button>
        {activityTypes.map((a) => (
          <button
            key={a.id}
            onClick={() => setFilterTypeId(filterTypeId === a.id ? null : a.id)}
            className={`pressable shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
              filterTypeId === a.id
                ? 'text-white'
                : 'glass text-slate-500'
            }`}
            style={filterTypeId === a.id ? { backgroundColor: a.color } : {}}
          >
            <span>{a.emoji}</span>
            <span>{a.name}</span>
          </button>
        ))}
      </div>

      {/* Entry groups */}
      {grouped.size === 0 ? (
        <div className="px-5 glass mx-5 rounded-3xl px-4 py-8 text-center">
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-sm text-slate-400">
            {entries.length === 0 ? 'No entries logged yet' : 'No results found'}
          </p>
        </div>
      ) : (
        <div className="px-5 flex flex-col gap-5">
          <AnimatePresence initial={false}>
            {[...grouped.entries()].map(([date, dayEntries]) => (
              <motion.section
                key={date}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                aria-label={formatDate(date)}
              >
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  {formatDate(date)}
                </h2>
                <div className="flex flex-col gap-2">
                  <AnimatePresence initial={false}>
                    {dayEntries.map((entry, i) => (
                      <EntryCard
                        key={entry.id}
                        entry={entry}
                        activityType={typeMap.get(entry.activityTypeId)}
                        companions={companions}
                        animationDelay={i * 0.03}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.section>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Edit sheet */}
      <LogEntrySheet />
    </div>
  )
}
