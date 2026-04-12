import { createContext, useCallback, useContext, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastCtx {
  addToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastCtx>({ addToast: () => {} })

let nextId = 1

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = nextId++
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  const dismiss = (id: number) => setToasts(prev => prev.filter(t => t.id !== id))

  const COLORS: Record<ToastType, { bg: string; border: string; icon: string }> = {
    success: { bg: '#f0fdf4', border: '#22c55e', icon: '✓' },
    error:   { bg: '#fef2f2', border: '#ef4444', icon: '✕' },
    info:    { bg: 'var(--brand-100)', border: 'var(--brand-500)', icon: 'ℹ' },
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast stack — fixed bottom-right */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          zIndex: 9999,
          pointerEvents: 'none',
        }}
      >
        {toasts.map(toast => {
          const c = COLORS[toast.type]
          return (
            <div
              key={toast.id}
              className="toast-enter"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                background: c.bg,
                border: `1px solid ${c.border}`,
                borderLeft: `4px solid ${c.border}`,
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                minWidth: 260,
                maxWidth: 380,
                pointerEvents: 'all',
                cursor: 'default',
              }}
            >
              <span style={{
                width: 20, height: 20,
                borderRadius: '50%',
                background: c.border,
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {c.icon}
              </span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', flex: 1, lineHeight: 1.4 }}>
                {toast.message}
              </span>
              <button
                onClick={() => dismiss(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  fontSize: 16,
                  lineHeight: 1,
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
