import { motion } from 'motion/react'

const RATINGS = [
  { value: 1 as const, emoji: '😫', label: 'Rough' },
  { value: 2 as const, emoji: '😕', label: 'Okay' },
  { value: 3 as const, emoji: '😐', label: 'Neutral' },
  { value: 4 as const, emoji: '😊', label: 'Good' },
  { value: 5 as const, emoji: '🌟', label: 'Great' },
]

interface EmojiRatingProps {
  value: 1 | 2 | 3 | 4 | 5 | null
  onChange: (rating: 1 | 2 | 3 | 4 | 5 | null) => void
  size?: 'sm' | 'md' | 'lg'
}

export function EmojiRating({ value, onChange, size = 'md' }: EmojiRatingProps) {
  const sizeClass = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  }[size]

  const buttonSize = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  }[size]

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Activity rating">
      {RATINGS.map((r) => {
        const isSelected = value === r.value
        return (
          <motion.button
            key={r.value}
            type="button"
            aria-label={`${r.label} (${r.value} of 5)`}
            aria-pressed={isSelected}
            onClick={() => onChange(isSelected ? null : r.value)}
            className={`pressable ${buttonSize} flex items-center justify-center rounded-2xl transition-all duration-150 ${
              isSelected
                ? 'bg-white shadow-glass scale-110 ring-2 ring-white/80'
                : 'opacity-40 hover:opacity-70'
            }`}
            whileTap={{ scale: 0.9 }}
          >
            <span className={sizeClass} role="img" aria-hidden="true">
              {r.emoji}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
