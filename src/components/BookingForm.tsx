import React, { useEffect, useMemo, useState } from 'react'
import { MapPin, Minus, Plus } from 'lucide-react'
import { Route } from '../types'
import { useApp } from '../context/AppContext'
import { SEAT_CAPACITY } from '../data/mockData'
import { validateBooking, MAX_SEATS_PER_BOOKING } from '../utils/bookingValidation'
import { getTimeSlotAvailability, shuttleTripId } from '../utils/departures'
import { DEPARTURE_REFRESH_MS, localTodayISO } from '../utils/dateHelpers'

export interface BookingFormValues {
  routeId: string
  tripId?: string
  date: string
  timeSlot: string
  boardingPoint: string
  dropOffPoint: string
  seats: number
}

interface BookingFormProps {
  initial?: BookingFormValues
  excludeBookingId?: string
  userId?: string
  onSubmit: (values: BookingFormValues, route: Route) => void
  submitLabel?: string
}

export default function BookingForm({ initial, excludeBookingId, userId, onSubmit, submitLabel = 'Confirm booking' }: BookingFormProps) {
  const { routes, bookings, shuttles, drivers } = useApp()
  const activeRoutes = routes.filter((candidate) => candidate.active || candidate.id === initial?.routeId)
  const [routeId, setRouteId] = useState(initial?.routeId ?? activeRoutes[0]?.id ?? '')
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10))
  const [timeSlot, setTimeSlot] = useState(initial?.timeSlot ?? activeRoutes[0]?.schedule[0] ?? '')
  const [boardingPoint, setBoardingPoint] = useState(initial?.boardingPoint ?? activeRoutes[0]?.stops[0] ?? '')
  const [dropOffPoint, setDropOffPoint] = useState(initial?.dropOffPoint ?? activeRoutes[0]?.stops[activeRoutes[0].stops.length - 1] ?? '')
  const [seats, setSeats] = useState(initial?.seats ?? 1)
  const [error, setError] = useState('')
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), DEPARTURE_REFRESH_MS)
    return () => window.clearInterval(timer)
  }, [])

  const route = routes.find((r) => r.id === routeId) ?? activeRoutes[0]
  const assignedShuttle = shuttles.find((candidate) => candidate.routeId === route?.id)
  const assignedDriver = drivers.find((candidate) => candidate.id === assignedShuttle?.driverId)

  const slotAvailability = useMemo(
    () => route ? getTimeSlotAvailability(route, bookings, date, now, excludeBookingId) : [],
    [route, bookings, date, now, excludeBookingId],
  )
  const selectedSlot = slotAvailability.find((slot) => slot.timeSlot === timeSlot)
  const available = selectedSlot?.availableSeats ?? 0

  if (!route) return <p className="text-sm text-muted">No active shuttle routes are available.</p>

  function handleRouteChange(id: string) {
    const r = routes.find((rt) => rt.id === id)!
    setRouteId(id)
    setTimeSlot(r.schedule[0])
    setBoardingPoint(r.stops[0])
    setDropOffPoint(r.stops[r.stops.length - 1])
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = validateBooking(
      { routeId, date, timeSlot, boardingPoint, dropOffPoint, seats },
      routes,
      bookings,
      available,
      userId,
      excludeBookingId,
    )
    if (!result.valid) {
      setError(result.errors.join(' '))
      return
    }
    setError('')
    onSubmit({ routeId, tripId: shuttleTripId(routeId, date, timeSlot), date, timeSlot, boardingPoint, dropOffPoint, seats }, route)
  }

  const progress = Math.max(0, Math.min(1, available / SEAT_CAPACITY))

  return (
    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
      <div className="bg-white border border-ink/15 rounded-[4px] p-5 space-y-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-muted">Trip details</p>
        <label className="block">
          <span className="label">Route</span>
          <select
            value={routeId}
            onChange={(e) => handleRouteChange(e.target.value)}
            className="field"
          >
            {activeRoutes.map((r) => (
              <option key={r.id} value={r.id} className="bg-surface">
                {r.name} — {r.source} → {r.destination} (₹{r.fare})
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="label">Date</span>
          <input
            type="date"
            value={date}
            min={localTodayISO()}
            onChange={(e) => setDate(e.target.value)}
            className="field"
          />
        </label>

        <label className="block">
          <span className="label">Time slot</span>
          <select
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            className="field"
          >
            {slotAvailability.map((slot) => (
              <option key={slot.timeSlot} value={slot.timeSlot} disabled={!slot.selectable} className="bg-surface">
                {slot.timeSlot}{slot.reason === 'PAST_DATE' || slot.reason === 'PAST_TIME' ? ' — departed' : slot.reason === 'FULL' ? ' — full' : slot.reason === 'INACTIVE' ? ' — unavailable' : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="label">Boarding point</span>
          <select
            value={boardingPoint}
            onChange={(e) => setBoardingPoint(e.target.value)}
            className="field"
          >
            {route.stops.map((stop) => (
              <option key={stop} value={stop} className="bg-surface">
                {stop}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="label">Drop-off point</span>
          <select
            value={dropOffPoint}
            onChange={(e) => setDropOffPoint(e.target.value)}
            className="field"
          >
            {route.stops.map((stop) => (
              <option key={stop} value={stop} className="bg-surface">
                {stop}
              </option>
            ))}
          </select>
        </label>

        <div className="bg-espresso/[0.04] border border-ink/15 rounded-[4px] p-3 text-xs leading-relaxed">
          <p className="font-bold">Assigned driver</p>
          <p className="text-muted mt-1">
            Shuttle: {assignedShuttle ? `${assignedShuttle.id} · ${assignedShuttle.vehicleNumber}` : 'Assigned at booking'}
          </p>
          <p className="text-muted">
            Driver: {assignedDriver ? `${assignedDriver.name} · ${assignedDriver.phone}` : 'Assigned by operations'}
          </p>
        </div>

        <div>
          <span className="label">Seats</span>
          <div className="flex items-center gap-3 bg-sand/60 border border-ink/15 p-1.5 w-fit rounded-[4px]">
            <button
              type="button"
              onClick={() => setSeats((s) => Math.max(1, s - 1))}
              className="bg-white border border-ink/15 p-2 hover:bg-ink hover:text-cream transition-colors rounded-[3px]"
              aria-label="Decrease seats"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center font-display font-black text-lg">{seats}</span>
            <button
              type="button"
              onClick={() => setSeats((s) => Math.min(MAX_SEATS_PER_BOOKING, s + 1))}
              className="bg-white border border-ink/15 p-2 hover:bg-ink hover:text-cream transition-colors rounded-[3px]"
              aria-label="Increase seats"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={seats > available || !route.active}
          className="w-full btn-bus py-3.5 text-sm rounded-[4px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {route.active ? `${submitLabel} · ₹${route.fare * seats}` : 'Route unavailable'}
        </button>
        {date < localTodayISO() && <p className="text-xs text-danger font-semibold" role="alert">Bookings cannot be made for a past date.</p>}
        {selectedSlot?.reason === 'PAST_TIME' && <p className="text-xs text-danger font-semibold" role="alert">This departure has already passed. Please select a later shuttle.</p>}
        {selectedSlot?.reason === 'FULL' && <p className="text-xs text-danger font-semibold" role="alert">This departure is full. Please select another available time.</p>}
        {error && <p className="text-xs text-danger font-semibold" role="alert">{error}</p>}
        {seats > available && (
          <p className="text-xs text-danger font-semibold">Only {available} seat(s) left for this time slot.</p>
        )}
      </div>

      <div className="bg-espresso text-cream rounded-[4px] p-5 space-y-4 relative overflow-hidden">
        <div className="absolute inset-0 grid-blueprint opacity-15" style={{ backgroundImage: 'linear-gradient(rgba(251,248,240,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(251,248,240,0.12) 1px, transparent 1px)' }} />
        <div className="relative flex items-center justify-between">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-frame">Route preview</p>
          <span className="font-mono text-[11px] font-bold bg-cream/10 border border-cream/20 px-2.5 py-1 rounded-[3px]">{available} left</span>
        </div>
        <p className="relative text-xs text-cream/60">{available} of {SEAT_CAPACITY} seats left for {timeSlot}</p>
        <div className="relative h-2 bg-cream/15 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-frame to-bus transition-all duration-500" style={{ width: `${progress * 100}%` }} />
        </div>

        <div className="relative space-y-3 pt-1">
          {route.stops.map((stop, i) => (
            <div key={stop} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <span className={`h-2.5 w-2.5 rounded-full ${stop === boardingPoint ? 'bg-frame' : 'bg-cream/30'}`} />
                {i < route.stops.length - 1 && <span className="w-px h-7 bg-cream/20" />}
              </div>
              <span className={`text-sm ${stop === boardingPoint ? 'text-cream font-bold' : 'text-cream/55'}`}>
                {stop}
              </span>
            </div>
          ))}
        </div>

        <div className="relative flex items-center gap-2 text-xs text-cream/70 pt-3 border-t border-cream/15">
          <MapPin className="h-3.5 w-3.5 text-frame" />
          Fare: ₹{route.fare} per seat · Total ₹{route.fare * seats}
        </div>
      </div>
    </form>
  )
}
