import { Route } from '../types'

export interface RouteDraft {
  id?: string
  name: string
  source: string
  destination: string
  stops: string[]
  fare: number
  schedule: string[]
}

export function validateRoute(draft: RouteDraft, routes: Route[], editingId?: string): string[] {
  const errors: string[] = []
  const normalizedName = draft.name.trim().toLowerCase()
  const normalizedStops = draft.stops.map((stop) => stop.trim()).filter(Boolean)
  const duplicateName = routes.some((route) => route.id !== editingId && route.name.trim().toLowerCase() === normalizedName)

  if (!draft.name.trim() || !draft.source.trim() || !draft.destination.trim()) errors.push('Name, source, and destination are required.')
  if (duplicateName) errors.push('Route names must be unique.')
  if (draft.id && routes.some((route) => route.id === draft.id && route.id !== editingId)) errors.push('Route IDs must be unique.')
  if (normalizedStops.length < 2) errors.push('Add at least two ordered stops.')
  if (new Set(normalizedStops.map((stop) => stop.toLowerCase())).size !== normalizedStops.length) errors.push('Stops must be unique.')
  if (normalizedStops[0]?.toLowerCase() !== draft.source.trim().toLowerCase()) errors.push('The first stop must match the source.')
  if (normalizedStops[normalizedStops.length - 1]?.toLowerCase() !== draft.destination.trim().toLowerCase()) errors.push('The last stop must match the destination.')
  if (!Number.isFinite(draft.fare) || draft.fare <= 0) errors.push('Fare must be greater than zero.')
  if (draft.schedule.length === 0 || draft.schedule.some((slot) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(slot))) errors.push('Use valid schedule times such as 08:30, separated by commas.')
  if (new Set(draft.schedule).size !== draft.schedule.length) errors.push('Schedule times must be unique.')

  return errors
}
