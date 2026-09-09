import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { errorMessage } from '../lib/errors'

type ToastTone = 'error' | 'success'

interface Toast {
  id: number
  message: string
  tone: ToastTone
}

interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone) => void
  /** Runs an action and surfaces any failure as a toast instead of a dead tap. */
  report: (action: () => Promise<unknown>, fallback: string) => Promise<boolean>
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, tone: ToastTone = 'error') => {
    const id = nextId++
    setToasts((current) => [...current, { id, message, tone }])
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 4000)
  }, [])

  const report = useCallback(
    async (action: () => Promise<unknown>, fallback: string) => {
      try {
        await action()
        return true
      } catch (err) {
        showToast(errorMessage(err, fallback))
        return false
      }
    },
    [showToast],
  )

  return (
    <ToastContext.Provider value={{ showToast, report }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-30 flex flex-col items-center gap-2 px-6">
        {toasts.map((toast) => (
          <output
            key={toast.id}
            className={`w-full max-w-md rounded-lg px-4 py-3 text-sm text-white shadow-lg ${
              toast.tone === 'error' ? 'bg-red-600' : 'bg-gray-900'
            }`}
          >
            {toast.message}
          </output>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}
