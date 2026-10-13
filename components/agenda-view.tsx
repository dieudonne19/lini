"use client"

import { useState } from "react"

import { AgendaDayList } from "@/components/agenda-day-list"
import { AgendaEmpty } from "@/components/agenda-empty"
import { AgendaSkeleton } from "@/components/agenda-skeleton"
import { useIsClient } from "@/hooks/use-is-client"
import { buildAgendaDays, type AgendaActivity } from "@/lib/agenda"

const DAYS_SHOWN = 14

// Container: occurrences depend on the device timezone, so they are computed in the browser.
// The skeleton is what the server renders, which keeps hydration identical.
export function AgendaView({ activities }: { activities: AgendaActivity[] }) {
  const isClient = useIsClient()
  const [today] = useState(() => new Date())

  if (!isClient) return <AgendaSkeleton />
  const days = buildAgendaDays(activities, today, DAYS_SHOWN)
  return days.length ? (
    <AgendaDayList days={days} today={today} />
  ) : (
    <AgendaEmpty />
  )
}
