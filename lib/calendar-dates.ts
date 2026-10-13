// Calendar date helpers in the device timezone. Days are local midnights, and are advanced with the
// local calendar (not by adding 24 hours), so a week always has 7 days even when the clocks change.

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function addDays(date: Date, days: number) {
  const result = startOfDay(date)
  result.setDate(result.getDate() + days)
  return result
}

// Monday 00:00 of the week containing `date`.
export function startOfWeek(date: Date) {
  const day = startOfDay(date)
  return addDays(day, -((day.getDay() + 6) % 7))
}

export function weekDays(start: Date) {
  return Array.from({ length: 7 }, (_, index) => addDays(start, index))
}

// First day of the month `months` months after the one containing `date`.
export function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

const pad = (value: number) => String(value).padStart(2, "0")

// "2026-10-14" and "2026-10", from the local calendar.
export const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
export const toIsoMonth = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}`

// Local midnight of "2026-10-14", and the first of "2026-10".
export function fromIsoDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number)
  return new Date(year, month - 1, day)
}
export function fromIsoMonth(iso: string) {
  const [year, month] = iso.split("-").map(Number)
  return new Date(year, month - 1, 1)
}
