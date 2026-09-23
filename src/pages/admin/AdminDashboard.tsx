import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, Route as RouteIcon, Users, XCircle, ArrowUpRight, BarChart3, Gauge, Ticket } from 'lucide-react'
import Reveal from '../../components/Reveal'
import LazyImage from '../../components/LazyImage'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import { useApp } from '../../context/AppContext'
import { localTodayISO } from '../../utils/dateHelpers'
import { buildUsageSummary } from '../../utils/analytics'

export default function AdminDashboard() {
  const { bookings, routes, drivers, trips, shuttles } = useApp()
  const today = localTodayISO()

  const bookingsToday = bookings.filter((b) => b.date === today).length
  const activeRoutes = routes.filter((route) => route.active).length
  const driversOnDuty = drivers.filter((d) => (d.schedules[today] ?? []).some((b) => b.type === 'DUTY')).length
  const cancellationRate = useMemo(() => {
    if (bookings.length === 0) return 0
    const cancelled = bookings.filter((b) => b.status === 'CANCELLED').length
    return Math.round((cancelled / bookings.length) * 100)
  }, [bookings])
  const usage = useMemo(() => buildUsageSummary(bookings, routes, drivers, today, trips, shuttles), [bookings, routes, drivers, today, trips, shuttles])
  const allUsage = useMemo(() => buildUsageSummary(bookings, routes, drivers, '', trips, shuttles), [bookings, routes, drivers, trips, shuttles])
  const busiestRoute = allUsage.routeDemand[0]
  const utilization = usage.driverUtilization.length > 0
    ? Math.round(usage.driverUtilization.reduce((sum, driver) => sum + driver.utilization, 0) / usage.driverUtilization.length)
    : 0

  return (
    <Layout title="Control tower" eyebrow="Admin — Overview">
      <Reveal>
      <div className="card mb-5 overflow-hidden relative">
        <div className="absolute inset-0 grid-blueprint opacity-50" aria-hidden="true" />
        <div className="relative grid lg:grid-cols-[1fr_340px] gap-6 items-center">
          <div>
            <p className="inline-flex items-center gap-2 bg-success/10 border border-success/30 px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.18em] text-success rounded-[3px]">
              {driversOnDuty} DRIVERS LIVE · {bookingsToday} BOOKINGS TODAY
            </p>
            <h2 className="hero-display w-full max-w-3xl text-[clamp(1.9rem,4vw,3rem)] mt-3">LPU is moving.</h2>
            <p className="text-sm text-muted mt-2">Monitor every seat, route and duty window from one command deck.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/admin/bookings" className="btn-bus px-5 py-3 text-sm inline-flex items-center gap-1.5 rounded-[4px]">All bookings <ArrowUpRight className="h-4 w-4" /></Link>
              <Link to="/admin/drivers" className="btn-ghost px-5 py-3 text-sm rounded-[4px]">Driver timeline</Link>
            </div>
            <p className="mt-5 font-mono text-[11px] font-bold tracking-widest text-muted">LIVE FLEET · {driversOnDuty} DRIVERS ON DUTY</p>
          </div>
          <div className="rounded-[4px] overflow-hidden border border-ink/20 bg-white shadow-pop">
            <LazyImage src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=60" alt="Fleet in the garage" className="aspect-[16/10]" loading="lazy" />
            <div className="ticket-edge opacity-60" />
            <div className="p-4">
              <p className="font-display font-black text-xl leading-none">Fleet S 80</p>
              <p className="text-xs text-muted mt-1">5 corridors · live seats · zero queues</p>
            </div>
          </div>
        </div>
      </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="Total Bookings" value={allUsage.totalBookings} icon={CalendarCheck} index={0} hint={`${allUsage.confirmedBookings} confirmed`} />
        <StatCard label="Active Routes" value={activeRoutes} icon={RouteIcon} index={1} hint="5 corridors live" />
        <StatCard label="Completed Trips" value={allUsage.completedTrips} icon={Users} index={2} hint={`${driversOnDuty} drivers on duty`} />
        <StatCard label="Cancelled" value={allUsage.cancelledBookings} icon={XCircle} index={3} hint={`${cancellationRate}% of bookings`} />
      </div>

      <Reveal delay={1}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <StatCard label="Seats Booked" value={allUsage.seatsBooked} icon={Ticket} index={0} hint={`${allUsage.averageSeatsPerBooking} average seats`} />
          <StatCard label="Seat Utilization" value={allUsage.seatUtilization} suffix="%" icon={BarChart3} index={1} hint={`Peak ${allUsage.peakSlot?.timeSlot ?? 'none'}`} />
          <StatCard label="Driver Utilization" value={utilization} suffix="%" icon={Gauge} index={2} hint="Assigned trips vs duty hours" />
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4"><div><p className="eyebrow">Demand monitor</p><h2 className="font-display font-black text-lg mt-2">Route demand today</h2></div><span className="font-mono text-[10px] text-muted">{usage.totalBookings} ACTIVE</span></div>
            {allUsage.routeDemand.length === 0 ? <p className="text-sm text-muted">No active bookings found.</p> : <div className="space-y-3">{allUsage.routeDemand.map((route) => <div key={route.routeId}><div className="flex justify-between text-xs font-bold"><span>{route.routeName}</span><span>{route.bookings} booking(s) · {route.seats} seat(s)</span></div><div className="h-2 bg-ink/10 rounded-full mt-1.5 overflow-hidden"><div className="h-full bg-accent-gradient rounded-full" style={{ width: `${Math.max(8, (route.bookings / Math.max(1, busiestRoute?.bookings ?? 1)) * 100)}%` }} /></div></div>)}</div>}
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-4"><div><p className="eyebrow">Workforce</p><h2 className="font-display font-black text-lg mt-2">Driver utilization</h2></div><span className="font-mono text-[10px] text-muted">TODAY</span></div>
            <div className="space-y-2">{usage.driverUtilization.slice(0, 5).map((driver) => <div key={driver.driverId} className="flex items-center gap-3"><span className="w-28 truncate text-xs font-bold">{driver.driverName}</span><div className="flex-1 h-2 bg-ink/10 rounded-full overflow-hidden"><div className="h-full bg-olive rounded-full" style={{ width: `${driver.utilization}%` }} /></div><span className="font-mono text-[10px] text-muted w-10 text-right">{driver.utilization}%</span></div>)}</div>
          </div>
        </div>
        <div className="card mt-4">
          <div className="flex items-center justify-between mb-4"><div><p className="eyebrow">Operations summary</p><h2 className="font-display font-black text-lg mt-2">Where demand is concentrating</h2></div><span className="font-mono text-[10px] text-muted">ALL MOCK DATA</span></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <p><span className="block text-xs text-muted">Most-used route</span><strong>{allUsage.mostUsedRoute?.routeName ?? 'None'}</strong></p>
            <p><span className="block text-xs text-muted">Peak period</span><strong>{allUsage.peakSlot?.timeSlot ?? 'None'} ({allUsage.peakSlot?.bookings ?? 0})</strong></p>
            <p><span className="block text-xs text-muted">Trips without drivers</span><strong>{allUsage.tripsWithoutDrivers}</strong></p>
            <p><span className="block text-xs text-muted">Average occupancy</span><strong>{allUsage.averageOccupancy}%</strong></p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">{allUsage.peakSlots.slice(0, 5).map((slot) => <span key={slot.timeSlot} className="bg-sand/70 border border-ink/15 px-2.5 py-1.5 rounded-[3px] text-xs font-bold">{slot.timeSlot} · {slot.bookings} booking(s)</span>)}</div>
        </div>
      </Reveal>

      <Reveal delay={1}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/admin/bookings" className="card card-hover flex items-center justify-between group">
          <div>
            <p className="font-display font-black tracking-tight">All Bookings</p>
            <p className="text-sm text-muted mt-1">Search, filter, and manage every booking at LPU.</p>
          </div>
          <span className="bg-espresso p-3 shrink-0 rounded-[4px] group-hover:scale-105 transition-transform"><CalendarCheck className="h-5 w-5 text-frame" /></span>
        </Link>
        <Link to="/admin/drivers" className="card card-hover flex items-center justify-between group">
          <div>
            <p className="font-display font-black tracking-tight">Driver Availability</p>
            <p className="text-sm text-muted mt-1">View the daily timeline and edit duty hours.</p>
          </div>
          <span className="bg-espresso p-3 shrink-0 rounded-[4px] group-hover:scale-105 transition-transform"><Users className="h-5 w-5 text-frame" /></span>
        </Link>
      </div>
      </Reveal>
    </Layout>
  )
}
