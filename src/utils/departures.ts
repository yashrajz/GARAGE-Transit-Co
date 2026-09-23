import { Booking, Route, Shuttle } from '../types'
import { SEAT_CAPACITY } from '../data/mockData'
import { addDays, localTodayISO, parseTimeSlotToHour, toISODate } from './dateHelpers'
import { seatsLeft } from './seat'

export interface BookableShuttle {
  shuttleId?: string
  tripId: string
  routeId: string
  routeName: string
  date: string
  timeSlot: string
  pickupPoint: string
  dropOffPoint: string
  totalCapacity: number
  bookedSeats: number
  availableSeats: number
  occupancyPercentage: number
  relevantBookingStatus: Booking['status'] | 'AVAILABLE'
}

export interface TimeSlotAvailability {
  timeSlot: string
  availableSeats: number
  occupancyPercentage: number
  selectable: boolean
  reason?: 'PAST_DATE' | 'PAST_TIME' | 'FULL' | 'INACTIVE'
}

// How far ahead the demo builds its bookable departure list.
const UPCOMING_DEPARTURE_DAYS = 14

export function shuttleTripId(routeId: string, date: string, timeSlot: string): string {
  return `${routeId}:${date}:${timeSlot}`
}

export function departureDateTime(date: string, timeSlot: string): Date {
  const [hours, minutes] = timeSlot.split(':').map(Number)
  const departure = new Date(`${date}T00:00:00`)
  departure.setHours(hours, minutes, 0, 0)
  return departure
}

export function isDepartureTimeAvailable(selectedDate: string, departureTime: string, now = new Date()): boolean {
  return departureDateTime(selectedDate, departureTime).getTime() > now.getTime()
}

export function getTimeSlotAvailability(
  route: Route,
  bookings: Booking[],
  selectedDate: string,
  now = new Date(),
  excludeBookingId?: string,
): TimeSlotAvailability[] {
  const today = localTodayISO()
  return route.schedule.map((timeSlot) => {
    const availableSeats = seatsLeft(bookings, route.id, selectedDate, timeSlot, excludeBookingId)
    const isPastDate = selectedDate < today
    const past = isPastDate || !isDepartureTimeAvailable(selectedDate, timeSlot, now)
    const full = availableSeats <= 0
    const reason = !route.active ? 'INACTIVE' : isPastDate ? 'PAST_DATE' : past ? 'PAST_TIME' : full ? 'FULL' : undefined
    return {
      timeSlot,
      availableSeats,
      occupancyPercentage: Math.max(0, Math.min(100, Math.round(((SEAT_CAPACITY - availableSeats) / SEAT_CAPACITY) * 100))),
      selectable: !reason,
      reason,
    }
  })
}

function isShuttleBookable(shuttle: BookableShuttle, now = new Date()): boolean {
  return departureDateTime(shuttle.date, shuttle.timeSlot).getTime() > now.getTime() && shuttle.availableSeats > 0
}

export function getUpcomingBookableShuttles(
  routes: Route[],
  bookings: Booking[],
  fleet: Shuttle[] = [],
  now = new Date(),
  daysAhead = UPCOMING_DEPARTURE_DAYS,
): BookableShuttle[] {
  const startDate = new Date(now)
  startDate.setHours(0, 0, 0, 0)
  const departures: BookableShuttle[] = []

  for (let offset = 0; offset <= daysAhead; offset += 1) {
    const date = toISODate(addDays(startDate, offset))
    for (const route of routes) {
      if (!route.active) continue
      const orderedSlots = [...route.schedule].sort((a, b) => parseTimeSlotToHour(a) - parseTimeSlotToHour(b))
      for (const timeSlot of orderedSlots) {
        const pickupPoint = route.stops[0]
        const dropOffPoint = route.stops[route.stops.length - 1]
        const availableSeats = seatsLeft(bookings, route.id, date, timeSlot)
        const bookedSeats = Math.max(0, SEAT_CAPACITY - availableSeats)
        const matchingBookings = bookings.filter((booking) =>
          booking.routeId === route.id && booking.date === date && booking.timeSlot === timeSlot && booking.status !== 'CANCELLED',
        )
        const relevantBookingStatus = matchingBookings.length > 0
          ? matchingBookings.some((booking) => booking.status === 'CONFIRMED') ? 'CONFIRMED' : matchingBookings[0].status
          : 'AVAILABLE'
        const shuttle: BookableShuttle = {
          shuttleId: fleet.find((candidate) => candidate.routeId === route.id)?.id,
          tripId: shuttleTripId(route.id, date, timeSlot),
          routeId: route.id,
          routeName: route.name,
          date,
          timeSlot,
          pickupPoint,
          dropOffPoint,
          totalCapacity: SEAT_CAPACITY,
          bookedSeats,
          availableSeats,
          occupancyPercentage: Math.max(0, Math.min(100, Math.round((bookedSeats / SEAT_CAPACITY) * 100))),
          relevantBookingStatus,
        }
        if (isShuttleBookable(shuttle, now)) departures.push(shuttle)
      }
    }
  }

  return departures.sort((a, b) => departureDateTime(a.date, a.timeSlot).getTime() - departureDateTime(b.date, b.timeSlot).getTime())
}

