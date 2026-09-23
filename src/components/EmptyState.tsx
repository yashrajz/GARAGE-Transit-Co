import React from 'react'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 relative overflow-hidden">
      <div className="absolute h-48 w-48 rounded-full bg-bus/10 pointer-events-none" />
      <div className="relative bg-espresso p-4 mb-5 rounded-[4px]">
        <Icon className="h-7 w-7 text-frame" />
      </div>
      <p className="relative font-display font-black text-lg tracking-tight">{title}</p>
      {description && <p className="relative text-sm text-muted mt-1.5 max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="relative mt-6">{action}</div>}
    </div>
  )
}
