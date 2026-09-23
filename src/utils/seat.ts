// Cancelled bookings do not use capacity.
import { Booking } from '../types'
import { SEAT_CAPACITY } from '../data/mockData'

export function seatsLeft(
  bookings: Booking[],
  routeId: string,
  date: string,
  timeSlot: string,
  excludeBookingId?: string,
): number {
  const taken = bookings
    .filter(
      (b) =>
        b.routeId === routeId &&
        b.date === date &&
        b.timeSlot === timeSlot &&
        b.status !== 'CANCELLED' &&
        b.id !== excludeBookingId,
    )
    .reduce((sum, b) => sum + b.seats, 0)
  return Math.max(0, SEAT_CAPACITY - taken)
}
