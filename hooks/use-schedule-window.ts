import { useEffect, useState } from "react"

import { loadScheduleAction } from "@/app/evenements/actions"
import { covers, padRange, type DateRange } from "@/lib/schedule-window"
import type { Schedule } from "@/lib/schedule"

const DEBOUNCE_MS = 300
const PADDING_DAYS = 7

type Loaded = DateRange & { schedule: Schedule }
type Failure = { key: string; message: string }

export type ScheduleWindow =
  | { status: "idle"; schedule: null }
  | { status: "loading"; schedule: null }
  | { status: "error"; schedule: null; message: string; retry: () => void }
  | { status: "ready"; schedule: Schedule }

// The family's schedule around `range`, loaded from the server when the browser does not hold it yet
// (a pause after the last change, then one request with some margin). `schedule` is only given when the
// whole period is loaded: while it loads, or if it failed, there is no schedule, so a screen can never
// take "nothing loaded" for "nobody is busy". An answer that arrives after the period changed is dropped.
export function useScheduleWindow(range: DateRange | null): ScheduleWindow {
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [failure, setFailure] = useState<Failure | null>(null)
  const [attempt, setAttempt] = useState(0)

  const fromMs = range?.from.getTime()
  const toMs = range?.to.getTime()
  const key = range ? `${fromMs}-${toMs}` : null
  const isCovered = range !== null && covers(loaded, range)

  useEffect(() => {
    if (fromMs === undefined || toMs === undefined || isCovered) return
    let stale = false
    const timer = setTimeout(async () => {
      const asked = padRange(
        { from: new Date(fromMs), to: new Date(toMs) },
        PADDING_DAYS
      )
      try {
        const result = await loadScheduleAction(
          asked.from.toISOString(),
          asked.to.toISOString()
        )
        if (stale) return
        if (result.ok) setLoaded({ ...asked, schedule: result.schedule })
        else setFailure({ key: `${fromMs}-${toMs}`, message: result.message })
      } catch {
        if (!stale)
          setFailure({
            key: `${fromMs}-${toMs}`,
            message: "Impossible de lire l'agenda de la famille.",
          })
      }
    }, DEBOUNCE_MS)
    return () => {
      stale = true
      clearTimeout(timer)
    }
  }, [fromMs, toMs, isCovered, attempt])

  if (!range) return { status: "idle", schedule: null }
  if (isCovered && loaded) return { status: "ready", schedule: loaded.schedule }
  if (failure?.key === key) {
    return {
      status: "error",
      schedule: null,
      message: failure.message,
      retry: () => {
        setFailure(null)
        setAttempt((count) => count + 1)
      },
    }
  }
  return { status: "loading", schedule: null }
}
