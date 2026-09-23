// Mock data layer. In a real system this would come from an API; here it is
// generated once at module load so the demo has believable, date-relative content.

import { AppUser, Booking, Driver, Route, ScheduleBlock, Shuttle, Trip } from '../types'
import { isoDaysFromToday } from '../utils/dateHelpers'

export const DEMO_USERS: AppUser[] = [
  { id: 'u-001', name: 'Yash Raj', role: 'USER' },
  { id: 'u-002', name: 'Khushi KT', role: 'USER' },
  { id: 'admin-001', name: 'Garage Admin', role: 'ADMIN' },
]

const CURRENT_USER = DEMO_USERS[0]

export const SEAT_CAPACITY = 24

export const shuttles: Shuttle[] = [
  { id: 'SH-101', vehicleNumber: 'PB-10-AA-1234', routeId: 'rt-1', capacity: SEAT_CAPACITY, driverId: 'dr-1' },
  { id: 'SH-102', vehicleNumber: 'PB-10-AB-5678', routeId: 'rt-2', capacity: SEAT_CAPACITY, driverId: 'dr-2' },
  { id: 'SH-103', vehicleNumber: 'PB-10-AC-4321', routeId: 'rt-3', capacity: SEAT_CAPACITY, driverId: 'dr-3' },
  { id: 'SH-104', vehicleNumber: 'PB-10-AD-8765', routeId: 'rt-4', capacity: SEAT_CAPACITY, driverId: 'dr-4' },
  { id: 'SH-105', vehicleNumber: 'PB-10-AE-1122', routeId: 'rt-5', capacity: SEAT_CAPACITY, driverId: 'dr-5' },
]

export const routes: Route[] = [
  {
    id: 'rt-1',
    name: 'LPU Loop A',
    source: 'LPU Main Gate',
    destination: 'LPU Block 34',
    stops: ['LPU Main Gate', 'LPU Hostel 12', 'LPU Academic Block 13', 'LPU Block 34'],
    fare: 20,
    schedule: ['07:30', '09:00', '11:00', '13:00', '16:30', '18:00'],
    active: true,
  },
  {
    id: 'rt-2',
    name: 'LPU Loop B',
    source: 'LPU North Gate',
    destination: 'LPU Sports Complex',
    stops: ['LPU North Gate', 'LPU Library', 'LPU Cafeteria', 'LPU Sports Complex'],
    fare: 15,
    schedule: ['08:00', '10:00', '12:30', '15:00', '17:30'],
    active: true,
  },
  {
    id: 'rt-3',
    name: 'LPU Hostel Express',
    source: 'LPU Hostel Zone',
    destination: 'LPU Academic Zone',
    stops: ['LPU Hostel 7', 'LPU Hostel 9', 'LPU Hostel 12', 'LPU Academic Block 2', 'LPU Academic Block 13'],
    fare: 10,
    schedule: ['07:00', '07:45', '08:30', '17:00', '17:45'],
    active: true,
  },
  {
    id: 'rt-4',
    name: 'LPU City Connector',
    source: 'LPU Main Gate',
    destination: 'City Railway Station',
    stops: ['LPU Main Gate', 'LPU Tech Park', 'City Railway Station'],
    fare: 40,
    schedule: ['06:30', '14:00', '19:30', '21:00'],
    active: true,
  },
  {
    id: 'rt-5',
    name: 'LPU Faculty Shuttle',
    source: 'LPU Faculty Housing',
    destination: 'LPU Admin Block',
    stops: ['LPU Faculty Housing', 'LPU Guest House', 'LPU Admin Block'],
    fare: 12,
    schedule: ['08:15', '13:15', '18:15'],
    active: true,
  },
]

function blocks(...items: Array<[ScheduleBlock['type'], number, number]>): ScheduleBlock[] {
  return items.map(([type, startHour, endHour], i) => ({
    id: `b-${type}-${startHour}-${i}`,
    type,
    startHour,
    endHour,
  }))
}

