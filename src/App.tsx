import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { BottomNav } from './components/BottomNav'
import { ToastContainer } from './components/ToastContainer'
import { HomePage } from './pages/HomePage'
import { StoryPage } from './pages/StoryPage'
import { HistoryPage } from './pages/HistoryPage'
import { SettingsPage } from './pages/SettingsPage'

// Animated route wrapper with exit faster than enter
function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
        transition={{ type: 'spring', duration: 0.3, bounce: 0.1 }}
        className="min-h-dvh"
        // Bottom padding for the fixed nav bar (56px) + safe area
        style={{ paddingBottom: 'calc(64px + env(safe-area-inset-bottom))' }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/story" element={<StoryPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <HashRouter>
      <ToastContainer />
      <AnimatedRoutes />
      <BottomNav />
    </HashRouter>
  )
}
