import { addDays } from "@/lib/calendar-dates"
import {
  expandActivity,
  type Occurrence,
  type RecurringActivity,
} from "@/lib/recurrence"

// When the members are busy, for conflicts and free slots. It only needs the times and the repetition of
// an activity, never its title: this works on the masked schedule, where another member's private
// activity has no title at all.

const DAY_MS = 24 * 60 * 60 * 1000

export type BusyInterval = { memberId: string; start: number; end: number }

// The local day (midnight) of a UTC date: an all-day item is a date, the same day in every timezone.
export function localDayOfUtcDate(date: Date) {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

// The time an occurrence keeps its member busy, as epoch milliseconds [start, end).
// An all-day occurrence fills the whole local day of its date.
function occupiedInterval({ startsAt, endsAt, allDay }: Occurrence) {
  if (!allDay) return { start: startsAt.getTime(), end: endsAt.getTime() }
  const day = localDayOfUtcDate(startsAt)
  return { start: day.getTime(), end: addDays(day, 1).getTime() }
}

// Every busy interval that overlaps [from, to), repetitions included, in the device timezone.
export function busyIntervals(
  activities: (RecurringActivity & { memberId: string })[],
  from: Date,
  to: Date
): BusyInterval[] {
  // One day of margin on each side: an all-day occurrence is anchored in UTC and can shift by a day.
  const padded = [
    new Date(from.getTime() - DAY_MS),
    new Date(to.getTime() + DAY_MS),
  ] as const
  return activities
    .flatMap((activity) =>
      expandActivity(activity, ...padded).map((occurrence) => ({
        memberId: activity.memberId,
        ...occupiedInterval(occurrence),
      }))
    )
    .filter(
      (interval) =>
        interval.start < to.getTime() && interval.end > from.getTime()
    )
}
