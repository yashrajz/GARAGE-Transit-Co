import { Booking, Driver, Shuttle } from '../types'
import { parseTimeSlotToHour, timeRangesOverlap } from './dateHelpers'

export const DEFAULT_TRIP_DURATION_HOURS = 1

export function validateDriverAssignment(
  driver: Driver,
  booking: Pick<Booking, 'id' | 'date' | 'timeSlot'>,
  bookings: Booking[],
  shuttles: Shuttle[] = [],
): string[] {
  const start = parseTimeSlotToHour(booking.timeSlot)
  const end = start + DEFAULT_TRIP_DURATION_HOURS
  const blocks = driver.schedules[booking.date] ?? []
  const duties = blocks.filter((block) => block.type === 'DUTY')
  const breaks = blocks.filter((block) => block.type === 'BREAK')
  const errors: string[] = []

  if (!duties.some((duty) => start >= duty.startHour && end <= duty.endHour)) {
    errors.push('The trip falls outside this driver\'s duty hours.')
  }
  if (breaks.some((breakBlock) => timeRangesOverlap(start, end, breakBlock.startHour, breakBlock.endHour))) {
    errors.push('The trip overlaps this driver\'s break.')
  }
  if (bookings.some((other) =>
    other.id !== booking.id &&
    shuttles.find((shuttle) => shuttle.id === other.shuttleId)?.driverId === driver.id &&
    other.date === booking.date &&
    other.status !== 'CANCELLED' &&
    timeRangesOverlap(start, end, parseTimeSlotToHour(other.timeSlot), parseTimeSlotToHour(other.timeSlot) + DEFAULT_TRIP_DURATION_HOURS),
  )) {
    errors.push('This driver already has a conflicting trip.')
  }

  return errors
}


export function getAssignmentBlocks(driver: Driver, bookings: Booking[], date: string, shuttles: Shuttle[] = []) {
  return bookings
    .filter((booking) => shuttles.find((shuttle) => shuttle.id === booking.shuttleId)?.driverId === driver.id && booking.date === date && booking.status !== 'CANCELLED')
    .map((booking) => ({
      id: `trip-${booking.id}`,
      type: 'TRIP' as const,
      startHour: parseTimeSlotToHour(booking.timeSlot),
      endHour: parseTimeSlotToHour(booking.timeSlot) + DEFAULT_TRIP_DURATION_HOURS,
      bookingId: booking.id,
      label: `${booking.routeName} · ${booking.userName}`,
    }))
}
