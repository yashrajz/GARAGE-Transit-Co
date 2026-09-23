import React, { useEffect, useState } from 'react'
import { LucideIcon } from 'lucide-react'
import Reveal from './Reveal'

interface StatCardProps {
  label: string
  value: number
  suffix?: string
  icon: LucideIcon
  index?: number
  hint?: string
}

// Lightweight count-up: animates the displayed number from 0 to `value`
// on mount, without pulling in an extra animation library.
function useCountUp(target: number, durationMs = 900) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start: number | null = null
    let frame: number
    const step = (ts: number) => {
      if (start === null) start = ts
      const progress = Math.min((ts - start) / durationMs, 1)
      setDisplay(Math.round(progress * target))
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, durationMs])
  return display
}

export default function StatCard({ label, value, suffix, icon: Icon, index = 0, hint }: StatCardProps) {
  const displayValue = useCountUp(value)
  return (
    <Reveal delay={(index % 4) as 0 | 1 | 2 | 3}>
      <div className="card card-hover flex items-start justify-between overflow-hidden relative">
        <div className="absolute -top-12 -right-12 h-28 w-28 rounded-full bg-bus/10 pointer-events-none" />
        <div className="relative">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-muted">{label}</p>
          <p className="mt-2 text-[34px] leading-none font-display font-black tracking-tight">
            {displayValue}
            {suffix && <span className="text-lg text-muted font-bold ml-0.5">{suffix}</span>}
          </p>
          {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
        </div>
        <div className="relative bg-espresso text-cream p-2.5 rounded-[4px]">
          <Icon className="h-5 w-5 text-frame" />
        </div>
      </div>
    </Reveal>
  )
}
