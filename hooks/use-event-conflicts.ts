import { useMemo } from "react"

import { useScheduleWindow } from "@/hooks/use-schedule-window"
import { findConflicts, type EventTimes } from "@/lib/conflicts"

const DAY_MS = 24 * 60 * 60 * 1000

// The members who are busy during the event being typed. `conflicts` is only filled once the family's
// schedule for that period is loaded: until then the status says "loading" (or "error"), never "nobody".
export function useEventConflicts(times: EventTimes | null) {
  const range = useMemo(
    () =>
      times && {
        from: times.startsAt,
        // An all-day event covers its last day entirely.
        to: new Date(times.endsAt.getTime() + (times.allDay ? DAY_MS : 0)),
      },
    [times]
  )
  const window = useScheduleWindow(range)
  const schedule = window.schedule
  const conflicts = useMemo(
    () => (schedule && times ? findConflicts(schedule, times) : []),
    [schedule, times]
  )
  return {
    status: window.status,
    conflicts,
    retry: window.status === "error" ? window.retry : undefined,
  }
}
