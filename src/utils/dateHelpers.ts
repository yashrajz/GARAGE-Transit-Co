// Small date helpers used throughout the app. Kept dependency-free on purpose.

// How often booking views refresh the current time so past departures drop off.
export const DEPARTURE_REFRESH_MS = 30_000

export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function localTodayISO(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function addDays(base: Date, days: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}

export function isoDaysFromToday(days: number): string {
  return toISODate(addDays(new Date(), days))
}

export function formatDateLabel(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

export function formatHour(hour: number): string {
  const h = Math.floor(hour)
  const mins = Math.round((hour - h) * 60)
  const period = h >= 12 ? 'PM' : 'AM'
  const displayHour = h % 12 === 0 ? 12 : h % 12
  return `${displayHour}:${mins.toString().padStart(2, '0')} ${period}`
}

export function parseTimeSlotToHour(slot: string): number {
  const [h, m] = slot.split(':').map(Number)
  return h + m / 60
}

// True when two half-open time ranges share any hours.
export function timeRangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd
}
