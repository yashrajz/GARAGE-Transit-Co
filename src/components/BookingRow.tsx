import React from 'react'
import { Eye, Pencil, X } from 'lucide-react'
import { Booking, BookingStatus } from '../types'
import StatusBadge from './StatusBadge'

const STATUS_OPTIONS: BookingStatus[] = ['CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED']

interface BookingRowProps {
  booking: Booking
  showUser?: boolean
  isAdmin?: boolean
  onEdit?: (booking: Booking) => void
  onCancel?: (booking: Booking) => void
  onView?: (booking: Booking) => void
  onStatusChange?: (booking: Booking, status: BookingStatus) => void
  driverName?: string
  shuttleLabel?: string
}

export default function BookingRow({ booking, showUser, isAdmin, onEdit, onCancel, onView, onStatusChange, driverName, shuttleLabel }: BookingRowProps) {
  const disabled = booking.status === 'CANCELLED' || booking.status === 'COMPLETED'

  return (
    <div className="grid grid-cols-12 items-center gap-3 bg-white border border-ink/15 px-4 py-3 rounded-[4px] hover:shadow-card hover:-translate-y-[1px] transition-all">
      <div className="col-span-1 min-w-0 text-[11px] text-muted font-mono truncate">{booking.id}</div>
      {showUser && <div className="col-span-1 min-w-0 text-sm font-bold truncate">{booking.userName}</div>}
      <div className={`${showUser ? 'col-span-2' : 'col-span-3'} min-w-0`}>
        <p className="text-sm font-bold truncate">{booking.routeName}</p>
        <p className="text-xs text-muted">{booking.boardingPoint} to {booking.dropOffPoint}</p>
      </div>
      <div className="col-span-2 min-w-0 text-[13px] text-ink/80">
        {booking.date}
        <span className="text-muted"> · {booking.timeSlot}</span>
      </div>
      <div className="col-span-1 min-w-0 text-sm text-ink font-bold">{booking.seats}</div>
      <div className="col-span-1 min-w-0 text-sm text-ink/80">₹{booking.fare}</div>
      <div className={`${showUser && isAdmin ? 'col-span-2' : showUser ? 'col-span-1' : 'col-span-2'} min-w-0`}>
        {isAdmin && onStatusChange ? (
          <select
            value={booking.status}
            onChange={(e) => onStatusChange(booking, e.target.value as BookingStatus)}
            className="field !w-full min-w-0 !px-2 !py-1.5 !text-xs"
            aria-label={`Change status for booking ${booking.id}`}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="bg-surface">{s}</option>
            ))}
          </select>
        ) : (
          <StatusBadge status={booking.status} />
        )}
      </div>
      {isAdmin && <div className="col-span-1 min-w-0 text-xs text-muted truncate">{shuttleLabel ?? 'No shuttle'} · {driverName ?? 'Unassigned'}</div>}
      <div className={`${isAdmin && showUser ? 'col-span-1' : 'col-span-2'} flex min-w-0 items-center justify-end gap-1`}>
        {onView && (
          <button
            onClick={() => onView(booking)}
            aria-label={`View booking ${booking.id}`}
            className="p-1.5 text-muted hover:text-info hover:bg-info/10 transition-colors rounded-[3px]"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(booking)}
            disabled={disabled}
            aria-label={`Edit booking ${booking.id}`}
            className="p-1.5 text-muted hover:text-ink hover:bg-ink/[0.06] disabled:opacity-30 disabled:pointer-events-none transition-colors rounded-[3px]"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
        {onCancel && (
          <button
            onClick={() => onCancel(booking)}
            disabled={disabled}
            aria-label={`Cancel booking ${booking.id}`}
            className="p-1.5 text-muted hover:text-danger hover:bg-danger/10 disabled:opacity-30 disabled:pointer-events-none transition-colors rounded-[3px]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
