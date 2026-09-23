import { AppUser, Booking, Driver, Shuttle } from '../types'
import { departureDateTime } from './departures'

const activeBookingStatuses = new Set<Booking['status']>(['PENDING', 'CONFIRMED'])

function visibleBookings(bookings: Booking[], user: AppUser): Booking[] {
  return user.role === 'ADMIN' ? bookings : bookings.filter((booking) => booking.userId === user.id)
}

export function upcomingBookings(bookings: Booking[], user: AppUser, now = new Date()): Booking[] {
  return visibleBookings(bookings, user)
    .filter((booking) => activeBookingStatuses.has(booking.status) && departureDateTime(booking.date, booking.timeSlot) > now)
    .sort((a, b) => `${a.date}${a.timeSlot}`.localeCompare(`${b.date}${b.timeSlot}`))
}

export function getUpcomingConfirmedSeats(bookings: Booking[], userId: string, now = new Date()): number {
  return bookings.filter((booking) => booking.userId === userId && booking.status === 'CONFIRMED' && departureDateTime(booking.date, booking.timeSlot) > now)
    .reduce((total, booking) => total + booking.seats, 0)
}

export function driverForBooking(booking: Booking, shuttles: Shuttle[], drivers: Driver[]): Driver | undefined {
  const shuttle = shuttles.find((candidate) => candidate.id === booking.shuttleId)
  return drivers.find((candidate) => candidate.id === shuttle?.driverId)
}
