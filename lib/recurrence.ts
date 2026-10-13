import type { Activity } from "@/lib/generated/prisma/client"

export type RecurringActivity = Pick<
  Activity,
  "startsAt" | "endsAt" | "allDay" | "repeat" | "repeatUntil"
>
export type Occurrence = Pick<Activity, "startsAt" | "endsAt" | "allDay">

const DAY_MS = 24 * 60 * 60 * 1000
const STEP_DAYS = { daily: 1, weekly: 7 } as const

// Occurrences of an activity that overlap the window [from, to).
// Timed occurrences keep their wall-clock time across daylight-saving changes: the day is advanced with
// the runtime's local calendar, so the result follows the device timezone (UTC on the server).
// All-day occurrences are advanced in UTC, so they stay on the same calendar day in every timezone.
export function expandActivity(
  activity: RecurringActivity,
  from: Date,
  to: Date
): Occurrence[] {
  const { startsAt, endsAt, allDay, repeat, repeatUntil } = activity
  const duration = endsAt.getTime() - startsAt.getTime()
  // An all-day activity covers the whole day starting at startsAt.
  const occupiedMs = allDay ? duration + DAY_MS : duration
  const overlaps = (start: Date) =>
    start < to && start.getTime() + occupiedMs > from.getTime()

  if (repeat === "none")
    return overlaps(startsAt) ? [{ startsAt, endsAt, allDay }] : []

  const stepDays = STEP_DAYS[repeat]
  const occurrenceStart = (index: number) => {
    const start = new Date(startsAt)
    if (allDay) start.setUTCDate(start.getUTCDate() + index * stepDays)
    else start.setDate(start.getDate() + index * stepDays)
    return start
  }

  // Skip ahead to just before the window; one step back absorbs the 1-hour daylight-saving shift.
  const elapsed = from.getTime() - startsAt.getTime() - occupiedMs
  const first = Math.max(0, Math.floor(elapsed / (stepDays * DAY_MS)) - 1)

  const occurrences: Occurrence[] = []
  for (let index = first; ; index++) {
    const start = occurrenceStart(index)
    if (start >= to || (repeatUntil && start > repeatUntil)) break
    if (overlaps(start))
      occurrences.push({
        startsAt: start,
        endsAt: new Date(start.getTime() + duration),
        allDay,
      })
  }
  return occurrences
}
