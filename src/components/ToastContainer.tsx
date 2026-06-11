import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { useUIStore, type Toast } from '../store/uiStore'

function ToastIcon({ type }: { type: Toast['type'] }) {
  const props = { size: 18, strokeWidth: 2 }
  if (type === 'success') return <CheckCircle {...props} className="text-emerald-500 shrink-0" />
  if (type === 'error') return <AlertCircle {...props} className="text-rose-500 shrink-0" />
  return <Info {...props} className="text-sky-500 shrink-0" />
}

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts)
  const removeToast = useUIStore((s) => s.removeToast)

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
            className="glass-strong pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-glass-lg text-sm text-slate-800 max-w-xs"
          >
            <ToastIcon type={toast.type} />
            <span className="flex-1 font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="pressable ml-1 -mr-1 p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
