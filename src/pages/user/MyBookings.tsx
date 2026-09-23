import React, { useMemo, useState } from 'react'
import { Ticket } from 'lucide-react'
import Reveal from '../../components/Reveal'
import Layout from '../../components/Layout'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'
import ConfirmDialog from '../../components/ConfirmDialog'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { Booking } from '../../types'
import { useRole } from '../../context/RoleContext'
import { canCancelBooking } from '../../utils/access'
import { upcomingBookings } from '../../utils/bookingSelectors'

export default function MyBookings() {
  const { bookings, dispatch } = useApp()
  const { showToast } = useToast()
  const { currentUser } = useRole()
  const [cancelling, setCancelling] = useState<Booking | null>(null)
  const myBookings = useMemo(() => upcomingBookings(bookings, currentUser), [bookings, currentUser])

  return (
    <Layout title="My bookings" eyebrow="Student — Reservations">
      <Reveal>
      <div className="card !p-3 md:!p-4">
        <div className="flex items-center justify-between px-3 py-2">
          <p className="text-sm text-muted"><span className="text-ink font-black font-display text-lg">{myBookings.length}</span> <span className="ml-1">total reservations</span></p>
        </div>
        {myBookings.length === 0 ? (
          <EmptyState icon={Ticket} title="No bookings yet" description="Your bookings will show up here once you make one." />
        ) : (
          <div className="space-y-1.5">
            {myBookings.map((b) => {
              return (
                <div key={b.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-ink/15 px-4 py-3.5 rounded-[4px] hover:shadow-card hover:-translate-y-[1px] transition-all">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="h-10 w-10 bg-espresso text-cream hidden sm:flex items-center justify-center font-mono text-xs font-bold shrink-0 rounded-[3px]">{b.timeSlot.slice(0, 2)}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{b.routeName} <span className="text-muted font-mono text-[11px] ml-1">{b.id}</span></p>
                      <p className="text-xs text-muted mt-0.5">{b.date} · {b.timeSlot} · {b.boardingPoint} to {b.dropOffPoint} · {b.seats} seat(s) · ₹{b.fare}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={b.status} />
                    <button
                      onClick={() => setCancelling(b)}
                      disabled={!canCancelBooking(currentUser, b)}
                      className="px-2.5 py-1.5 text-xs font-bold text-muted hover:text-danger hover:bg-danger/10 disabled:opacity-30 disabled:pointer-events-none transition-colors rounded-[3px]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      </Reveal>

      <ConfirmDialog
        open={!!cancelling}
        title="Cancel this booking?"
        description={`This will cancel booking ${cancelling?.id}. It leaves My Bookings, appears in Trip History as Cancelled, and frees its seats.`}
        confirmLabel="Cancel booking"
        onClose={() => setCancelling(null)}
        onConfirm={() => {
          if (!cancelling) return
          const live = bookings.find((candidate) => candidate.id === cancelling.id) ?? cancelling
          if (!canCancelBooking(currentUser, live)) {
            showToast({ variant: 'error', title: 'Cannot cancel', description: `${live.id} is ${live.status} or has already departed.` })
            return
          }
          dispatch({ type: 'CANCEL_BOOKING', payload: { id: live.id, userId: currentUser.id } })
          setCancelling(null)
          showToast({ variant: 'success', title: 'Booking cancelled', description: `${live.id} moved to Trip History as Cancelled and its seats were released.` })
        }}
      />
    </Layout>
  )
}
