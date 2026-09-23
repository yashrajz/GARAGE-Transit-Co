import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import Reveal from '../../components/Reveal'
import Layout from '../../components/Layout'
import BookingForm, { BookingFormValues } from '../../components/BookingForm'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { Route } from '../../types'
import { getTimeSlotAvailability } from '../../utils/departures'
import { useRole } from '../../context/RoleContext'

interface BookingNavigationState {
  selectedShuttle?: { tripId: string; routeId: string; date: string; timeSlot: string; boardingPoint: string; dropOffPoint: string }
}

export default function BookShuttle() {
  const { routes, bookings, shuttles, dispatch } = useApp()
  const { showToast } = useToast()
  const { currentUser } = useRole()
  const location = useLocation()
  const selectedShuttle = (location.state as BookingNavigationState | null)?.selectedShuttle
    ? { ...(location.state as BookingNavigationState).selectedShuttle!, seats: 1 }
    : undefined
  const [pendingId, setPendingId] = useState<string | null>(null)

  function handleSubmit(values: BookingFormValues, route: Route) {
    const slot = getTimeSlotAvailability(route, bookings, values.date, new Date()).find((candidate) => candidate.timeSlot === values.timeSlot)
    if (values.tripId && (!slot?.selectable || slot.availableSeats < values.seats)) {
      showToast({ variant: 'error', title: 'Shuttle unavailable', description: 'This shuttle has departed, filled, or is no longer active. Please select another shuttle.' })
      return
    }
    const highestBookingNumber = bookings.reduce((highest, booking) => {
      const match = /^BKG-(\d+)$/.exec(booking.id)
      return match ? Math.max(highest, Number(match[1])) : highest
    }, 0)
    const id = `BKG-${highestBookingNumber + 1}`
    dispatch({
      type: 'ADD_BOOKING',
      payload: {
        id,
        userId: currentUser.id,
        userName: currentUser.name,
        routeId: route.id,
        tripId: values.tripId,
        routeName: route.name,
        date: values.date,
        timeSlot: values.timeSlot,
        boardingPoint: values.boardingPoint,
        dropOffPoint: values.dropOffPoint,
        seats: values.seats,
        fare: route.fare * values.seats,
        status: 'PENDING',
        shuttleId: shuttles.find((shuttle) => shuttle.routeId === route.id)?.id,
      },
    })
    setPendingId(id)
    showToast({ variant: 'success', title: 'Booking submitted', description: `${id} is pending admin approval.` })
  }

  return (
    <Layout title="Book your ride" eyebrow="Student — Booking Desk">
      {pendingId ? (
        <Reveal>
        <div className="card max-w-md mx-auto text-center !py-12 relative overflow-hidden">
          <div className="absolute inset-0 grid-blueprint opacity-40" aria-hidden="true" />
          <div className="relative mx-auto mb-5 inline-flex bg-espresso p-4 rounded-[4px]">
            <CheckCircle2 className="h-8 w-8 text-frame" />
          </div>
          <h2 className="relative font-display text-2xl font-black tracking-tight">Booking request submitted</h2>
          <p className="relative text-sm text-muted mt-2">Booking <span className="font-mono text-ink font-bold">{pendingId}</span> is pending admin approval.<br />You will see the confirmed status here once it is approved.</p>
          <button
            onClick={() => setPendingId(null)}
            className="relative mt-7 btn-bus px-6 py-3 text-sm rounded-[4px]"
          >
            Book another shuttle
          </button>
        </div>
        </Reveal>
      ) : (
        <Reveal>
        <div className="card">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="eyebrow">New reservation</p>
              <h2 className="hero-display w-full max-w-2xl text-[clamp(1.7rem,3.5vw,2.4rem)] mt-2">Where to?</h2>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 bg-success/10 border border-success/30 px-3 py-1.5 text-xs font-bold text-success rounded-[3px]">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-[pulseDot_2s_ease-in-out_infinite]" /> Seats live
            </span>
          </div>
          <BookingForm
            userId={currentUser.id}
            initial={selectedShuttle}
            onSubmit={handleSubmit}
          />
        </div>
        </Reveal>
      )}
    </Layout>
  )
}
