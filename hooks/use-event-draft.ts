import { useMemo, useState } from "react"

import { eventTimesFromFields, type WhenFields } from "@/lib/event-form"

const EMPTY: WhenFields = {
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  allDay: false,
}

// The dates and times being typed in the event form. They live here, not in the fields themselves, so the
// conflict preview can read them and the free slots can fill them. `times` is the event's instants, or
// null while the dates are incomplete or not valid.
export function useEventDraft(initial: Partial<WhenFields> = {}) {
  const [when, setWhen] = useState<WhenFields>({ ...EMPTY, ...initial })
  const times = useMemo(() => eventTimesFromFields(when), [when])
  return {
    when,
    times,
    change: (patch: Partial<WhenFields>) =>
      setWhen((current) => ({ ...current, ...patch })),
  }
}
