import React, { useRef, useState } from 'react'
import { Driver, ScheduleBlock } from '../types'
import DutyBlock from './DutyBlock'
import { validateBreak, validateDutyWindow } from '../utils/validation'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { getAssignmentBlocks, validateDriverAssignment } from '../utils/assignmentValidation'

interface TimelineProps {
  date: string
  drivers: Driver[]
  onOpenSchedule: (driverId: string) => void
}

const HOUR_LABELS = Array.from({ length: 25 }, (_, i) => i)

export default function Timeline({ date, drivers, onOpenSchedule }: TimelineProps) {
  const { dispatch, bookings, shuttles } = useApp()
  const { showToast } = useToast()
  const trackRef = useRef<HTMLDivElement>(null)
  const [previewByDriver, setPreviewByDriver] = useState<Record<string, ScheduleBlock[]>>({})

  const onDuty = drivers.filter((d) => (d.schedules[date] ?? []).some((b) => b.type === 'DUTY')).length

  function currentBlocks(driver: Driver): ScheduleBlock[] {
    const scheduleBlocks = previewByDriver[driver.id] ?? driver.schedules[date] ?? []
    const tripBlocks = getAssignmentBlocks(driver, bookings, date, shuttles).map((trip) => ({
      ...trip,
      conflict: validateDriverAssignment(driver, bookings.find((booking) => booking.id === trip.bookingId)!, bookings, shuttles).length > 0,
    }))
    return [...scheduleBlocks, ...tripBlocks]
  }

  function handlePreview(driver: Driver, block: ScheduleBlock, startHour: number, endHour: number) {
    const blocks = driver.schedules[date] ?? []
    setPreviewByDriver((prev) => ({
      ...prev,
      [driver.id]: blocks.map((b) => (b.id === block.id ? { ...b, startHour, endHour } : b)),
    }))
  }

  function handleCommit(driver: Driver, block: ScheduleBlock, startHour: number, endHour: number) {
    if (block.type === 'TRIP') return
    const blocks = driver.schedules[date] ?? []
    const result = block.type === 'DUTY'
      ? validateDutyWindow(startHour, endHour, blocks, block.id)
      : (() => {
      const parentDuty = blocks.find((b) => b.type === 'DUTY' && b.id === block.dutyId)
        ?? blocks.find((b) => b.type === 'DUTY' && startHour >= b.startHour && endHour <= b.endHour)
      return parentDuty
        ? validateBreak(startHour, endHour, parentDuty, blocks, block.id)
        : { valid: false, errors: ['A break needs a duty window to belong to.'] }
      })()

    setPreviewByDriver((prev) => {
      const next = { ...prev }
      delete next[driver.id]
      return next
    })

    if (!result.valid) {
      showToast({ variant: 'error', title: 'Could not update schedule', description: result.errors[0] })
      return
    }
    const nextDutyId = block.type === 'BREAK'
      ? blocks.find((candidate) => candidate.type === 'DUTY' && startHour >= candidate.startHour && endHour <= candidate.endHour)?.id
      : block.dutyId
    const updated = blocks.map((b) => (b.id === block.id ? { ...b, startHour, endHour, dutyId: nextDutyId } : b))
    dispatch({ type: 'SET_DRIVER_BLOCKS', payload: { driverId: driver.id, date, blocks: updated } })
    showToast({ variant: 'success', title: 'Schedule updated', description: `${driver.name}'s ${block.type.toLowerCase()} block was adjusted.` })
  }

  return (
    <div className="card !p-4 md:!p-5 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 px-1">
        <div className="flex items-center gap-2 text-xs font-bold text-ink/70">
          <span className="inline-flex items-center gap-1.5 bg-white border border-ink/15 px-2.5 py-1 rounded-[3px]"><span className="h-2 w-2 rounded-full bg-bus" /> Duty</span>
          <span className="inline-flex items-center gap-1.5 bg-white border border-ink/15 px-2.5 py-1 rounded-[3px]"><span className="h-2 w-2 rounded-full bg-warning" /> Break</span>
          <span className="inline-flex items-center gap-1.5 bg-white border border-ink/15 px-2.5 py-1 rounded-[3px]"><span className="h-2 w-2 rounded-full bg-info" /> Trip</span>
          <span className="inline-flex items-center gap-1.5 bg-white border border-ink/15 px-2.5 py-1 rounded-[3px]"><span className="h-2 w-2 rounded-full bg-danger" /> Conflict</span>
          <span className="inline-flex items-center gap-1.5 bg-white border border-ink/15 px-2.5 py-1 rounded-[3px]"><span className="h-2 w-2 rounded-full bg-muted" /> Off</span>
        </div>
        <p className="text-xs text-muted"><span className="text-ink font-black">{onDuty}</span> of {drivers.length} drivers on duty</p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="flex pl-32">
            {HOUR_LABELS.filter((h) => h % 2 === 0).map((h) => (
              <div
                key={h}
                className="font-mono text-[10px] font-bold text-muted"
                style={{ width: `${(2 / 24) * 100}%` }}
              >
                {h.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          <div ref={trackRef} className="mt-2 space-y-2">
            {drivers.map((driver) => {
              const blocks = currentBlocks(driver)
              return (
                <div key={driver.id} className="flex items-center gap-3">
                  <button
                    onClick={() => onOpenSchedule(driver.id)}
                    className="w-32 shrink-0 text-left pr-2 group"
                  >
                    <p className="text-sm font-bold truncate group-hover:text-bus transition-colors">{driver.name}</p>
                    <p className="font-mono text-[10px] text-muted truncate">{driver.vehicleNumber}</p>
                  </button>
                  <div className="relative flex-1 h-10 bg-sand/50 border border-ink/15 rounded-[4px]">
                    {HOUR_LABELS.map((h) => (
                      <div
                        key={h}
                        className="absolute top-0 bottom-0 border-l border-ink/10"
                        style={{ left: `${(h / 24) * 100}%` }}
                      />
                    ))}
                    {blocks.length === 0 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-muted/60">
                        Off duty
                      </span>
                    )}
                    {blocks.map((block) => (
                      <DutyBlock
                        key={block.id}
                        block={block}
                        trackWidth={trackRef.current?.clientWidth ?? 700}
                        onClick={() => onOpenSchedule(driver.id)}
                        onPreview={(s, e) => handlePreview(driver, block, s, e)}
                        onCommit={(s, e) => handleCommit(driver, block, s, e)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
