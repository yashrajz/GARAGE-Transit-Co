// Driver schedule rules. Pure functions so they are easy to test.
import { ScheduleBlock } from '../types'
import { timeRangesOverlap } from './dateHelpers'

export const MAX_DUTY_HOURS = 14
export const MIN_BREAK_MINUTES = 30
export const OPERATING_START = 0
export const OPERATING_END = 24

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validateDutyWindow(
  start: number,
  end: number,
  existingBlocks: ScheduleBlock[],
  editingBlockId?: string,
): ValidationResult {
  const errors: string[] = []

  if (Number.isNaN(start) || Number.isNaN(end)) {
    errors.push('Start and end times are required.')
    return { valid: false, errors }
  }
  if (start >= end) {
    errors.push('Start time must be before end time.')
  }
  if (start < OPERATING_START || end > OPERATING_END) {
    errors.push('Duty must fall within operating hours (00:00–24:00).')
  }
  if (end - start > MAX_DUTY_HOURS) {
    errors.push(`Duty window cannot exceed ${MAX_DUTY_HOURS} hours.`)
  }

  const otherDuties = existingBlocks.filter((b) => b.type === 'DUTY' && b.id !== editingBlockId)
  for (const duty of otherDuties) {
    if (timeRangesOverlap(start, end, duty.startHour, duty.endHour)) {
      errors.push('This duty window overlaps with an existing duty window.')
      break
    }
  }

  return { valid: errors.length === 0, errors }
}

// A break must fit inside its duty window and not overlap sibling breaks.
export function validateBreak(
  bStart: number,
  bEnd: number,
  duty: { startHour: number; endHour: number },
  siblingBreaks: ScheduleBlock[],
  editingBlockId?: string,
): ValidationResult {
  const errors: string[] = []

  if (Number.isNaN(bStart) || Number.isNaN(bEnd)) {
    errors.push('Break start and end times are required.')
    return { valid: false, errors }
  }
  if (bStart >= bEnd) {
    errors.push('Break start must be before break end.')
  }
  if (bStart < duty.startHour || bEnd > duty.endHour) {
    errors.push('Break must lie fully inside the duty window.')
  }
  if ((bEnd - bStart) * 60 < MIN_BREAK_MINUTES) {
    errors.push(`Break must be at least ${MIN_BREAK_MINUTES} minutes long.`)
  }

  const otherBreaks = siblingBreaks.filter((b) => b.type === 'BREAK' && b.id !== editingBlockId)
  for (const brk of otherBreaks) {
    if (timeRangesOverlap(bStart, bEnd, brk.startHour, brk.endHour)) {
      errors.push('This break overlaps with another break.')
      break
    }
  }

  return { valid: errors.length === 0, errors }
}