const driverSeed: Array<Omit<Driver, 'schedules'> & { pattern: ScheduleBlock[] }> = [
  {
    id: 'dr-1', name: 'Ramesh Kumar', phone: '+91 98100 11111', vehicleNumber: 'PB-10-AA-1234',
    pattern: blocks(['DUTY', 6, 14], ['BREAK', 10, 10.5]),
  },
  {
    id: 'dr-2', name: 'Suresh Yadav', phone: '+91 98100 22222', vehicleNumber: 'PB-10-AB-5678',
    pattern: blocks(['DUTY', 8, 20], ['BREAK', 12, 13], ['BREAK', 17, 17.5]),
  },
  {
    id: 'dr-3', name: 'Priya Singh', phone: '+91 98100 33333', vehicleNumber: 'PB-10-AC-4321',
    pattern: blocks(['DUTY', 7, 15], ['BREAK', 11, 11.5]),
  },
  {
    id: 'dr-4', name: 'Manjeet Kaur', phone: '+91 98100 44444', vehicleNumber: 'PB-10-AD-8765',
    pattern: blocks(['DUTY', 14, 22], ['BREAK', 18, 18.5]),
  },
  {
    id: 'dr-5', name: 'Vikram Rathore', phone: '+91 98100 55555', vehicleNumber: 'PB-10-AE-1122',
    pattern: blocks(['DUTY', 6, 13]),
  },
  {
    id: 'dr-6', name: 'Anita Desai', phone: '+91 98100 66666', vehicleNumber: 'PB-10-AF-3344',
    pattern: blocks(['DUTY', 9, 17], ['BREAK', 13, 13.5]),
  },
  {
    id: 'dr-7', name: 'Karan Mehta', phone: '+91 98100 77777', vehicleNumber: 'PB-10-AG-5566',
    pattern: [],
  },
]

// Build 7 days (today +/- a few) of schedules for each driver from their pattern.
export const drivers: Driver[] = driverSeed.map(({ pattern, ...d }) => {
  const schedules: Record<string, ScheduleBlock[]> = {}
  for (let offset = -2; offset <= 4; offset++) {
    const date = isoDaysFromToday(offset)
    // Skip a day off roughly once a week per driver for realism.
    const dayOfMonth = new Date(date + 'T00:00:00').getDate()
    const isOff = pattern.length === 0 || (dayOfMonth + Number(d.id.slice(-1))) % 7 === 0
    schedules[date] = isOff ? [] : pattern.map((b) => ({ ...b, id: `${b.id}-${date}` }))
  }
  return { ...d, schedules }
})


function fareFor(routeId: string): number {
  return routes.find((r) => r.id === routeId)?.fare ?? 0
}

function routeName(routeId: string): string {
  return routes.find((r) => r.id === routeId)?.name ?? 'Unknown route'
}

