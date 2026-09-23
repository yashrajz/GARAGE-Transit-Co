import { bookings, drivers, routes, shuttles, trips } from '../data/mockData'
import { Booking, Driver, Route, Shuttle, Trip } from '../types'

export interface MockAppData {
  routes: Route[]
  drivers: Driver[]
  shuttles: Shuttle[]
  bookings: Booking[]
  trips: Trip[]
}

export const STORAGE_KEY = 'shuttle-management-app-data'

function cloneSeedData(): MockAppData {
  return {
    routes: routes.map((route) => ({ ...route, stops: [...route.stops], schedule: [...route.schedule] })),
    drivers: drivers.map((driver) => ({
      ...driver,
      schedules: Object.fromEntries(Object.entries(driver.schedules).map(([date, blocks]) => [date, blocks.map((block) => ({ ...block }))])),
    })),
    shuttles: shuttles.map((shuttle) => ({ ...shuttle })),
    bookings: bookings.map((booking) => ({ ...booking })),
    trips: trips.map((trip) => ({ ...trip, driver: { ...trip.driver } })),
  }
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  return Array.from(new Map(items.map((item) => [item.id, item])).values())
}

function normalizeAppData(data: MockAppData): MockAppData {
  const labels: Record<string, string> = {
    'Campus Loop A': 'LPU Loop A',
    'Campus Loop B': 'LPU Loop B',
    'Hostel Express': 'LPU Hostel Express',
    'City Connector': 'LPU City Connector',
    'Faculty Shuttle': 'LPU Faculty Shuttle',
    'Main Gate': 'LPU Main Gate',
    'North Gate': 'LPU North Gate',
    'Hostel Zone': 'LPU Hostel Zone',
    'Academic Zone': 'LPU Academic Zone',
    'Hostel 7': 'LPU Hostel 7',
    'Hostel 9': 'LPU Hostel 9',
    'Hostel 12': 'LPU Hostel 12',
    'Academic Block 2': 'LPU Academic Block 2',
    'Academic Block 13': 'LPU Academic Block 13',
    'Block 34': 'LPU Block 34',
    Library: 'LPU Library',
    Cafeteria: 'LPU Cafeteria',
    'Sports Complex': 'LPU Sports Complex',
    'Tech Park': 'LPU Tech Park',
    'Faculty Housing': 'LPU Faculty Housing',
    'Guest House': 'LPU Guest House',
    'Admin Block': 'LPU Admin Block',
  }
  const label = (value: string) => labels[value] ?? value

  const migratedRoutes = data.routes.map((route) => ({
    ...route,
    name: label(route.name),
    source: label(route.source),
    destination: label(route.destination),
    stops: route.stops.map(label),
  }))

  return {
    ...data,
    routes: uniqueById(migratedRoutes),
    drivers: uniqueById(data.drivers),
    shuttles: uniqueById(data.shuttles),
    bookings: uniqueById(data.bookings.map((booking) => ({
      ...booking,
      routeName: label(booking.routeName),
      boardingPoint: label(booking.boardingPoint),
      dropOffPoint: label(booking.dropOffPoint),
    }))),
    trips: uniqueById(data.trips.map((trip) => ({
      ...trip,
      routeName: label(trip.routeName),
      boardingPoint: label(trip.boardingPoint),
      dropOffPoint: label(trip.dropOffPoint),
    }))),
  }
}

// Read boundary for the demo. A REST-backed version can use the same shape
// without changing page components.
export function loadMockAppData(): MockAppData {
  const seedData = cloneSeedData()

  try {
    const storedData = window.localStorage.getItem(STORAGE_KEY)
    if (!storedData) return seedData

    const parsedData = JSON.parse(storedData) as MockAppData
    if (!parsedData.routes || !parsedData.drivers || !parsedData.shuttles || !parsedData.bookings || !parsedData.trips) return seedData
    return normalizeAppData(parsedData)
  } catch {
    return seedData
  }
}

export function saveMockAppData(data: MockAppData): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Storage can be unavailable in private browsing or restricted environments.
  }
}
