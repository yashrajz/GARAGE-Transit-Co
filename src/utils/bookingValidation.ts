import { Booking, Route } from '../types'
import { isDepartureTimeAvailable } from './departures'
import { localTodayISO } from './dateHelpers'

export interface BookingDraft {
  routeId: string
  date: string
  timeSlot: string
  boardingPoint: string
  dropOffPoint: string
  seats: number
}

export interface BookingValidationResult {
  valid: boolean
  errors: string[]
}

// One booking covers at most 4 seats; larger groups book separately.
export const MAX_SEATS_PER_BOOKING = 4

/** Validates a booking draft against route data, capacity, and user conflicts. */
export function validateBooking(
  draft: BookingDraft,
  routes: Route[],
  bookings: Booking[],
  availableSeats: number,
  userId?: string,
  excludeBookingId?: string,
  now = new Date(),
): BookingValidationResult {
  const errors: string[] = []
  const route = routes.find((candidate) => candidate.id === draft.routeId)

  if (!route) {
    errors.push('Select a valid shuttle route.')
    return { valid: false, errors }
  }
  if (!route.active) errors.push('This route is no longer accepting new bookings.')
  if (!draft.date) errors.push('Choose a booking date.')
  if (draft.date && draft.date < localTodayISO()) errors.push('Bookings cannot be made for a past date.')
  if (!route.schedule.includes(draft.timeSlot)) errors.push('That time slot is not available on the selected route.')
  if (draft.date && draft.date >= localTodayISO() && draft.timeSlot && !isDepartureTimeAvailable(draft.date, draft.timeSlot, now)) {
    errors.push('This departure has already passed. Please select a later shuttle.')
  }

  const pickupIndex = route.stops.indexOf(draft.boardingPoint)
  const dropOffIndex = route.stops.indexOf(draft.dropOffPoint)
  if (pickupIndex < 0) errors.push('Choose a pickup point from the selected route.')
  if (dropOffIndex < 0) errors.push('Choose a drop-off point from the selected route.')
  if (pickupIndex >= 0 && dropOffIndex >= 0) {
    if (pickupIndex === dropOffIndex) errors.push('Pickup and drop-off points must be different.')
    if (pickupIndex > dropOffIndex) errors.push('Drop-off must come after pickup on this route.')
  }

  if (!Number.isInteger(draft.seats) || draft.seats < 1 || draft.seats > MAX_SEATS_PER_BOOKING) errors.push(`Choose between 1 and ${MAX_SEATS_PER_BOOKING} seats.`)
  if (draft.seats > availableSeats) errors.push(`Only ${availableSeats} seat(s) remain for this departure.`)

  if (userId && draft.date && draft.timeSlot) {
    const conflict = bookings.some((booking) =>
      booking.id !== excludeBookingId &&
      booking.userId === userId &&
      booking.date === draft.date &&
      booking.timeSlot === draft.timeSlot &&
      booking.status !== 'CANCELLED',
    )
    if (conflict) errors.push('You already have an active booking for this departure.')
  }

  return { valid: errors.length === 0, errors }
}
