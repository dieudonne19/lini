import type { Activity } from "@/lib/generated/prisma/client"
import {
  expandActivity,
  type Occurrence,
  type RecurringActivity,
} from "@/lib/recurrence"

export type AgendaActivity = Pick<
  Activity,
  | "id"
  | "title"
  | "startsAt"
  | "endsAt"
  | "allDay"
  | "isPrivate"
  | "repeat"
  | "repeatUntil"
>

// One occurrence of an activity, on the day it starts. Generic so the week and month views can
// reuse it with their own activity type (which may have no title).
export type AgendaItem<T extends RecurringActivity = AgendaActivity> =
  Occurrence & { activity: T }

// `date` is local midnight of the day.
export type AgendaDay<T extends RecurringActivity = AgendaActivity> = {
  date: Date
  items: AgendaItem<T>[]
}

const DAY_MS = 24 * 60 * 60 * 1000

// The local calendar day an occurrence belongs to. An all-day occurrence is anchored in UTC:
// its UTC date is the day shown, whatever the device timezone.
function localDay({ startsAt, allDay }: Occurrence) {
  return allDay
    ? new Date(
        startsAt.getUTCFullYear(),
        startsAt.getUTCMonth(),
        startsAt.getUTCDate()
      )
    : new Date(startsAt.getFullYear(), startsAt.getMonth(), startsAt.getDate())
}

// The days that have something to show among the `dayCount` days starting today, in the device timezone.
// shortcut: an occurrence that crosses midnight is listed on the day it starts only; revisit with the week view.
export function buildAgendaDays<T extends RecurringActivity>(
  activities: T[],
  today: Date,
  dayCount: number
): AgendaDay<T>[] {
  const first = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const end = new Date(first)
  end.setDate(end.getDate() + dayCount)
  // Expand one day beyond each edge: all-day occurrences are anchored in UTC and can shift by a day.
  const window = [
    new Date(first.getTime() - DAY_MS),
    new Date(end.getTime() + DAY_MS),
  ] as const

  const days = new Map<number, AgendaDay<T>>()
  for (const activity of activities) {
    for (const occurrence of expandActivity(activity, ...window)) {
      const date = localDay(occurrence)
      if (date < first || date >= end) continue
      const day = days.get(date.getTime()) ?? { date, items: [] }
      day.items.push({ ...occurrence, activity })
      days.set(date.getTime(), day)
    }
  }

  return [...days.values()]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((day) => ({
      ...day,
      // All-day first, then by start time.
      items: day.items.sort(
        (a, b) =>
          Number(b.allDay) - Number(a.allDay) ||
          a.startsAt.getTime() - b.startsAt.getTime()
      ),
    }))
}
