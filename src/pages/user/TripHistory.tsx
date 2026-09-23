import React, { useMemo, useState } from 'react'
import { History, Phone, Truck, RotateCcw, Search } from 'lucide-react'
import Reveal from '../../components/Reveal'
import Layout from '../../components/Layout'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'
import { useApp } from '../../context/AppContext'
import { TripStatus } from '../../types'
import { useRole } from '../../context/RoleContext'
import { getStudentHistory } from '../../utils/access'

export default function TripHistory() {
  const { trips, bookings, drivers, shuttles, routes } = useApp()
  const { currentUser } = useRole()
  const [routeFilter, setRouteFilter] = useState('ALL')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TripStatus | 'ALL'>('ALL')

  const myTrips = getStudentHistory(bookings, trips, drivers, shuttles, currentUser)

  const filtered = useMemo(() => {
    return myTrips
      .filter((t) => routeFilter === 'ALL' || t.routeId === routeFilter)
      .filter((t) => !from || t.date >= from)
      .filter((t) => !to || t.date <= to)
      .filter((t) => statusFilter === 'ALL' || t.status === statusFilter)
      .filter((t) => !search || `${t.routeName} ${t.boardingPoint} ${t.dropOffPoint} ${t.driver.name}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
  }, [myTrips, routeFilter, from, to, statusFilter, search])

  return (
    <Layout title="Trip history" eyebrow="Student — Archive">
      <Reveal>
      <div className="card mb-4 !p-4 flex flex-wrap items-end gap-3">
        <label className="min-w-[220px] flex-1">
          <span className="label">Search</span>
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Route, stop, or driver" className="field !pl-9" /></div>
        </label>
        <label>
          <span className="label">Route</span>
          <select
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
            className="field !w-auto"
          >
            <option value="ALL" className="bg-surface">All routes</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id} className="bg-surface">{r.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">From</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="field !w-auto" />
        </label>
        <label>
          <span className="label">To</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="field !w-auto" />
        </label>
        <label>
          <span className="label">Status</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TripStatus | 'ALL')} className="field !w-auto">
            <option value="ALL" className="bg-surface">All statuses</option>
            <option value="COMPLETED" className="bg-surface">Completed</option>
            <option value="MISSED" className="bg-surface">Missed</option>
            <option value="CANCELLED" className="bg-surface">Cancelled</option>
          </select>
        </label>
        <button type="button" onClick={() => { setRouteFilter('ALL'); setFrom(''); setTo(''); setSearch(''); setStatusFilter('ALL') }} className="btn-ghost px-3 py-2.5 text-xs rounded-[4px] inline-flex items-center gap-1.5"><RotateCcw className="h-3.5 w-3.5" /> Clear</button>
        <p className="ml-auto font-mono text-[11px] font-bold text-muted pb-2.5">{filtered.length} TRIP(S)</p>
      </div>
      </Reveal>

      <Reveal delay={1}>
      <div className="card !p-3 md:!p-4">
        {filtered.length === 0 ? (
          <EmptyState icon={History} title="No trips found" description="Try widening your date range or route filter." />
        ) : (
          <div className="space-y-1.5">
            {filtered.map((t) => (
              <div key={t.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-ink/15 px-4 py-3.5 rounded-[4px] hover:shadow-card hover:-translate-y-[1px] transition-all">
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="h-10 w-10 bg-espresso text-cream hidden sm:flex items-center justify-center font-mono text-xs font-bold shrink-0 rounded-[3px]">{t.time.slice(0, 2)}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{t.routeName}</p>
                    <p className="text-xs text-muted mt-0.5">{t.date} · {t.time} · {t.boardingPoint} to {t.dropOffPoint} · {t.seats} seat(s) · ₹{t.fare}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2 bg-sand/60 border border-ink/15 pl-1 pr-3 py-1 rounded-[3px]">
                    <span className="h-6 w-6 bg-espresso text-cream flex items-center justify-center text-[10px] font-bold rounded-[2px]">
                      {t.driver.name.split(' ').map((n) => n[0]).join('')}
                    </span>
                    <span className="text-xs font-bold">{t.driver.name}</span>
                  </div>
                  <span className="hidden lg:inline-flex items-center gap-1 text-xs text-muted">
                    <Phone className="h-3.5 w-3.5" /> {t.driver.phone}
                  </span>
                  <span className="hidden xl:inline-flex items-center gap-1 text-xs text-muted">
                    <Truck className="h-3.5 w-3.5" /> {t.driver.vehicleNumber}
                  </span>
                  {t.shuttleId && <span className="hidden xl:inline-flex text-xs text-muted">{t.shuttleId}</span>}
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </Reveal>
    </Layout>
  )
}
