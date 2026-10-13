import { addDays, toIsoDate } from "@/lib/calendar-dates"
import type { ScheduleEvent } from "@/lib/schedule"

const utcDate = (date: Date) => date.toISOString().slice(0, 10)

// Whether a family event touches the local day starting at `day` (local midnight).
// An all-day event is a range of UTC dates, the last one included: it stays on the same days in every
// timezone. A timed event touches every local day between its start and its end.
export function eventTouchesDay(event: ScheduleEvent, day: Date) {
  if (event.allDay) {
    const date = toIsoDate(day)
    return utcDate(event.startsAt) <= date && date <= utcDate(event.endsAt)
  }
  const end = Math.max(event.endsAt.getTime(), event.startsAt.getTime() + 1)
  return event.startsAt < addDays(day, 1) && end > day.getTime()
}
