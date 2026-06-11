import { format, parseISO, isToday, isYesterday } from 'date-fns'

// ─── Duration ────────────────────────────────────────────────────────────────

/** 90 → "1h 30m" | 45 → "45m" | 0 → "0m" */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0m'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/** Elapsed seconds → "0:00" or "1:23:45" display */
export function formatElapsed(seconds: number): string {
  const s = Math.floor(seconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(sec).padStart(2, '0')
  if (h > 0) return `${h}:${mm}:${ss}`
  return `${m}:${ss}`
}

/** 75 → { hours: 1, minutes: 15 } */
export function minutesToHoursMinutes(minutes: number): { hours: number; minutes: number } {
  return { hours: Math.floor(minutes / 60), minutes: minutes % 60 }
}

// ─── Time ────────────────────────────────────────────────────────────────────

/** "14:30" → "2:30 PM" */
export function formatTime(hhmm: string): string {
  if (!hhmm || !hhmm.includes(':')) return hhmm
  const [h, m] = hhmm.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

/** Returns current local time as "HH:MM" */
export function nowHHMM(): string {
  const now = new Date()
  return (
    String(now.getHours()).padStart(2, '0') +
    ':' +
    String(now.getMinutes()).padStart(2, '0')
  )
}

/** Returns current local date as "YYYY-MM-DD" */
export function todayYYYYMMDD(): string {
  const now = new Date()
  return (
    now.getFullYear() +
    '-' +
    String(now.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(now.getDate()).padStart(2, '0')
  )
}

// ─── Date ────────────────────────────────────────────────────────────────────

/** "2024-06-15" → "Saturday, June 15" (or "Today" / "Yesterday") */
export function formatDate(yyyymmdd: string): string {
  try {
    const d = parseISO(yyyymmdd)
    if (isToday(d)) return 'Today'
    if (isYesterday(d)) return 'Yesterday'
    return format(d, 'EEEE, MMMM d')
  } catch {
    return yyyymmdd
  }
}

/** "2024-06-15" → "Jun 15" (short) */
export function formatDateShort(yyyymmdd: string): string {
  try {
    return format(parseISO(yyyymmdd), 'MMM d')
  } catch {
    return yyyymmdd
  }
}

/** "2024-06-15" → "Jun 2024" (month label) */
export function formatMonth(yyyymmdd: string): string {
  try {
    return format(parseISO(yyyymmdd), 'MMMM yyyy')
  } catch {
    return yyyymmdd
  }
}

// ─── Greeting ────────────────────────────────────────────────────────────────

/** Returns time-of-day greeting */
export function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

// ─── Ratings ─────────────────────────────────────────────────────────────────

const RATING_EMOJIS: Record<number, string> = {
  1: '😫',
  2: '😕',
  3: '😐',
  4: '😊',
  5: '🌟',
}

export function ratingToEmoji(rating: number | null): string {
  if (!rating) return '—'
  return RATING_EMOJIS[rating] ?? '—'
}

export function ratingLabel(rating: number | null): string {
  const labels: Record<number, string> = {
    1: 'Rough',
    2: 'Okay',
    3: 'Neutral',
    4: 'Good',
    5: 'Great',
  }
  if (!rating) return 'Not rated'
  return labels[rating] ?? 'Not rated'
}

// ─── Misc ────────────────────────────────────────────────────────────────────

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Pluralize: pluralize(3, 'minute') → "3 minutes" */
export function pluralize(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : (plural ?? singular + 's')
  return `${count} ${word}`
}
