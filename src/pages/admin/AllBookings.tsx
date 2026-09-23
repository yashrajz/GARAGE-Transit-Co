import React, { useEffect, useMemo, useState } from 'react'
import { Search, Ticket } from 'lucide-react'
import Reveal from '../../components/Reveal'
import Layout from '../../components/Layout'
import EmptyState from '../../components/EmptyState'
import BookingRow from '../../components/BookingRow'
import Modal from '../../components/Modal'
import StatusBadge from '../../components/StatusBadge'
import { useApp, validStatusTransition } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { Booking, BookingStatus } from '../../types'
import { validateDriverAssignment } from '../../utils/assignmentValidation'
import { driverForBooking } from '../../utils/bookingSelectors'

const STATUS_FILTERS: Array<BookingStatus | 'ALL'> = ['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED']

export default function AllBookings() {
  const { bookings, routes, drivers, shuttles, dispatch } = useApp()
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<BookingStatus | 'ALL'>('ALL')
  const [routeFilter, setRouteFilter] = useState('ALL')
  const [shuttleFilter, setShuttleFilter] = useState('ALL')
  const [date, setDate] = useState('')
  const [viewing, setViewing] = useState<Booking | null>(null)
  const [visibleCount, setVisibleCount] = useState(10)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return bookings
      .filter((b) => status === 'ALL' || b.status === status)
      .filter((b) => routeFilter === 'ALL' || b.routeId === routeFilter)
      .filter((b) => shuttleFilter === 'ALL' || (b.shuttleId ?? '') === shuttleFilter)
      .filter((b) => !date || b.date === date)
      .filter((b) =>
        !q ||
        b.userName.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        b.routeName.toLowerCase().includes(q) ||
        (b.shuttleId ?? '').toLowerCase().includes(q) ||
        (driverForBooking(b, shuttles, drivers)?.name.toLowerCase().includes(q) ?? false),
      )
  }, [bookings, status, routeFilter, shuttleFilter, date, search, shuttles, drivers])

  useEffect(() => {
    setVisibleCount(10)
  }, [search, status, routeFilter, shuttleFilter, date])

  const visibleBookings = filtered.slice(0, visibleCount)

  function assignDriver(shuttleId: string, driverId?: string) {
    const driver = drivers.find((candidate) => candidate.id === driverId)
    if (driver) {
      const simulatedFleet = shuttles.map((shuttle) => shuttle.id === shuttleId ? { ...shuttle, driverId } : shuttle)
      const affected = bookings.filter((booking) => booking.shuttleId === shuttleId && booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED')
      const issue = affected.flatMap((booking) => validateDriverAssignment(driver, booking, bookings, simulatedFleet))[0]
      if (issue) { showToast({ variant: 'error', title: 'Assignment rejected', description: issue }); return }
    }
    dispatch({ type: 'SET_SHUTTLE_DRIVER', payload: { shuttleId, driverId } })
    showToast({ variant: 'success', title: 'Shuttle assignment updated', description: 'Future booking displays now derive the assigned driver from this shuttle.' })
  }

  return (
    <Layout title="All bookings" eyebrow="Admin — Reservations">
      <Reveal>
      <div className="card mb-4 !p-4 flex flex-wrap items-end gap-3">
        <label className="flex-1 min-w-[200px]">
          <span className="label">Search</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Passenger, booking, route, shuttle, or driver"
              className="field !pl-9"
            />
          </div>
        </label>
        <label>
          <span className="label">Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as BookingStatus | 'ALL')}
            className="field !w-auto">
            {STATUS_FILTERS.map((s) => <option key={s} value={s} className="bg-surface">{s}</option>)}
          </select>
        </label>
        <label>
          <span className="label">Route</span>
          <select value={routeFilter} onChange={(e) => setRouteFilter(e.target.value)}
            className="field !w-auto">
            <option value="ALL" className="bg-surface">All routes</option>
            {routes.map((r) => <option key={r.id} value={r.id} className="bg-surface">{r.name}</option>)}
          </select>
        </label>
        <label>
          <span className="label">Shuttle</span>
          <select value={shuttleFilter} onChange={(e) => setShuttleFilter(e.target.value)}
            className="field !w-auto">
            <option value="ALL" className="bg-surface">All shuttles</option>
            {shuttles.map((s) => <option key={s.id} value={s.id} className="bg-surface">{s.id}</option>)}
          </select>
        </label>
        <label>
          <span className="label">Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="field !w-auto" />
        </label>
        <button type="button" onClick={() => { setSearch(''); setStatus('ALL'); setRouteFilter('ALL'); setShuttleFilter('ALL'); setDate('') }} className="btn-ghost px-3 py-2.5 text-xs rounded-[4px]">Clear filters</button>
      </div>
      <div className="card mb-4 !p-4">
        <p className="label mb-2">Shuttle → driver assignments</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {shuttles.map((shuttle) => <label key={shuttle.id} className="bg-white border border-ink/15 p-3 rounded-[4px] text-xs"><span className="block font-bold mb-2">{shuttle.id} · {routes.find((route) => route.id === shuttle.routeId)?.name}</span><select value={shuttle.driverId ?? ''} onChange={(event) => assignDriver(shuttle.id, event.target.value || undefined)} className="field !py-2 !text-xs"><option value="">Unassigned</option>{drivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.name}</option>)}</select></label>)}
        </div>
      </div>
      </Reveal>

      <Reveal delay={1}>
      <div className="card !p-3 md:!p-4">
        {filtered.length === 0 ? (
          <EmptyState icon={Ticket} title="No bookings match your filters" description="Try clearing a filter to see more results." />
        ) : (
          <div>
            <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2.5 font-mono text-[10px] font-bold text-muted uppercase tracking-[0.2em]">
              <span className="col-span-1">Booking</span>
              <span className="col-span-1">User</span>
              <span className="col-span-2">Route</span>
              <span className="col-span-2">Date</span>
              <span className="col-span-1">Seats</span>
              <span className="col-span-1">Fare</span>
              <span className="col-span-2">Status</span>
              <span className="col-span-1 text-right">Actions</span>
            </div>
            <p className="px-4 pb-2 text-xs text-muted">Showing {visibleBookings.length} of {filtered.length} booking(s) · all changes update every screen from the same booking state.</p>
            <div className="space-y-1.5 pr-1">
              {visibleBookings.map((b) => (
                <BookingRow
                  key={b.id}
                  booking={b}
                  showUser
                  isAdmin
                  onView={(booking) => setViewing(bookings.find((candidate) => candidate.id === booking.id) ?? booking)}
                  onStatusChange={(booking, s) => {
                    const current = bookings.find((candidate) => candidate.id === booking.id) ?? booking
                    if (!validStatusTransition(current.status, s)) {
                      showToast({ variant: 'error', title: 'Invalid status change', description: `${current.id} cannot move from ${current.status} to ${s}.` })
                      return
                    }
                    dispatch({ type: 'SET_BOOKING_STATUS', payload: { id: booking.id, status: s } })
                    showToast({ variant: 'success', title: 'Status changed', description: `${booking.id}: ${current.status} → ${s}. Student, capacity, and analytics views update now.` })
                  }}
                  shuttleLabel={b.shuttleId}
                  driverName={driverForBooking(b, shuttles, drivers)?.name}
                />
              ))}
            </div>
            {visibleCount < filtered.length && (
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => Math.min(count + 10, filtered.length))}
                  className="btn-ghost px-5 py-2.5 text-xs rounded-[4px]"
                >
                  View more ({filtered.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      </Reveal>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing ? `Booking ${viewing.id}` : 'Booking details'}>
        {(() => {
          if (!viewing) return null
          const live = bookings.find((candidate) => candidate.id === viewing.id) ?? viewing
          const driver = driverForBooking(live, shuttles, drivers)
          const shuttle = shuttles.find((candidate) => candidate.id === live.shuttleId)
          const route = routes.find((candidate) => candidate.id === live.routeId)
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold">{live.userName}</p>
                <StatusBadge status={live.status} />
              </div>
              <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="bg-white border border-ink/15 p-3 rounded-[4px]"><dt className="label">Route</dt><dd className="font-bold">{live.routeName}</dd><dd className="text-xs text-muted">{route?.source} → {route?.destination}</dd></div>
                <div className="bg-white border border-ink/15 p-3 rounded-[4px]"><dt className="label">Departure</dt><dd className="font-bold">{live.date} · {live.timeSlot}</dd><dd className="text-xs text-muted">{live.boardingPoint} → {live.dropOffPoint}</dd></div>
                <div className="bg-white border border-ink/15 p-3 rounded-[4px]"><dt className="label">Shuttle</dt><dd className="font-bold">{live.shuttleId ?? 'No shuttle'}</dd><dd className="text-xs text-muted">{shuttle?.vehicleNumber ?? ''} · {live.seats} seat(s) · ₹{live.fare}</dd></div>
                <div className="bg-white border border-ink/15 p-3 rounded-[4px]"><dt className="label">Driver (from shuttle)</dt><dd className="font-bold">{driver?.name ?? 'Unassigned'}</dd><dd className="text-xs text-muted">{driver ? `${driver.phone} · ${driver.vehicleNumber}` : 'Assign a driver to the shuttle above.'}</dd></div>
              </dl>
              <div className="flex flex-wrap items-center gap-2">
                <span className="label">Change status</span>
                {(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as BookingStatus[]).map((next) => (
                  <button
                    key={next}
                    type="button"
                    disabled={live.status === next || !validStatusTransition(live.status, next)}
                    onClick={() => {
                      dispatch({ type: 'SET_BOOKING_STATUS', payload: { id: live.id, status: next } })
                      setViewing({ ...live, status: next })
                      showToast({ variant: 'success', title: 'Status changed', description: `${live.id}: ${live.status} → ${next}.` })
                    }}
                    className="btn-ghost px-3 py-2 text-xs rounded-[4px] disabled:opacity-35 disabled:cursor-not-allowed"
                  >
                    {next}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted">Driver is always derived live as booking → shuttle → driver. Changing the shuttle assignment above updates every future display immediately; completed history keeps its snapshot.</p>
            </div>
          )
        })()}
      </Modal>

    </Layout>
  )
}
