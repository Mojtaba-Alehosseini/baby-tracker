import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  /** Allow closing by clicking the backdrop */
  dismissible?: boolean
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  dismissible = true,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)

  // Trap focus & escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, dismissible, onClose])

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={dismissible ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed bottom-0 left-0 right-0 z-50 glass-sheet rounded-t-[28px] max-h-[90dvh] flex flex-col overflow-hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-300/70" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-5 pt-2 pb-4 flex-shrink-0">
                <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
                <button
                  onClick={onClose}
                  className="pressable w-8 h-8 flex items-center justify-center rounded-full bg-slate-100/80 text-slate-500 hover:text-slate-700 transition-colors"
                  aria-label="Close"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>
            )}

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
