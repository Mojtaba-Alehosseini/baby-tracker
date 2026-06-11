// ─── Core Data Types ──────────────────────────────────────────────────────────

export interface ActivityType {
  id: string
  name: string
  emoji: string
  color: string        // hex e.g. '#FF6B6B'
  colorLight: string   // lighter version for backgrounds
  allowCompanions: boolean
  sortOrder: number
  isDefault: boolean
  createdAt: string    // ISO string
}

export interface Companion {
  id: string
  name: string
  emoji: string        // avatar emoji e.g. '👵'
  relationship: string // 'Grandmother', 'Father', 'Friend'
  createdAt: string
}

export interface ActivityEntry {
  id: string
  activityTypeId: string
  date: string           // 'YYYY-MM-DD' (local date)
  startTime: string      // 'HH:MM' (24h, local time)
  endTime: string        // 'HH:MM'
  durationMinutes: number
  rating: 1 | 2 | 3 | 4 | 5 | null
  notes: string
  companionIds: string[]
  inputMethod: 'timer' | 'manual'
  createdAt: string      // ISO string
  updatedAt: string      // ISO string
}

// ─── Default seed data ────────────────────────────────────────────────────────

export const DEFAULT_ACTIVITIES: Omit<ActivityType, 'id' | 'createdAt'>[] = [
  {
    name: 'Sleep',
    emoji: '💤',
    color: '#FF6B6B',
    colorLight: '#FFE5E5',
    allowCompanions: false,
    sortOrder: 0,
    isDefault: true,
  },
  {
    name: 'Outdoor Time',
    emoji: '🌳',
    color: '#4ECDC4',
    colorLight: '#E0F7F6',
    allowCompanions: true,
    sortOrder: 1,
    isDefault: true,
  },
  {
    name: 'Playtime',
    emoji: '🎨',
    color: '#A78BFA',
    colorLight: '#EDE9FE',
    allowCompanions: true,
    sortOrder: 2,
    isDefault: true,
  },
  {
    name: 'Mealtime',
    emoji: '🥣',
    color: '#FFB347',
    colorLight: '#FFF0D0',
    allowCompanions: false,
    sortOrder: 3,
    isDefault: true,
  },
  {
    name: 'Story Time',
    emoji: '📚',
    color: '#6BCB77',
    colorLight: '#E5F7E8',
    allowCompanions: true,
    sortOrder: 4,
    isDefault: true,
  },
]

// ─── CSV column map ───────────────────────────────────────────────────────────

export const CSV_COLUMNS = [
  'id',
  'date',
  'startTime',
  'endTime',
  'durationMinutes',
  'activityName',
  'rating',
  'notes',
  'companions',
  'inputMethod',
  'createdAt',
] as const

export type CsvRow = {
  id: string
  date: string
  startTime: string
  endTime: string
  durationMinutes: string
  activityName: string
  rating: string
  notes: string
  companions: string
  inputMethod: string
  createdAt: string
}
