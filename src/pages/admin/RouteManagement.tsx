import React, { useState } from 'react'
import { Pencil, Plus, Route as RouteIcon, ToggleLeft, ToggleRight, BusFront } from 'lucide-react'
import Reveal from '../../components/Reveal'
import Layout from '../../components/Layout'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { Route, Shuttle } from '../../types'
import { validateRoute } from '../../utils/routeValidation'

interface RouteValues {
  name: string
  source: string
  destination: string
  stops: string
  fare: string
  schedule: string
}

interface ShuttleValues {
  vehicleNumber: string
  routeId: string
  capacity: string
  driverId: string
}

const emptyValues: RouteValues = {
  name: '', source: '', destination: '', stops: '', fare: '10', schedule: '',
}

const emptyShuttleValues: ShuttleValues = {
  vehicleNumber: '', routeId: '', capacity: '24', driverId: '',
}

function valuesFromRoute(route: Route): RouteValues {
  return {
    name: route.name,
    source: route.source,
    destination: route.destination,
    stops: route.stops.join(', '),
    fare: String(route.fare),
    schedule: route.schedule.join(', '),
  }
}

function parseValues(values: RouteValues, routes: Route[], editingId?: string): { route?: Omit<Route, 'id' | 'active'>; errors: string[] } {
  const source = values.source.trim()
  const destination = values.destination.trim()
  const enteredStops = values.stops.split(',').map((stop) => stop.trim()).filter(Boolean)
  const stops = [
    ...(enteredStops[0]?.toLowerCase() === source.toLowerCase() ? [] : [source]),
    ...enteredStops,
    ...(enteredStops[enteredStops.length - 1]?.toLowerCase() === destination.toLowerCase() ? [] : [destination]),
  ].filter(Boolean)
  const schedule = values.schedule.split(',').map((slot) => slot.trim()).filter(Boolean)
  const fare = Number(values.fare)
  const errors = validateRoute({ id: editingId, name: values.name, source, destination, stops, fare, schedule }, routes, editingId)

  return errors.length > 0
    ? { errors }
    : { errors, route: { name: values.name.trim(), source, destination, stops, fare, schedule } }
}

