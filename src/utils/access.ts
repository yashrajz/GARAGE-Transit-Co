import { AppUser, Booking, Driver, Shuttle, Trip } from '../types'
import { departureDateTime } from './departures'

// Students only see their own bookings (matched by userId, never by name).
// Admins see everything. Future bookings derive the driver live from
// booking.shuttleId -> shuttle.driverId, while completed Trip records keep a
// snapshot of {name, phone, vehicleNumber} so history never changes.
// A student can cancel their own upcoming booking before it departs.
export function canCancelBooking(user: AppUser, booking: Booking, now = new Date()): boolean {
  return user.role !== 'ADMIN' && booking.userId === user.id && booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED'
    && departureDateTime(booking.date, booking.timeSlot) > now
}

function tripsForUser(trips: Trip[], user: AppUser): Trip[] {
  return user.role === 'ADMIN' ? trips : trips.filter((trip) => trip.userId === user.id)
}

export function getStudentHistory(bookings: Booking[], trips: Trip[], drivers: Driver[], shuttles: Shuttle[], user: AppUser): Trip[] {
  const ownBookings = bookings.filter((booking) => booking.userId === user.id)
  const ownTrips = tripsForUser(trips, user).filter((trip) =>
    trip.status === 'CANCELLED' || departureDateTime(trip.date, trip.time).getTime() <= Date.now(),
  )
  const representedBookingIds = new Set(ownTrips.map((trip) => trip.bookingId).filter(Boolean))
  const bookingHistory = ownBookings
    .filter((booking) => (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') && !representedBookingIds.has(booking.id))
    .map((booking) => {
      const shuttle = shuttles.find((candidate) => candidate.id === booking.shuttleId)
      const driver = drivers.find((candidate) => candidate.id === shuttle?.driverId)
      return {
        id: `history-${booking.id}`,
        bookingId: booking.id,
        userId: booking.userId,
        routeId: booking.routeId,
        routeName: booking.routeName,
        date: booking.date,
        time: booking.timeSlot,
        boardingPoint: booking.boardingPoint,
        dropOffPoint: booking.dropOffPoint,
        seats: booking.seats,
        fare: booking.fare,
        status: booking.status === 'CANCELLED' ? 'CANCELLED' : 'COMPLETED',
        shuttleId: booking.shuttleId,
        driver: driver ? { name: driver.name, phone: driver.phone, vehicleNumber: driver.vehicleNumber } : { name: 'Unassigned', phone: '—', vehicleNumber: booking.shuttleId ?? '—' },
      } satisfies Trip
    })
  return [...ownTrips, ...bookingHistory]
}