export const bookings: Booking[] = [
  { id: 'BKG-1001', userId: CURRENT_USER.id, userName: CURRENT_USER.name, routeId: 'rt-1', routeName: routeName('rt-1'), date: isoDaysFromToday(1), timeSlot: '09:00', boardingPoint: 'LPU Hostel 12', dropOffPoint: 'LPU Block 34', seats: 2, fare: fareFor('rt-1') * 2, status: 'CONFIRMED', shuttleId: 'SH-101' },
  { id: 'BKG-1002', userId: CURRENT_USER.id, userName: CURRENT_USER.name, routeId: 'rt-2', routeName: routeName('rt-2'), date: isoDaysFromToday(2), timeSlot: '15:00', boardingPoint: 'LPU Library', dropOffPoint: 'LPU Sports Complex', seats: 1, fare: fareFor('rt-2'), status: 'CONFIRMED', shuttleId: 'SH-102' },
  { id: 'BKG-1003', userId: CURRENT_USER.id, userName: CURRENT_USER.name, routeId: 'rt-3', routeName: routeName('rt-3'), date: isoDaysFromToday(3), timeSlot: '07:45', boardingPoint: 'LPU Hostel 9', dropOffPoint: 'LPU Academic Block 2', seats: 1, fare: fareFor('rt-3'), status: 'PENDING' },
  { id: 'BKG-1004', userId: 'u-002', userName: 'Khushi KT', routeId: 'rt-1', routeName: routeName('rt-1'), date: isoDaysFromToday(0), timeSlot: '13:00', boardingPoint: 'LPU Main Gate', dropOffPoint: 'LPU Block 34', seats: 3, fare: fareFor('rt-1') * 3, status: 'CONFIRMED', shuttleId: 'SH-101' },
  { id: 'BKG-1005', userId: 'u-003', userName: 'Simran Kaur', routeId: 'rt-4', routeName: routeName('rt-4'), date: isoDaysFromToday(0), timeSlot: '19:30', boardingPoint: 'LPU Tech Park', dropOffPoint: 'City Railway Station', seats: 2, fare: fareFor('rt-4') * 2, status: 'CONFIRMED', shuttleId: 'SH-104' },
  { id: 'BKG-1006', userId: 'u-004', userName: 'Arjun Nair', routeId: 'rt-5', routeName: routeName('rt-5'), date: isoDaysFromToday(1), timeSlot: '08:15', boardingPoint: 'LPU Guest House', dropOffPoint: 'LPU Admin Block', seats: 1, fare: fareFor('rt-5'), status: 'PENDING' },
  { id: 'BKG-1007', userId: 'u-005', userName: 'Neha Verma', routeId: 'rt-2', routeName: routeName('rt-2'), date: isoDaysFromToday(-1), timeSlot: '12:30', boardingPoint: 'LPU Cafeteria', dropOffPoint: 'LPU Sports Complex', seats: 4, fare: fareFor('rt-2') * 4, status: 'COMPLETED', shuttleId: 'SH-102' },
  { id: 'BKG-1008', userId: 'u-006', userName: 'Kabir Malhotra', routeId: 'rt-1', routeName: routeName('rt-1'), date: isoDaysFromToday(-1), timeSlot: '18:00', boardingPoint: 'LPU Block 34', dropOffPoint: 'LPU Main Gate', seats: 1, fare: fareFor('rt-1'), status: 'CANCELLED' },
  { id: 'BKG-1009', userId: 'u-007', userName: 'Ishita Rao', routeId: 'rt-3', routeName: routeName('rt-3'), date: isoDaysFromToday(2), timeSlot: '17:00', boardingPoint: 'LPU Academic Block 2', dropOffPoint: 'LPU Hostel 12', seats: 2, fare: fareFor('rt-3') * 2, status: 'CONFIRMED', shuttleId: 'SH-103' },
  { id: 'BKG-1010', userId: 'u-008', userName: 'Yash Patel', routeId: 'rt-4', routeName: routeName('rt-4'), date: isoDaysFromToday(3), timeSlot: '06:30', boardingPoint: 'LPU Main Gate', dropOffPoint: 'City Railway Station', seats: 1, fare: fareFor('rt-4'), status: 'CONFIRMED', shuttleId: 'SH-104' },
  { id: 'BKG-1011', userId: CURRENT_USER.id, userName: CURRENT_USER.name, routeId: 'rt-5', routeName: routeName('rt-5'), date: isoDaysFromToday(-2), timeSlot: '13:15', boardingPoint: 'LPU Faculty Housing', dropOffPoint: 'LPU Admin Block', seats: 1, fare: fareFor('rt-5'), status: 'COMPLETED', shuttleId: 'SH-105' },
  { id: 'BKG-1012', userId: 'u-009', userName: 'Divya Iyer', routeId: 'rt-2', routeName: routeName('rt-2'), date: isoDaysFromToday(0), timeSlot: '10:00', boardingPoint: 'LPU North Gate', dropOffPoint: 'LPU Sports Complex', seats: 2, fare: fareFor('rt-2') * 2, status: 'PENDING' },
  { id: 'BKG-1013', userId: 'u-002', userName: 'Khushi KT', routeId: 'rt-1', routeName: routeName('rt-1'), date: isoDaysFromToday(1), timeSlot: '16:30', boardingPoint: 'LPU Main Gate', dropOffPoint: 'LPU Block 34', seats: 1, fare: fareFor('rt-1'), status: 'CONFIRMED', shuttleId: 'SH-101' },
]

function driverInfo(driverId: string) {
  const d = drivers.find((x) => x.id === driverId)!
  return { name: d.name, phone: d.phone, vehicleNumber: d.vehicleNumber }
}

