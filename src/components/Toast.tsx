import React from 'react'
import { CheckCircle2, Info, XCircle, X } from 'lucide-react'
import { ToastMessage } from '../types'

const icons = { success: CheckCircle2, error: XCircle, info: Info }
const bars = { success: 'from-success to-olive', error: 'from-danger to-bus', info: 'from-info to-olive' }

export default function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-[min(360px,calc(100vw-2rem))]">
      {toasts.map((t) => {
        const Icon = icons[t.variant]
        return (
          <div
            key={t.id}
            className="reveal relative overflow-hidden bg-cream border border-ink/20 shadow-pop p-4 rounded-[4px]"
            role="status"
          >
            <div className="flex items-start gap-3">
              <span className="bg-espresso p-1.5 rounded-[3px]">
                <Icon className={`h-4 w-4 shrink-0 ${t.variant === 'success' ? 'text-cream' : t.variant === 'error' ? 'text-frame' : 'text-cream'}`} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">{t.title}</p>
                {t.description && <p className="text-xs text-muted mt-0.5 leading-relaxed">{t.description}</p>}
              </div>
              <button
                onClick={() => onDismiss(t.id)}
                aria-label="Dismiss notification"
                className="text-muted hover:text-ink transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className={`absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r ${bars[t.variant]}`} />
          </div>
        )
      })}
    </div>
  )
}