export default function RouteManagement() {
  const { routes, shuttles, drivers, dispatch } = useApp()
  const { showToast } = useToast()
  const [editing, setEditing] = useState<Route | null>(null)
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<RouteValues>(emptyValues)
  const [errors, setErrors] = useState<string[]>([])
  const [assignedShuttleId, setAssignedShuttleId] = useState('')
  const [shuttleOpen, setShuttleOpen] = useState(false)
  const [shuttleValues, setShuttleValues] = useState<ShuttleValues>(emptyShuttleValues)
  const [shuttleErrors, setShuttleErrors] = useState<string[]>([])

  function openCreate() {
    setEditing(null)
    setValues(emptyValues)
    setErrors([])
    setAssignedShuttleId('')
    setOpen(true)
  }

  function openEdit(route: Route) {
    setEditing(route)
    setValues(valuesFromRoute(route))
    setErrors([])
    setAssignedShuttleId(shuttles.find((shuttle) => shuttle.routeId === route.id)?.id ?? '')
    setOpen(true)
  }

  function openShuttleCreate() {
    setShuttleValues({ ...emptyShuttleValues, routeId: routes[0]?.id ?? '' })
    setShuttleErrors([])
    setShuttleOpen(true)
  }

  function saveRoute(e: React.FormEvent) {
    e.preventDefault()
    const parsed = parseValues(values, routes, editing?.id)
    if (!parsed.route) {
      setErrors(parsed.errors)
      return
    }
    const route: Route = editing
      ? { ...editing, ...parsed.route }
      : { id: `rt-${Date.now()}`, active: true, ...parsed.route }
    dispatch({ type: editing ? 'EDIT_ROUTE' : 'ADD_ROUTE', payload: route })
    const previousShuttle = editing ? shuttles.find((shuttle) => shuttle.routeId === editing.id) : undefined
    if (previousShuttle && previousShuttle.id !== assignedShuttleId) {
      dispatch({ type: 'SET_SHUTTLE_ROUTE', payload: { shuttleId: previousShuttle.id } })
    }
    if (assignedShuttleId) {
      dispatch({ type: 'SET_SHUTTLE_ROUTE', payload: { shuttleId: assignedShuttleId, routeId: route.id } })
    }
    showToast({ variant: 'success', title: editing ? 'Route updated' : 'Route added', description: `${route.name} is ready for operations.` })
    setEditing(null)
    setOpen(false)
  }

  function saveShuttle(e: React.FormEvent) {
    e.preventDefault()
    const vehicleNumber = shuttleValues.vehicleNumber.trim()
    const capacity = Number(shuttleValues.capacity)
    const errors = [
      !vehicleNumber ? 'Vehicle number is required.' : '',
      !shuttleValues.routeId ? 'Select a route for this shuttle.' : '',
      !Number.isInteger(capacity) || capacity <= 0 ? 'Capacity must be a positive whole number.' : '',
      shuttles.some((shuttle) => shuttle.vehicleNumber.toLowerCase() === vehicleNumber.toLowerCase()) ? 'Vehicle number must be unique.' : '',
    ].filter(Boolean)
    if (errors.length > 0) {
      setShuttleErrors(errors)
      return
    }
    const shuttle: Shuttle = {
      id: `SH-${Math.max(0, ...shuttles.map((item) => Number(item.id.replace('SH-', '')) || 0)) + 1}`,
      vehicleNumber,
      routeId: shuttleValues.routeId,
      capacity,
      driverId: shuttleValues.driverId || undefined,
    }
    dispatch({ type: 'ADD_SHUTTLE', payload: shuttle })
    showToast({ variant: 'success', title: 'Shuttle added', description: `${shuttle.id} is ready for ${routes.find((route) => route.id === shuttle.routeId)?.name ?? 'the selected route'}.` })
    setShuttleOpen(false)
  }

  return (
    <Layout title="Route management" eyebrow="Admin — Network">
      <Reveal>
        <div className="card mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">LPU network</p>
            <h2 className="hero-display text-[clamp(1.8rem,4vw,2.8rem)] mt-2">Routes that keep LPU moving.</h2>
            <p className="text-sm text-muted mt-2">Maintain ordered pickup points, departures, fares, and route availability.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={openCreate} className="btn-bus px-4 py-3 text-sm rounded-[4px] inline-flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add route
            </button>
            <button onClick={openShuttleCreate} className="btn-ghost px-4 py-3 text-sm rounded-[4px] inline-flex items-center gap-2">
              <BusFront className="h-4 w-4" /> Add shuttle
            </button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={1}>
        <div className="card !p-3 md:!p-4">
          {routes.length === 0 ? (
            <EmptyState icon={RouteIcon} title="No routes configured" description="Add a route to make shuttle bookings available." action={<button onClick={openCreate} className="btn-bus px-5 py-2.5 text-sm rounded-[4px]">Add first route</button>} />
          ) : (
            <div className="space-y-2">
              {routes.map((route) => (
                <article key={route.id} className="bg-white border border-ink/15 rounded-[4px] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-black tracking-tight">{route.name}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-[3px] border ${route.active ? 'text-success bg-success/10 border-success/30' : 'text-muted bg-ink/5 border-ink/15'}`}>
                        {route.active ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-sm text-muted mt-1">{route.source} to {route.destination} · ₹{route.fare} per seat</p>
                    <p className="text-xs text-muted mt-1">{route.stops.join('  →  ')} · {route.schedule.join(', ')}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => openEdit(route)} className="btn-ghost px-3 py-2 text-xs rounded-[4px] inline-flex items-center gap-1.5"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                    <button
                      onClick={() => {
                        dispatch({ type: 'SET_ROUTE_ACTIVE', payload: { id: route.id, active: !route.active } })
                        showToast({ variant: 'info', title: route.active ? 'Route disabled' : 'Route enabled', description: `${route.name} ${route.active ? 'will no longer accept new bookings.' : 'is available for new bookings.'}` })
                      }}
                      className="btn-ghost px-3 py-2 text-xs rounded-[4px] inline-flex items-center gap-1.5"
                    >
                      {route.active ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                      {route.active ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </Reveal>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? `Edit ${editing.name}` : 'Add route'}>
        <form onSubmit={saveRoute} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {(['name', 'source', 'destination', 'fare'] as const).map((field) => (
              <label key={field} className="block">
                <span className="label">{field === 'fare' ? 'Fare per seat' : field}</span>
                <input type={field === 'fare' ? 'number' : 'text'} min={field === 'fare' ? '1' : undefined} value={values[field]} onChange={(e) => setValues((prev) => ({ ...prev, [field]: e.target.value }))} className="field" />
              </label>
            ))}
          </div>
          <label className="block"><span className="label">Ordered stops</span><input value={values.stops} onChange={(e) => setValues((prev) => ({ ...prev, stops: e.target.value }))} placeholder="LPU Main Gate, LPU Library, LPU Academic Block" className="field" /></label>
          <label className="block"><span className="label">Departure times</span><input value={values.schedule} onChange={(e) => setValues((prev) => ({ ...prev, schedule: e.target.value }))} placeholder="08:00, 10:30, 13:00" className="field" /></label>
          <label className="block"><span className="label">Assign shuttle</span><select value={assignedShuttleId} onChange={(e) => setAssignedShuttleId(e.target.value)} className="field"><option value="">No shuttle assigned</option>{shuttles.map((shuttle) => <option key={shuttle.id} value={shuttle.id}>{shuttle.id} · {shuttle.vehicleNumber}{shuttle.routeId ? ` · ${routes.find((route) => route.id === shuttle.routeId)?.name ?? 'assigned'}` : ' · unassigned'}</option>)}</select><span className="block text-xs text-muted mt-1">You can assign or reassign a shuttle after creating it.</span></label>
          {errors.length > 0 && <div className="border border-danger/30 bg-danger/10 px-3 py-2.5 rounded-[4px]" role="alert">{errors.map((error) => <p key={error} className="text-xs text-danger font-semibold">{error}</p>)}</div>}
          <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setOpen(false)} className="btn-ghost px-4 py-2.5 text-sm rounded-[4px]">Cancel</button><button type="submit" className="btn-bus px-4 py-2.5 text-sm rounded-[4px]">Save route</button></div>
        </form>
      </Modal>

      <Modal open={shuttleOpen} onClose={() => setShuttleOpen(false)} title="Add shuttle">
        <form onSubmit={saveShuttle} className="space-y-4">
          <label className="block"><span className="label">Vehicle number</span><input value={shuttleValues.vehicleNumber} onChange={(e) => setShuttleValues((prev) => ({ ...prev, vehicleNumber: e.target.value }))} placeholder="PB-10-AZ-1234" className="field" /></label>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block"><span className="label">Route</span><select value={shuttleValues.routeId} onChange={(e) => setShuttleValues((prev) => ({ ...prev, routeId: e.target.value }))} className="field"><option value="">Select route</option>{routes.map((route) => <option key={route.id} value={route.id}>{route.name}</option>)}</select></label>
            <label className="block"><span className="label">Capacity</span><input type="number" min="1" step="1" value={shuttleValues.capacity} onChange={(e) => setShuttleValues((prev) => ({ ...prev, capacity: e.target.value }))} className="field" /></label>
          </div>
          <label className="block"><span className="label">Driver</span><select value={shuttleValues.driverId} onChange={(e) => setShuttleValues((prev) => ({ ...prev, driverId: e.target.value }))} className="field"><option value="">Unassigned</option>{drivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.name} · {driver.vehicleNumber}</option>)}</select></label>
          {shuttleErrors.length > 0 && <div className="border border-danger/30 bg-danger/10 px-3 py-2.5 rounded-[4px]" role="alert">{shuttleErrors.map((error) => <p key={error} className="text-xs text-danger font-semibold">{error}</p>)}</div>}
          <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setShuttleOpen(false)} className="btn-ghost px-4 py-2.5 text-sm rounded-[4px]">Cancel</button><button type="submit" className="btn-bus px-4 py-2.5 text-sm rounded-[4px]">Save shuttle</button></div>
        </form>
      </Modal>
    </Layout>
  )
}
