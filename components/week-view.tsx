"use client"

import { useState } from "react"

import { CalendarSkeleton } from "@/components/calendar-skeleton"
import { CalendarTabs } from "@/components/calendar-tabs"
import { PeriodNav } from "@/components/period-nav"
import { WeekDayList } from "@/components/week-day-list"
import { WeekEmpty } from "@/components/week-empty"
import { WeekGrid } from "@/components/week-grid"
import { useIsClient } from "@/hooks/use-is-client"
import { addDays, fromIsoDate, startOfWeek } from "@/lib/calendar-dates"
import { monthHref, weekHref } from "@/lib/calendar-links"
import { formatWeekRange } from "@/lib/format-date"
import type { Schedule } from "@/lib/schedule"
import { buildWeek } from "@/lib/week"

type WeekViewProps = {
  schedule: Schedule
  // The Monday asked for in the address ("2026-10-12"), or undefined for the current week.
  monday: string | undefined
}

// Container: the week depends on the device timezone, so it is laid out in the browser.
// The server renders the skeleton, which keeps hydration identical.
export function WeekView({ schedule, monday }: WeekViewProps) {
  const isClient = useIsClient()
  const [today] = useState(() => new Date())

  if (!isClient) return <CalendarSkeleton />
  const currentWeek = startOfWeek(today)
  const start = monday ? fromIsoDate(monday) : currentWeek
  const week = buildWeek(schedule, start)
  const isEmpty =
    week.rows.every((row) => row.days.every((day) => day.length === 0)) &&
    week.events.every((events) => events.length === 0)

  return (
    <div className="flex flex-col gap-6">
      <CalendarTabs
        current="week"
        weekHref={weekHref(start)}
        monthHref={monthHref(start)}
      />
      <PeriodNav
        label={formatWeekRange(start)}
        previousHref={weekHref(addDays(start, -7))}
        previousLabel="Semaine précédente"
        nextHref={weekHref(addDays(start, 7))}
        nextLabel="Semaine suivante"
        currentHref="/"
        currentLabel="Aujourd'hui"
        isCurrent={start.getTime() === currentWeek.getTime()}
      />
      {isEmpty && <WeekEmpty />}
      <WeekGrid week={week} today={today} />
      <WeekDayList week={week} today={today} />
    </div>
  )
}
