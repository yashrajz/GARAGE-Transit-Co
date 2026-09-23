import React, { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Modal from './Modal'
import { Driver, ScheduleBlock } from '../types'
import { formatDateLabel, formatHour, parseTimeSlotToHour } from '../utils/dateHelpers'
import { validateBreak, validateDutyWindow } from '../utils/validation'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import StatusBadge from './StatusBadge'
import ConfirmDialog from './ConfirmDialog'

interface ScheduleModalProps {
  open: boolean
  onClose: () => void
  driver: Driver | null
  date: string
}

export default function ScheduleModal({ open, onClose, driver, date }: ScheduleModalProps) {
  const { dispatch } = useApp()
  const { showToast } = useToast()

  const [dutyStart, setDutyStart] = useState('08:00')
  const [dutyEnd, setDutyEnd] = useState('16:00')
  const [breakStart, setBreakStart] = useState('12:00')
  const [breakEnd, setBreakEnd] = useState('12:30')
  const [errors, setErrors] = useState<string[]>([])
  const [pendingDelete, setPendingDelete] = useState<ScheduleBlock | null>(null)

  if (!driver) return null
  const blocks = driver.schedules[date] ?? []

  function commitBlocks(next: ScheduleBlock[], successMsg: string) {
    dispatch({ type: 'SET_DRIVER_BLOCKS', payload: { driverId: driver!.id, date, blocks: next } })
    showToast({ variant: 'success', title: successMsg })
    setErrors([])
  }

  function handleAddDuty() {
    const start = parseTimeSlotToHour(dutyStart)
    const end = parseTimeSlotToHour(dutyEnd)
    const result = validateDutyWindow(start, end, blocks)
    if (!result.valid) return setErrors(result.errors)
    const newBlock: ScheduleBlock = { id: `b-DUTY-${Date.now()}`, type: 'DUTY', startHour: start, endHour: end }
    commitBlocks([...blocks, newBlock], 'Duty window added')
  }

  function handleAddBreak() {
    const start = parseTimeSlotToHour(breakStart)
    const end = parseTimeSlotToHour(breakEnd)
    const parentDuty = blocks.find((block) => block.type === 'DUTY' && start >= block.startHour && end <= block.endHour)
    if (!parentDuty) return setErrors(['Break must sit fully inside one duty window.'])
    const result = validateBreak(start, end, parentDuty, blocks)
    if (!result.valid) return setErrors(result.errors)
    const newBlock: ScheduleBlock = { id: `b-BREAK-${Date.now()}`, type: 'BREAK', startHour: start, endHour: end, dutyId: parentDuty.id }
    commitBlocks([...blocks, newBlock], 'Break added')
  }

  function removeBlock(blockId: string) {
    const target = blocks.find((b) => b.id === blockId)
    const next = blocks.filter((b) => b.id !== blockId)
    const cleaned = target?.type === 'DUTY'
      ? next.filter((block) => block.type !== 'BREAK' || block.dutyId !== target.id)
      : next
    commitBlocks(cleaned, `${target?.type === 'DUTY' ? 'Duty window' : 'Break'} removed`)
    setPendingDelete(null)
  }

  return (
    <Modal open={open} onClose={onClose} title={`${driver.name} — ${formatDateLabel(date)}`}>
      <div className="space-y-6">
        <div>
          <p className="label">Current schedule</p>
          {blocks.length === 0 ? (
            <p className="text-sm text-muted">Off duty this day.</p>
          ) : (
            <div className="space-y-2">
              {blocks.map((b) => (
                <div key={b.id} className="flex items-center justify-between bg-white border border-ink/15 px-3 py-2.5 rounded-[4px]">
                  <div className="flex items-center gap-2.5">
                    <StatusBadge status={b.type} />
                    <span className="text-sm font-bold">{formatHour(b.startHour)} – {formatHour(b.endHour)}</span>
                  </div>
                  <button
                    onClick={() => setPendingDelete(b)}
                    aria-label={`Remove ${b.type.toLowerCase()} block`}
                    className="p-1.5 text-muted hover:text-danger hover:bg-danger/10 transition-colors rounded-[3px]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-ink/15 pt-4">
          <p className="label">Add duty window</p>
          <div className="flex items-end gap-3">
            <label className="flex-1 text-xs text-muted font-semibold">
              Start
              <input type="time" value={dutyStart} onChange={(e) => setDutyStart(e.target.value)}
                className="field mt-1" />
            </label>
            <label className="flex-1 text-xs text-muted font-semibold">
              End
              <input type="time" value={dutyEnd} onChange={(e) => setDutyEnd(e.target.value)}
                className="field mt-1" />
            </label>
            <button onClick={handleAddDuty} className="btn-bus px-3.5 py-2.5 rounded-[4px]" aria-label="Add duty window">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="border-t border-ink/15 pt-4">
          <p className="label">Add break</p>
          <div className="flex items-end gap-3">
            <label className="flex-1 text-xs text-muted font-semibold">
              Start
              <input type="time" value={breakStart} onChange={(e) => setBreakStart(e.target.value)}
                className="field mt-1" />
            </label>
            <label className="flex-1 text-xs text-muted font-semibold">
              End
              <input type="time" value={breakEnd} onChange={(e) => setBreakEnd(e.target.value)}
                className="field mt-1" />
            </label>
            <button onClick={handleAddBreak} className="btn-bus px-3.5 py-2.5 rounded-[4px]" aria-label="Add break">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="border border-danger/30 bg-danger/10 px-3.5 py-2.5 rounded-[4px]">
            {errors.map((err) => (
              <p key={err} className="text-xs text-danger font-semibold">{err}</p>
            ))}
          </div>
        )}
      </div>
      <ConfirmDialog
        open={!!pendingDelete}
        title={`Remove ${pendingDelete?.type.toLowerCase() ?? 'schedule'} block?`}
        description="This changes the driver's availability for the selected day."
        confirmLabel="Remove block"
        onClose={() => setPendingDelete(null)}
        onConfirm={() => { if (pendingDelete) removeBlock(pendingDelete.id) }}
      />
    </Modal>
  )
}
