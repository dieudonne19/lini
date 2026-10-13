import { z } from "zod"

// The displayed period lives in the address: `?du=2026-10-12` (a week) or `?mois=2026-10` (a month).
// The server reads only the window around it. These functions work on dates, not on a timezone.

const DAY_MS = 24 * 60 * 60 * 1000
const dateParam = z.iso.date()
const monthParam = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)

const utcDay = (iso: string) => new Date(`${iso}T00:00:00.000Z`)
const utcMondayOf = (date: Date) =>
  new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() - ((date.getUTCDay() + 6) % 7)
    )
  )

// Any valid date -> the Monday ("2026-10-12") of its week. Anything else -> undefined (use the default).
export function parseWeekParam(value: string | undefined) {
  const parsed = dateParam.safeParse(value)
  return parsed.success
    ? utcMondayOf(utcDay(parsed.data)).toISOString().slice(0, 10)
    : undefined
}

// "2026-10" -> "2026-10". Anything else -> undefined.
export function parseMonthParam(value: string | undefined) {
  const parsed = monthParam.safeParse(value)
  return parsed.success ? parsed.data : undefined
}

// The week asked for, with a week on each side so the neighbours are already there. Without a parameter:
// the week of today in UTC. The device may be up to 14 hours ahead or behind, which moves "today" by at
// most one day: its own current week is always inside this window.
export function weekWindow(monday: string | undefined, now: Date) {
  const base = monday ? utcDay(monday) : utcMondayOf(now)
  return {
    from: new Date(base.getTime() - 7 * DAY_MS),
    to: new Date(base.getTime() + 14 * DAY_MS),
  }
}

// The month asked for ("2026-10") with the days of the neighbouring weeks its grid shows. The month view
// always has an explicit month in its address, so the window never depends on the device's "today".
export function monthWindow(month: string) {
  const [year, number] = month.split("-").map(Number)
  const first = Date.UTC(year, number - 1, 1)
  const nextFirst = Date.UTC(year, number, 1)
  return {
    from: new Date(first - 8 * DAY_MS),
    to: new Date(nextFirst + 8 * DAY_MS),
  }
}
