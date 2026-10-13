import { buildAgendaDays } from "@/lib/agenda"
import { addDays, startOfWeek } from "@/lib/calendar-dates"
import { eventTouchesDay } from "@/lib/calendar-events"
import type { Schedule, ScheduleEvent, ScheduleMember } from "@/lib/schedule"

// A day of the month grid: who is busy (public or private, only the fact is shown) and the family events.
export type MonthDay = {
  date: Date
  inMonth: boolean
  busyMembers: ScheduleMember[]
  events: ScheduleEvent[]
}

// The month as whole weeks from Monday (4 to 6 rows), so the grid is always a rectangle.
export function monthGrid(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  const start = startOfWeek(first)
  const end = addDays(startOfWeek(last), 7)
  const weeks: Date[][] = []
  for (let week = start; week < end; week = addDays(week, 7)) {
    weeks.push(Array.from({ length: 7 }, (_, index) => addDays(week, index)))
  }
  return weeks
}

// Lays the schedule out as the grid of `month`, in the device timezone.
export function buildMonth(schedule: Schedule, month: Date): MonthDay[][] {
  const grid = monthGrid(month)
  const busyByDay = new Map<number, Set<string>>()
  for (const day of buildAgendaDays(
    schedule.activities,
    grid[0][0],
    grid.length * 7
  )) {
    busyByDay.set(
      day.date.getTime(),
      new Set(day.items.map((item) => item.activity.memberId))
    )
  }
  return grid.map((week) =>
    week.map((date) => {
      const busy = busyByDay.get(date.getTime())
      return {
        date,
        inMonth: date.getMonth() === month.getMonth(),
        // In the order the members joined the family.
        busyMembers: schedule.members.filter((member) => busy?.has(member.id)),
        events: schedule.events.filter((event) => eventTouchesDay(event, date)),
      }
    })
  )
}
