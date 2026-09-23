import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarPlus, MapPin, Ticket, TrendingUp, ArrowUpRight, ArrowLeft, Star } from 'lucide-react'
import Reveal from '../../components/Reveal'
import LazyImage from '../../components/LazyImage'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'
import ConfirmDialog from '../../components/ConfirmDialog'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { Booking } from '../../types'
import { useRole } from '../../context/RoleContext'
import { canCancelBooking } from '../../utils/access'
import { getUpcomingConfirmedSeats, upcomingBookings } from '../../utils/bookingSelectors'
import { useShuttleSelection } from '../../context/ShuttleSelectionContext'

export default function Dashboard() {
  const { bookings, trips, dispatch } = useApp()
  const { showToast } = useToast()
  const { currentUser } = useRole()
  const navigate = useNavigate()
  const [cancelling, setCancelling] = useState<Booking | null>(null)
  const { shuttles: bookableShuttles, selectedIndex: selectedShuttleIndex, selectedShuttle, setSelectedIndex } = useShuttleSelection()

  const upcoming = upcomingBookings(bookings, currentUser)
  const confirmedUpcomingSeats = getUpcomingConfirmedSeats(bookings, currentUser.id)

  const tripsThisMonth = useMemo(() => {
    const now = new Date()
    return trips.filter((t) => {
      const d = new Date(t.date + 'T00:00:00')
      return t.userId === currentUser.id && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
  }, [trips, currentUser.id])

  function bookSelectedShuttle() {
    if (!selectedShuttle) return
    const stillBookable = bookableShuttles.some((shuttle) => shuttle.tripId === selectedShuttle.tripId)
    if (!stillBookable) {
      showToast({ variant: 'error', title: 'Shuttle unavailable', description: 'This shuttle has departed, filled, or is no longer active. Please select another shuttle.' })
      return
    }
    navigate('/user/book', {
      state: {
        selectedShuttle: {
          tripId: selectedShuttle.tripId,
          routeId: selectedShuttle.routeId,
          date: selectedShuttle.date,
          timeSlot: selectedShuttle.timeSlot,
          boardingPoint: selectedShuttle.pickupPoint,
          dropOffPoint: selectedShuttle.dropOffPoint,
        },
      },
    })
  }

  return (
    <Layout title={`Good evening, ${currentUser.name.split(' ')[0]}`} eyebrow="Student — Garage Floor">
      <Reveal>
      <div className="card mb-5 overflow-hidden relative">
        <div className="absolute inset-0 grid-blueprint opacity-50" aria-hidden="true" />
        <div className="relative grid lg:grid-cols-[1fr_340px] gap-6 items-center">
          <div>
            <p className="eyebrow">Next shuttle</p>
            <h2 className="hero-display w-full max-w-3xl text-[clamp(1.9rem,4vw,3rem)] mt-3">
              {selectedShuttle ? selectedShuttle.routeName : 'No upcoming shuttles'}
              {selectedShuttle && <> · {selectedShuttle.timeSlot}</>}
            </h2>
            <p className="text-sm text-muted mt-2 max-w-lg leading-relaxed">
              {selectedShuttle
                ? `${selectedShuttle.date} · ${selectedShuttle.pickupPoint} to ${selectedShuttle.dropOffPoint} · ${selectedShuttle.availableSeats} seat(s) left. Arrive 5 min early.`
                : 'Check back later for the next available LPU shuttle.'}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {selectedShuttle && <button onClick={bookSelectedShuttle} className="btn-bus px-6 py-3 text-sm inline-flex items-center gap-2 justify-center rounded-[4px]"><CalendarPlus className="h-4 w-4" /> Book Now</button>}
              <Link to="/user/bookings" className="btn-ghost px-5 py-3 text-sm inline-flex items-center gap-1.5 rounded-[4px]">
                View bookings <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-5 flex items-center gap-4 font-mono text-[11px] font-bold tracking-widest text-muted">
              <button type="button" disabled={selectedShuttleIndex === 0} onClick={() => setSelectedIndex((index) => Math.max(0, index - 1))} className="flex items-center gap-2 disabled:opacity-35 disabled:cursor-not-allowed"><ArrowLeft className="h-3.5 w-3.5" /> PREV</button>
              <button type="button" disabled={selectedShuttleIndex >= bookableShuttles.length - 1} onClick={() => setSelectedIndex((index) => Math.min(bookableShuttles.length - 1, index + 1))} className="text-ink disabled:opacity-35 disabled:cursor-not-allowed">NEXT →</button>
              <span className="flex items-center gap-1 text-ink"><Star className="h-3.5 w-3.5 fill-bus text-bus" /> 14.5K+ reviews</span>
            </div>
          </div>
          <div className="rounded-[4px] overflow-hidden border border-ink/20 bg-white shadow-pop">
            <LazyImage src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=60" alt="LPU shuttle" className="aspect-[16/10]" />
            <div className="p-4 border-t border-ink/15">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-muted">{selectedShuttle ? `${selectedShuttle.date} · ${selectedShuttle.routeName} ${selectedShuttle.timeSlot}` : 'No upcoming departures'}</p>
              <div className="mt-2 h-2 bg-ink/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-accent-gradient transition-all duration-300" style={{ width: `${selectedShuttle?.occupancyPercentage ?? 0}%` }} />
              </div>
                <p className="mt-2 text-xs text-muted">{selectedShuttle ? `${selectedShuttle.occupancyPercentage}% full — ${selectedShuttle.availableSeats} seats left` : 'Check back later for the next available LPU shuttle.'}</p>
            </div>
          </div>
        </div>
      </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <StatCard label="Total Trips" value={trips.filter((t) => t.userId === currentUser.id).length} icon={MapPin} index={0} hint="Lifetime rides" />
        <StatCard label="Upcoming" value={confirmedUpcomingSeats} icon={Ticket} index={1} hint="Confirmed seats" />
        <StatCard label="This Month" value={tripsThisMonth} icon={TrendingUp} index={2} hint="Rides completed" />
      </div>

      <Reveal delay={1}>
      <div className="card !p-3 md:!p-4">
        <div className="flex items-center justify-between px-3 py-2">
          <h3 className="font-display font-black tracking-tight">Upcoming bookings</h3>
          <Link to="/user/bookings" className="text-xs font-bold text-bus hover:text-busDeep transition-colors inline-flex items-center gap-1">See all <ArrowUpRight className="h-3.5 w-3.5" /></Link>
        </div>
        {upcoming.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="No upcoming bookings"
            description="Book your next ride to see it appear here."
            action={
              <Link to="/user/book" className="btn-bus px-5 py-2.5 text-sm inline-block rounded-[4px]">
                Book a shuttle
              </Link>
            }
          />
        ) : (
          <div className="space-y-1.5">
            {upcoming.map((b) => (
              <div key={b.id} className="group flex items-center justify-between gap-3 bg-white border border-ink/15 px-4 py-3.5 rounded-[4px] hover:-translate-y-[1px] hover:shadow-card transition-all">
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="h-10 w-10 bg-espresso text-cream flex items-center justify-center font-mono text-xs font-bold shrink-0 rounded-[3px]">
                    {b.timeSlot.slice(0, 2)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{b.routeName} <span className="text-muted font-mono text-[11px] ml-1">{b.id}</span></p>
                    <p className="text-xs text-muted mt-0.5 truncate">{b.date} · {b.timeSlot} · {b.boardingPoint} to {b.dropOffPoint} · {b.seats} seat(s)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={b.status} />
                  <button onClick={() => setCancelling(b)} disabled={!canCancelBooking(currentUser, b)} className="px-2.5 py-1.5 text-xs font-bold text-muted hover:text-danger hover:bg-danger/10 disabled:opacity-30 disabled:pointer-events-none transition-colors rounded-[3px]">Cancel</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </Reveal>

      <ConfirmDialog
        open={!!cancelling}
        title="Cancel this booking?"
        description={`This will cancel booking ${cancelling?.id}. It leaves My Bookings, appears in Trip History as Cancelled, frees its seats, and updates admin/analytics views.`}
        confirmLabel="Cancel booking"
        onClose={() => setCancelling(null)}
        onConfirm={() => {
          if (!cancelling) return
          const live = bookings.find((candidate) => candidate.id === cancelling.id) ?? cancelling
          if (!canCancelBooking(currentUser, live)) {
            showToast({ variant: 'error', title: 'Cannot cancel', description: `${live.id} is ${live.status} or has already departed.` })
            return
          }
          const before = bookings.filter((candidate) => candidate.id === live.id && candidate.status !== 'CANCELLED').length
          dispatch({ type: 'CANCEL_BOOKING', payload: { id: live.id, userId: currentUser.id } })
          setCancelling(null)
          if (before > 0) showToast({ variant: 'success', title: 'Booking cancelled', description: `${live.id} moved to Trip History as Cancelled and its seats were released.` })
          else showToast({ variant: 'error', title: 'Nothing changed', description: `${live.id} was already ${live.status}.` })
        }}
      />
    </Layout>
  )
}
