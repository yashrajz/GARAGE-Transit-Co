import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import { Booking, Driver, Route, ScheduleBlock, Shuttle, Trip } from '../types'
import { loadMockAppData, saveMockAppData, STORAGE_KEY } from '../services/mockRepository'
import { useRole } from './RoleContext'

interface AppState {
  routes: Route[]
  drivers: Driver[]
  shuttles: Shuttle[]
  bookings: Booking[]
  trips: Trip[]
}

type Action =
  | { type: 'HYDRATE'; payload: AppState }
  | { type: 'ADD_BOOKING'; payload: Booking }
  | { type: 'EDIT_BOOKING'; payload: Booking }
  | { type: 'CANCEL_BOOKING'; payload: { id: string; userId: string } }
  | { type: 'SET_BOOKING_STATUS'; payload: { id: string; status: Booking['status']; actorUserId?: string } }
  | { type: 'ADD_ROUTE'; payload: Route }
  | { type: 'ADD_SHUTTLE'; payload: Shuttle }
  | { type: 'EDIT_ROUTE'; payload: Route }
  | { type: 'SET_SHUTTLE_ROUTE'; payload: { shuttleId: string; routeId?: string } }
  | { type: 'SET_ROUTE_ACTIVE'; payload: { id: string; active: boolean } }
  | { type: 'SET_SHUTTLE_DRIVER'; payload: { shuttleId: string; driverId?: string } }
  | { type: 'SET_DRIVER_BLOCKS'; payload: { driverId: string; date: string; blocks: ScheduleBlock[] } }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload
    case 'ADD_BOOKING':
      return { ...state, bookings: [action.payload, ...state.bookings] }
    case 'EDIT_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map((b) => (b.id === action.payload.id ? action.payload : b)),
      }
    case 'CANCEL_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === action.payload.id && b.userId === action.payload.userId && b.status !== 'CANCELLED' && b.status !== 'COMPLETED'
            ? { ...b, status: 'CANCELLED' }
            : b,
        ),
      }
    case 'SET_BOOKING_STATUS':
      return {
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === action.payload.id && validStatusTransition(b.status, action.payload.status) ? { ...b, status: action.payload.status } : b,
        ),
      }
    case 'ADD_ROUTE':
      return { ...state, routes: [...state.routes, action.payload] }
    case 'ADD_SHUTTLE':
      return { ...state, shuttles: [...state.shuttles, action.payload] }
    case 'EDIT_ROUTE':
      return {
        ...state,
        routes: state.routes.map((route) => (route.id === action.payload.id ? action.payload : route)),
      }
    case 'SET_SHUTTLE_ROUTE':
      return {
        ...state,
        shuttles: state.shuttles.map((shuttle) => shuttle.id === action.payload.shuttleId ? { ...shuttle, routeId: action.payload.routeId ?? '' } : shuttle),
      }
    case 'SET_ROUTE_ACTIVE':
      return {
        ...state,
        routes: state.routes.map((route) =>
          route.id === action.payload.id ? { ...route, active: action.payload.active } : route,
        ),
      }
    case 'SET_SHUTTLE_DRIVER':
      return {
        ...state,
        shuttles: state.shuttles.map((shuttle) => shuttle.id === action.payload.shuttleId ? { ...shuttle, driverId: action.payload.driverId } : shuttle),
      }
    case 'SET_DRIVER_BLOCKS':
      return {
        ...state,
        drivers: state.drivers.map((d) =>
          d.id === action.payload.driverId
            ? { ...d, schedules: { ...d.schedules, [action.payload.date]: action.payload.blocks } }
            : d,
        ),
      }
    default:
      return state
  }
}

/** Lifecycle rules live beside the reducer so every UI invokes the same policy. */
export function validStatusTransition(from: Booking['status'], to: Booking['status']): boolean {
  if (from === to) return true
  if (from === 'PENDING') return to === 'CONFIRMED' || to === 'CANCELLED'
  if (from === 'CONFIRMED') return to === 'COMPLETED' || to === 'CANCELLED'
  return false
}

interface AppContextValue extends AppState {
  dispatch: React.Dispatch<Action>
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { role, currentUser } = useRole()
  const initialData = useMemo(() => loadMockAppData(), [])
  const [state, reduce] = useReducer(reducer, {
    ...initialData,
  })

  useEffect(() => {
    saveMockAppData(state)
  }, [state])

  useEffect(() => {
    function handleStorageChange(event: StorageEvent) {
      if (event.key === STORAGE_KEY || event.key === null) {
        reduce({ type: 'HYDRATE', payload: loadMockAppData() })
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const dispatch = useCallback<React.Dispatch<Action>>((action) => {
    const studentAllowed = action.type === 'ADD_BOOKING' || action.type === 'CANCEL_BOOKING'
    const adminOnly = action.type !== 'ADD_BOOKING' && action.type !== 'CANCEL_BOOKING'
    if ((role === 'USER' && !studentAllowed) || (role === 'ADMIN' && action.type === 'ADD_BOOKING')) return
    if (!role) return
    if (action.type === 'ADD_BOOKING') {
      reduce({ ...action, payload: { ...action.payload, userId: currentUser.id, userName: currentUser.name } })
      return
    }
    if (action.type === 'CANCEL_BOOKING') {
      reduce({ ...action, payload: { ...action.payload, userId: currentUser.id } })
      return
    }
    if (adminOnly) reduce(action)
  }, [currentUser.id, currentUser.name, role])

  const value = useMemo(() => ({ ...state, dispatch }), [state, dispatch])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
