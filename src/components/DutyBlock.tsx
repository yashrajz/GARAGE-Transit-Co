import React, { useCallback, useRef, useState } from 'react'
import { ScheduleBlock } from '../types'
import { formatHour } from '../utils/dateHelpers'

interface DutyBlockProps {
  block: ScheduleBlock
  trackWidth: number // px width representing the full 24h track
  onClick: () => void
  /** Called continuously while dragging (not committed yet). */
  onPreview: (startHour: number, endHour: number) => void
  /** Called on release; consumer validates + commits or reverts. */
  onCommit: (startHour: number, endHour: number) => void
}

const HOURS = 24

export default function DutyBlock({ block, trackWidth, onClick, onPreview, onCommit }: DutyBlockProps) {
  const [dragging, setDragging] = useState<'move' | 'left' | 'right' | null>(null)
  const dragState = useRef<{ startX: number; startHour: number; endHour: number } | null>(null)
  const hourWidth = trackWidth / HOURS

  const snap = (hour: number) => Math.max(0, Math.min(HOURS, Math.round(hour * 2) / 2))

  const beginDrag = useCallback(
    (mode: 'move' | 'left' | 'right') => (e: React.PointerEvent) => {
      e.stopPropagation()
      ;(e.target as Element).setPointerCapture(e.pointerId)
      dragState.current = { startX: e.clientX, startHour: block.startHour, endHour: block.endHour }
      setDragging(mode)
    },
    [block.startHour, block.endHour],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !dragState.current) return
      const deltaHours = (e.clientX - dragState.current.startX) / hourWidth
      let { startHour, endHour } = dragState.current

      if (dragging === 'move') {
        const duration = endHour - startHour
        startHour = snap(dragState.current.startHour + deltaHours)
        endHour = snap(startHour + duration)
      } else if (dragging === 'left') {
        startHour = snap(dragState.current.startHour + deltaHours)
      } else if (dragging === 'right') {
        endHour = snap(dragState.current.endHour + deltaHours)
      }
      if (startHour < endHour) onPreview(startHour, endHour)
    },
    [dragging, hourWidth, onPreview],
  )

  const endDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !dragState.current) return
      const deltaHours = (e.clientX - dragState.current.startX) / hourWidth
      let { startHour, endHour } = dragState.current
      if (dragging === 'move') {
        const duration = endHour - startHour
        startHour = snap(dragState.current.startHour + deltaHours)
        endHour = snap(startHour + duration)
      } else if (dragging === 'left') {
        startHour = snap(dragState.current.startHour + deltaHours)
      } else if (dragging === 'right') {
        endHour = snap(dragState.current.endHour + deltaHours)
      }
      setDragging(null)
      dragState.current = null
      if (startHour < endHour) onCommit(startHour, endHour)
    },
    [dragging, hourWidth, onCommit],
  )

  const left = (block.startHour / HOURS) * 100
  const width = ((block.endHour - block.startHour) / HOURS) * 100
  const isDuty = block.type === 'DUTY'
  const isTrip = block.type === 'TRIP'

  return (
    <div
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${block.type} from ${formatHour(block.startHour)} to ${formatHour(block.endHour)}`}
      className={`group absolute top-1 bottom-1 border rounded-[3px] ${
        isTrip
          ? block.conflict ? 'bg-danger/80 border-danger' : 'bg-info/80 border-info'
          : isDuty
          ? 'bg-gradient-to-r from-busDeep via-bus to-[#E0682F] border-espresso/40 shadow-stamp'
          : 'bg-gradient-to-r from-warning/70 to-[#E9C87E] border-[#8A6420]/40'
      } ${isTrip ? '' : 'cursor-grab active:cursor-grabbing'} ${dragging ? 'z-20 shadow-pop scale-[1.02]' : 'z-10'}`}
      style={{ left: `${left}%`, width: `${Math.max(width, 1.5)}%` }}
      onPointerDown={isTrip ? undefined : beginDrag('move')}
    >
      {!isTrip && <span
        onPointerDown={beginDrag('left')}
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize"
        aria-hidden="true"
      />}
      {!isTrip && <span
        onPointerDown={beginDrag('right')}
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize"
        aria-hidden="true"
      />}
      <div className="pointer-events-none px-2 h-full flex items-center overflow-hidden">
        <span className="text-[11px] font-bold text-cream truncate">
          {isTrip ? block.label ?? 'Assigned trip' : block.type === 'DUTY' ? 'Duty' : 'Break'} {formatHour(block.startHour)}–{formatHour(block.endHour)}
        </span>
      </div>

      <div
        role="tooltip"
        className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-espresso text-cream px-2.5 py-1 text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity rounded-[3px]"
      >
        {isTrip ? block.conflict ? 'Conflict: ' : '' : block.type === 'DUTY' ? 'Duty' : 'Break'}{isTrip ? block.label ?? 'Assigned trip' : ''} {formatHour(block.startHour)}–{formatHour(block.endHour)}
      </div>
    </div>
  )
}
