// Core domain types shared across the app.

export type Role = 'USER' | 'ADMIN'

export interface AppUser {
  id: string
  name: string
  role: Role
}

export interface Route {
  id: string
  name: string
  source: string
  destination: string
  stops: string[]
  fare: number
  schedule: string[] // e.g. ['07:30', '09:00', '11:00']
  active: boolean
}

export type ScheduleBlockType = 'DUTY' | 'BREAK' | 'TRIP'

export interface ScheduleBlock {
  id: string
  type: ScheduleBlockType
  startHour: number // 0-23 (supports .5 for half-hour precision)
  endHour: number
  bookingId?: string
  label?: string
  dutyId?: string
  conflict?: boolean
}

export interface Driver {
  id: string
  name: string
  phone: string
  vehicleNumber: string
  // date (YYYY-MM-DD) -> blocks scheduled for that day
  schedules: Record<string, ScheduleBlock[]>
}

/** A driver is assigned to a vehicle, never to an individual passenger booking. */
export interface Shuttle {
  id: string
  vehicleNumber: string
  routeId: string
  capacity: number
  driverId?: string
}

export type BookingStatus = 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED'

export interface Booking {
  id: string
  userId: string
  userName: string
  routeId: string
  tripId?: string
  routeName: string
  date: string // YYYY-MM-DD
  timeSlot: string
  boardingPoint: string
  dropOffPoint: string
  seats: number
  fare: number
  status: BookingStatus
  shuttleId?: string
}

export type TripStatus = 'COMPLETED' | 'MISSED' | 'CANCELLED'

export interface Trip {
  id: string
  bookingId?: string
  userId: string
  routeId: string
  routeName: string
  date: string
  time: string
  boardingPoint: string
  dropOffPoint: string
  seats: number
  fare: number
  status: TripStatus
  shuttleId?: string
  driver: { name: string; phone: string; vehicleNumber: string }
}

export interface ToastMessage {
  id: string
  title: string
  description?: string
  variant: 'success' | 'error' | 'info'
}
