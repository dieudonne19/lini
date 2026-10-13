"use client"

import { useState } from "react"

import { WeekDayList } from "@/components/week-day-list"
import { WeekEmpty } from "@/components/week-empty"
import { WeekGrid } from "@/components/week-grid"
import { WeekNav } from "@/components/week-nav"
import { WeekSkeleton } from "@/components/week-skeleton"
import { useIsClient } from "@/hooks/use-is-client"
import {
  addDays,
  fromIsoDate,
  startOfWeek,
  toIsoDate,
} from "@/lib/calendar-dates"
import { formatWeekRange } from "@/lib/format-date"
import type { Schedule } from "@/lib/schedule"
import { buildWeek } from "@/lib/week"

type WeekViewProps = {
  schedule: Schedule
  // The Monday asked for in the address ("2026-10-12"), or undefined for the current week.
  monday: string | undefined
}

const weekHref = (monday: Date) => `/?du=${toIsoDate(monday)}`

// Container: the week depends on the device timezone, so it is laid out in the browser.
// The server renders the skeleton, which keeps hydration identical.
export function WeekView({ schedule, monday }: WeekViewProps) {
  const isClient = useIsClient()
  const [today] = useState(() => new Date())

  if (!isClient) return <WeekSkeleton />
  const currentWeek = startOfWeek(today)
  const start = monday ? fromIsoDate(monday) : currentWeek
  const week = buildWeek(schedule, start)
  const isEmpty =
    week.rows.every((row) => row.days.every((day) => day.length === 0)) &&
    week.events.every((events) => events.length === 0)

  return (
    <div className="flex flex-col gap-6">
      <WeekNav
        label={formatWeekRange(start)}
        previousHref={weekHref(addDays(start, -7))}
        nextHref={weekHref(addDays(start, 7))}
        todayHref="/"
        isCurrentWeek={start.getTime() === currentWeek.getTime()}
      />
      {isEmpty && <WeekEmpty />}
      <WeekGrid week={week} today={today} />
      <WeekDayList week={week} today={today} />
    </div>
  )
}