export const trips: Trip[] = [
  { id: 'TRP-9001', bookingId: 'BKG-1001', userId: CURRENT_USER.id, routeId: 'rt-1', routeName: routeName('rt-1'), date: isoDaysFromToday(-3), time: '09:00', boardingPoint: 'LPU Hostel 12', dropOffPoint: 'LPU Block 34', seats: 1, fare: fareFor('rt-1'), status: 'COMPLETED', shuttleId: 'SH-101', driver: driverInfo('dr-1') },
  { id: 'TRP-9002', bookingId: 'BKG-1002', userId: CURRENT_USER.id, routeId: 'rt-2', routeName: routeName('rt-2'), date: isoDaysFromToday(-4), time: '15:00', boardingPoint: 'LPU Library', dropOffPoint: 'LPU Sports Complex', seats: 2, fare: fareFor('rt-2') * 2, status: 'COMPLETED', shuttleId: 'SH-102', driver: driverInfo('dr-2') },
  { id: 'TRP-9003', userId: CURRENT_USER.id, routeId: 'rt-3', routeName: routeName('rt-3'), date: isoDaysFromToday(-5), time: '07:45', boardingPoint: 'LPU Hostel 9', dropOffPoint: 'LPU Academic Block 2', seats: 1, fare: fareFor('rt-3'), status: 'MISSED', shuttleId: 'SH-103', driver: driverInfo('dr-3') },
  { id: 'TRP-9004', userId: CURRENT_USER.id, routeId: 'rt-1', routeName: routeName('rt-1'), date: isoDaysFromToday(-6), time: '18:00', boardingPoint: 'LPU Block 34', dropOffPoint: 'LPU Main Gate', seats: 3, fare: fareFor('rt-1') * 3, status: 'COMPLETED', shuttleId: 'SH-104', driver: driverInfo('dr-4') },
  { id: 'TRP-9005', userId: CURRENT_USER.id, routeId: 'rt-5', routeName: routeName('rt-5'), date: isoDaysFromToday(-7), time: '13:15', boardingPoint: 'LPU Faculty Housing', dropOffPoint: 'LPU Admin Block', seats: 1, fare: fareFor('rt-5'), status: 'COMPLETED', shuttleId: 'SH-105', driver: driverInfo('dr-5') },
  { id: 'TRP-9006', userId: CURRENT_USER.id, routeId: 'rt-4', routeName: routeName('rt-4'), date: isoDaysFromToday(-8), time: '19:30', boardingPoint: 'LPU Tech Park', dropOffPoint: 'City Railway Station', seats: 2, fare: fareFor('rt-4') * 2, status: 'CANCELLED', shuttleId: 'SH-106', driver: driverInfo('dr-6') },
  { id: 'TRP-9007', userId: CURRENT_USER.id, routeId: 'rt-2', routeName: routeName('rt-2'), date: isoDaysFromToday(-9), time: '12:30', boardingPoint: 'LPU Cafeteria', dropOffPoint: 'LPU Sports Complex', seats: 1, fare: fareFor('rt-2'), status: 'COMPLETED', shuttleId: 'SH-102', driver: driverInfo('dr-2') },
  { id: 'TRP-9008', userId: CURRENT_USER.id, routeId: 'rt-3', routeName: routeName('rt-3'), date: isoDaysFromToday(-10), time: '08:30', boardingPoint: 'LPU Hostel 12', dropOffPoint: 'LPU Academic Block 13', seats: 1, fare: fareFor('rt-3'), status: 'COMPLETED', shuttleId: 'SH-103', driver: driverInfo('dr-1') },
  { id: 'TRP-9009', userId: CURRENT_USER.id, routeId: 'rt-1', routeName: routeName('rt-1'), date: isoDaysFromToday(-11), time: '11:00', boardingPoint: 'LPU Main Gate', dropOffPoint: 'LPU Block 34', seats: 2, fare: fareFor('rt-1') * 2, status: 'COMPLETED', shuttleId: 'SH-101', driver: driverInfo('dr-3') },
  { id: 'TRP-9010', bookingId: 'BKG-1004', userId: 'u-002', routeId: 'rt-1', routeName: routeName('rt-1'), date: isoDaysFromToday(-4), time: '13:00', boardingPoint: 'LPU Main Gate', dropOffPoint: 'LPU Block 34', seats: 1, fare: fareFor('rt-1'), status: 'COMPLETED', shuttleId: 'SH-103', driver: driverInfo('dr-3') },
]

