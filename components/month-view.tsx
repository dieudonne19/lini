"use client"

import { useState } from "react"

import { CalendarSkeleton } from "@/components/calendar-skeleton"
import { CalendarTabs } from "@/components/calendar-tabs"
import { MonthEventList } from "@/components/month-event-list"
import { MonthGrid } from "@/components/month-grid"
import { PeriodNav } from "@/components/period-nav"
import { useIsClient } from "@/hooks/use-is-client"
import { addMonths, fromIsoMonth } from "@/lib/calendar-dates"
import { monthHref, weekHrefForMonth } from "@/lib/calendar-links"
import { formatMonth } from "@/lib/format-date"
import { buildMonth, monthEvents } from "@/lib/month"
import type { Schedule } from "@/lib/schedule"

type MonthViewProps = {
  schedule: Schedule
  // The month asked for in the address ("2026-10").
  month: string
}

// Container: the month depends on the device timezone, so it is laid out in the browser.
// The server renders the skeleton, which keeps hydration identical.
export function MonthView({ schedule, month }: MonthViewProps) {
  const isClient = useIsClient()
  const [today] = useState(() => new Date())

  if (!isClient) return <CalendarSkeleton />
  const first = fromIsoMonth(month)
  const weeks = buildMonth(schedule, first)
  const currentMonth = addMonths(today, 0)

  return (
    <div className="flex flex-col gap-6">
      <CalendarTabs
        current="month"
        weekHref={weekHrefForMonth(first, today)}
        monthHref={monthHref(first)}
      />
      <PeriodNav
        label={formatMonth(first)}
        previousHref={monthHref(addMonths(first, -1))}
        previousLabel="Mois précédent"
        nextHref={monthHref(addMonths(first, 1))}
        nextLabel="Mois suivant"
        currentHref={monthHref(currentMonth)}
        currentLabel="Ce mois-ci"
        isCurrent={first.getTime() === currentMonth.getTime()}
      />
      <MonthGrid weeks={weeks} today={today} />
      <MonthEventList events={monthEvents(weeks)} />
    </div>
  )
}
