import { addDays, startOfDay } from "@/lib/calendar-dates"
import { busyIntervals } from "@/lib/busy-time"
import type { Schedule } from "@/lib/schedule"

// When nobody in the family has an activity. Like conflicts, it only needs times and repetitions, never a
// title, and it counts private activities.

export const FREE_SLOT_DEFAULTS = {
  days: 14,
  dayStartHour: 8,
  dayEndHour: 22,
  minMinutes: 120,
} as const

export type FreeSlotOptions = Partial<{
  days: number
  dayStartHour: number
  dayEndHour: number
  minMinutes: number
}>

// A stretch of time where every member is free. `wholeDay` is true when it covers the whole day window.
export type FreeSlot = { start: Date; end: Date; wholeDay: boolean }

const MINUTE_MS = 60 * 1000

// The next half hour (local), or `date` itself when it is already on one.
function nextHalfHour(date: Date) {
  const result = new Date(date)
  if (result.getSeconds() || result.getMilliseconds()) {
    result.setMinutes(result.getMinutes() + 1, 0, 0)
  }
  const remainder = result.getMinutes() % 30
  if (remainder) result.setMinutes(result.getMinutes() + 30 - remainder)
  return result
}

// Free slots of the next `days` days from today, in the device timezone: within each day's window
// (8:00 to 22:00 by default), the stretches of at least `minMinutes` where no member has an activity.
// Today starts at the next half hour. shortcut: the day window and the minimum length are fixed by
// default, make them a choice if families ask for it.
export function findFreeSlots(
  schedule: Pick<Schedule, "activities">,
  now: Date,
  options: FreeSlotOptions = {}
): FreeSlot[] {
  const { days, dayStartHour, dayEndHour, minMinutes } = {
    ...FREE_SLOT_DEFAULTS,
    ...options,
  }
  const first = startOfDay(now)
  const busy = busyIntervals(schedule.activities, first, addDays(first, days))
    .map(({ start, end }) => ({ start, end }))
    .sort((a, b) => a.start - b.start)

  const slots: FreeSlot[] = []
  for (let index = 0; index < days; index++) {
    const day = addDays(first, index)
    const dayStart = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      dayStartHour
    )
    const dayEnd = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      dayEndHour
    )
    const windowStart =
      index === 0 ? maxDate(dayStart, nextHalfHour(now)) : dayStart

    // Walk through the day: each busy interval that touches the window closes the free stretch before it.
    let cursor = windowStart.getTime()
    const limit = dayEnd.getTime()
    const pushSlot = (from: number, to: number) => {
      if (to - from >= minMinutes * MINUTE_MS) {
        slots.push({
          start: new Date(from),
          end: new Date(to),
          wholeDay: from === dayStart.getTime() && to === limit,
        })
      }
    }
    for (const interval of busy) {
      if (interval.end <= cursor || interval.start >= limit) continue
      pushSlot(cursor, Math.min(interval.start, limit))
      cursor = Math.max(cursor, interval.end)
      if (cursor >= limit) break
    }
    if (cursor < limit) pushSlot(cursor, limit)
  }
  return slots
}

const maxDate = (a: Date, b: Date) => (a > b ? a : b)

// The slots grouped by local day, in order: what the list of free slots shows under each day's heading.
export function groupSlotsByDay(slots: FreeSlot[]) {
  const days = new Map<number, { day: Date; slots: FreeSlot[] }>()
  for (const slot of slots) {
    const day = startOfDay(slot.start)
    const group = days.get(day.getTime()) ?? { day, slots: [] }
    group.slots.push(slot)
    days.set(day.getTime(), group)
  }
  return [...days.values()]
}
