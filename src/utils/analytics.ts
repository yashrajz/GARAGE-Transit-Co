import { Booking, Driver, Route, Shuttle, Trip } from '../types'
import { SEAT_CAPACITY } from '../data/mockData'

export interface UsageSummary {
  totalBookings: number
  confirmedBookings: number
  completedTrips: number
  cancelledBookings: number
  seatsBooked: number
  seatUtilization: number
  averageSeatsPerBooking: number
  routeDemand: Array<{ routeId: string; routeName: string; bookings: number; seats: number }>
  peakSlot: { timeSlot: string; bookings: number } | null
  peakSlots: Array<{ timeSlot: string; bookings: number }>
  mostUsedRoute: { routeId: string; routeName: string; bookings: number } | null
  tripsWithoutDrivers: number
  averageOccupancy: number
  driverUtilization: Array<{ driverId: string; driverName: string; assigned: number; dutyHours: number; utilization: number }>
}

export function buildUsageSummary(bookings: Booking[], routes: Route[], drivers: Driver[], date: string, trips: Trip[] = [], shuttles: Shuttle[] = []): UsageSummary {
  const scopedBookings = bookings.filter((booking) => !date || booking.date === date)
  const activeBookings = scopedBookings.filter((booking) => booking.status !== 'CANCELLED')
  const routeMap = new Map(routes.map((route) => [route.id, { routeId: route.id, routeName: route.name, bookings: 0, seats: 0 }]))
  const slotMap = new Map<string, number>()
  const assignedByDriver = new Map<string, number>()

  for (const booking of activeBookings) {
    const route = routeMap.get(booking.routeId)
    if (route) {
      route.bookings += 1
      route.seats += booking.seats
    }
    slotMap.set(booking.timeSlot, (slotMap.get(booking.timeSlot) ?? 0) + 1)
    const driverId = shuttles.find((shuttle) => shuttle.id === booking.shuttleId)?.driverId
    if (driverId) assignedByDriver.set(driverId, (assignedByDriver.get(driverId) ?? 0) + 1)
  }

  const peakSlots = [...slotMap.entries()].map(([timeSlot, count]) => ({ timeSlot, bookings: count })).sort((a, b) => b.bookings - a.bookings)
  const peakEntry = peakSlots[0]
  const capacitySlots = new Set(activeBookings.map((booking) => `${booking.routeId}:${booking.date}:${booking.timeSlot}`)).size
  const seatsBooked = activeBookings.reduce((total, booking) => total + booking.seats, 0)
  const driverUtilization = drivers.map((driver) => {
    const dutyHours = (driver.schedules[date] ?? [])
      .filter((block) => block.type === 'DUTY')
      .reduce((total, block) => total + block.endHour - block.startHour, 0)
    const assigned = assignedByDriver.get(driver.id) ?? 0
    const utilization = dutyHours > 0 ? Math.min(100, Math.round((assigned / dutyHours) * 100)) : 0
    return { driverId: driver.id, driverName: driver.name, assigned, dutyHours, utilization }
  }).sort((a, b) => b.utilization - a.utilization)

  const rankedRoutes = [...routeMap.values()].sort((a, b) => b.bookings - a.bookings)
  const topRoute = rankedRoutes[0]
  const mostUsedRoute = topRoute && topRoute.bookings > 0 ? { routeId: topRoute.routeId, routeName: topRoute.routeName, bookings: topRoute.bookings } : null

  return {
    totalBookings: scopedBookings.length,
    confirmedBookings: scopedBookings.filter((booking) => booking.status === 'CONFIRMED').length,
    completedTrips: trips.filter((trip) => (!date || trip.date === date) && trip.status === 'COMPLETED').length,
    cancelledBookings: scopedBookings.filter((booking) => booking.status === 'CANCELLED').length,
    seatsBooked,
    seatUtilization: capacitySlots > 0 ? Math.round((seatsBooked / (capacitySlots * SEAT_CAPACITY)) * 100) : 0,
    averageSeatsPerBooking: activeBookings.length > 0 ? Number((seatsBooked / activeBookings.length).toFixed(1)) : 0,
    routeDemand: rankedRoutes.filter((route) => route.bookings > 0),
    peakSlot: peakEntry ?? null,
    peakSlots,
    mostUsedRoute,
    tripsWithoutDrivers: activeBookings.filter((booking) => !shuttles.find((shuttle) => shuttle.id === booking.shuttleId)?.driverId).length,
    averageOccupancy: capacitySlots > 0 ? Math.round((seatsBooked / (capacitySlots * SEAT_CAPACITY)) * 100) : 0,
    driverUtilization,
  }
}

