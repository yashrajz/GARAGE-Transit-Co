import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useApp } from './AppContext'
import { BookableShuttle, getUpcomingBookableShuttles } from '../utils/departures'
import { DEPARTURE_REFRESH_MS } from '../utils/dateHelpers'

interface ShuttleSelectionValue {
  shuttles: BookableShuttle[]
  selectedIndex: number
  selectedShuttle?: BookableShuttle
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>
}

const ShuttleSelectionContext = createContext<ShuttleSelectionValue | undefined>(undefined)

export function ShuttleSelectionProvider({ children }: { children: React.ReactNode }) {
  const { routes, bookings, shuttles: fleet } = useApp()
  const [now, setNow] = useState(() => new Date())
  const [selectedIndex, setSelectedIndex] = useState(0)
  const shuttles = useMemo(() => getUpcomingBookableShuttles(routes, bookings, fleet, now), [routes, bookings, fleet, now])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), DEPARTURE_REFRESH_MS)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    setSelectedIndex((index) => Math.min(index, Math.max(0, shuttles.length - 1)))
  }, [shuttles.length])

  const value = useMemo(() => ({ shuttles, selectedIndex, selectedShuttle: shuttles[selectedIndex], setSelectedIndex }), [shuttles, selectedIndex])
  return <ShuttleSelectionContext.Provider value={value}>{children}</ShuttleSelectionContext.Provider>
}

export function useShuttleSelection(): ShuttleSelectionValue {
  const context = useContext(ShuttleSelectionContext)
  if (!context) throw new Error('useShuttleSelection must be used within ShuttleSelectionProvider')
  return context
}
