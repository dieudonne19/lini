import { useMemo, useState } from "react"

import { useScheduleWindow } from "@/hooks/use-schedule-window"
import { addDays, startOfDay } from "@/lib/calendar-dates"
import { findFreeSlots, FREE_SLOT_DEFAULTS } from "@/lib/free-slots"

// The free slots of the next 14 days. The family's schedule is only read once `enabled` is true (the panel is
// open), so nothing is asked from the server for people who never look. `now` is taken when the form opens.
export function useFreeSlots(enabled: boolean) {
  const [now] = useState(() => new Date())
  const range = useMemo(() => {
    if (!enabled) return null
    const today = startOfDay(now)
    return { from: today, to: addDays(today, FREE_SLOT_DEFAULTS.days) }
  }, [enabled, now])
  const window = useScheduleWindow(range)
  const schedule = window.schedule
  const slots = useMemo(
    () => (schedule ? findFreeSlots(schedule, now) : []),
    [schedule, now]
  )
  return {
    status: window.status,
    slots,
    today: startOfDay(now),
    retry: window.status === "error" ? window.retry : undefined,
  }
}
