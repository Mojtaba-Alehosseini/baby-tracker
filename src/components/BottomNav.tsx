import { NavLink, useLocation } from 'react-router-dom'
import { Home, BarChart2, Clock, Settings } from 'lucide-react'
import { motion } from 'motion/react'

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/story', icon: BarChart2, label: 'Insights' },
  { to: '/history', icon: Clock, label: 'History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav
      className="glass-nav fixed bottom-0 left-0 right-0 z-30 flex items-center"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
        const isActive =
          to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

        return (
          <NavLink
            key={to}
            to={to}
            className="pressable flex-1 flex flex-col items-center gap-0.5 py-2 min-h-[56px] justify-center"
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className="relative flex items-center justify-center w-10 h-8">
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-coral/15"
                  transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
                />
              )}
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 2}
                className={`relative transition-colors duration-150 ${
                  isActive ? 'text-coral' : 'text-slate-400'
                }`}
              />
            </div>
            <span
              className={`text-[10px] font-medium leading-none transition-colors duration-150 ${
                isActive ? 'text-coral' : 'text-slate-400'
              }`}
            >
              {label}
            </span>
          </NavLink>
        )
      })}
    </nav>
  )
}
