import React from 'react'
import { BookingStatus, ScheduleBlockType, TripStatus } from '../types'

type Status = BookingStatus | TripStatus | ScheduleBlockType | 'OFF'

const styles: Record<Status, string> = {
  CONFIRMED: 'bg-success/10 text-success border-success/30',
  PENDING: 'bg-warning/15 text-[#8A6420] border-warning/40',
  CANCELLED: 'bg-danger/10 text-danger border-danger/30',
  COMPLETED: 'bg-info/10 text-info border-info/30',
  MISSED: 'bg-danger/10 text-danger border-danger/30',
  DUTY: 'bg-success/10 text-success border-success/30',
  BREAK: 'bg-warning/15 text-[#8A6420] border-warning/40',
  TRIP: 'bg-info/10 text-info border-info/30',
  OFF: 'bg-ink/[0.05] text-muted border-ink/15',
}

const dots: Record<Status, string> = {
  CONFIRMED: 'bg-success',
  PENDING: 'bg-warning',
  CANCELLED: 'bg-danger',
  COMPLETED: 'bg-info',
  MISSED: 'bg-danger',
  DUTY: 'bg-success',
  BREAK: 'bg-warning',
  TRIP: 'bg-info',
  OFF: 'bg-muted',
}

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold tracking-wide border rounded-[4px] bg-white ${styles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]} animate-[pulseDot_2s_ease-in-out_infinite]`} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  )
}
