import { getGreeting, formatDate, todayYYYYMMDD } from '../utils/formatters'

interface AppHeaderProps {
  date?: string // YYYY-MM-DD, defaults to today
}

export function AppHeader({ date = todayYYYYMMDD() }: AppHeaderProps) {
  const greeting = getGreeting()
  const dateLabel = formatDate(date)

  return (
    <header className="px-5 pt-4 pb-2">
      <p className="text-sm font-medium text-slate-400">{dateLabel}</p>
      <h1 className="text-2xl font-bold text-slate-800 mt-0.5">
        {greeting}, Armin! 👋
      </h1>
    </header>
  )
}
