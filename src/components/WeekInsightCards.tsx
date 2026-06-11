import { useMemo } from 'react'
import { motion } from 'motion/react'
import { format, subDays, parseISO } from 'date-fns'
import type { ActivityEntry, ActivityType } from '../db/types'
import { formatDuration, ratingToEmoji } from '../utils/formatters'

interface WeekInsightCardsProps {
  entries: ActivityEntry[]
  activityTypes: ActivityType[]
}

interface InsightCard {
  id: string
  label: string
  value: string
  sub?: string
  color: string
  emoji: string
}

export function WeekInsightCards({ entries, activityTypes }: WeekInsightCardsProps) {
  const typeMap = useMemo(
    () => new Map(activityTypes.map((a) => [a.id, a])),
    [activityTypes]
  )

  const insights = useMemo<InsightCard[]>(() => {
    if (entries.length === 0) return []
    const cards: InsightCard[] = []

    // Total time per activity this week
    const totalByType = new Map<string, number>()
    for (const e of entries) {
      totalByType.set(e.activityTypeId, (totalByType.get(e.activityTypeId) ?? 0) + e.durationMinutes)
    }

    // Most time spent
    let topId = ''
    let topMins = 0
    for (const [id, mins] of totalByType) {
      if (mins > topMins) { topMins = mins; topId = id }
    }
    if (topId) {
      const t = typeMap.get(topId)
      if (t) {
        cards.push({
          id: 'top-activity',
          label: 'Most Time',
          value: t.name,
          sub: formatDuration(topMins) + ' this week',
          color: t.color,
          emoji: t.emoji,
        })
      }
    }

    // Average rating (across rated entries)
    const rated = entries.filter((e) => e.rating)
    if (rated.length > 0) {
      const avg = rated.reduce((s, e) => s + (e.rating ?? 0), 0) / rated.length
      const rounded = Math.round(avg) as 1 | 2 | 3 | 4 | 5
      cards.push({
        id: 'avg-rating',
        label: 'Avg Mood',
        value: ratingToEmoji(rounded),
        sub: `${avg.toFixed(1)} / 5`,
        color: '#FFB347',
        emoji: '📊',
      })
    }

    // Total activities logged
    cards.push({
      id: 'total-logged',
      label: 'Logged',
      value: String(entries.length),
      sub: entries.length === 1 ? 'activity' : 'activities',
      color: '#4ECDC4',
      emoji: '✅',
    })

    // Active days
    const uniqueDays = new Set(entries.map((e) => e.date)).size
    cards.push({
      id: 'active-days',
      label: 'Active Days',
      value: String(uniqueDays),
      sub: 'of 7',
      color: '#A78BFA',
      emoji: '📅',
    })

    return cards
  }, [entries, typeMap])

  if (insights.length === 0) {
    return (
      <section className="px-5" aria-label="Week insights">
        <h2 className="text-base font-semibold text-slate-700 mb-3">This Week</h2>
        <div className="glass rounded-3xl px-4 py-6 text-center">
          <p className="text-sm text-slate-400">Start tracking to see weekly insights</p>
        </div>
      </section>
    )
  }

  return (
    <section className="px-5" aria-label="Week insights">
      <h2 className="text-base font-semibold text-slate-700 mb-3">This Week</h2>
      <div className="grid grid-cols-2 gap-3">
        {insights.map((card, i) => (
          <motion.div
            key={card.id}
            className="glass rounded-3xl px-4 py-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.1, delay: i * 0.05 }}
          >
            <p className="text-xs font-medium text-slate-400 mb-1">{card.label}</p>
            <p
              className="text-2xl font-bold leading-none"
              style={{ color: card.color }}
            >
              {card.value}
            </p>
            {card.sub && (
              <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  )
}
