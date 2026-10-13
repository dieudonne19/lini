import { buildAgendaDays, type AgendaItem } from "@/lib/agenda"
import { weekDays } from "@/lib/calendar-dates"
import { eventTouchesDay } from "@/lib/calendar-events"
import type {
  Schedule,
  ScheduleActivity,
  ScheduleEvent,
  ScheduleMember,
} from "@/lib/schedule"

export type ScheduleItem = AgendaItem<ScheduleActivity>

// One row per member; `days[i]` holds that member's occurrences on `Week.days[i]`.
export type WeekRow = { member: ScheduleMember; days: ScheduleItem[][] }

// `days` are the seven local days from Monday; `events[i]` are the family events touching `days[i]`.
export type Week = { days: Date[]; rows: WeekRow[]; events: ScheduleEvent[][] }

// Lays the schedule out as a week starting at `start` (a local Monday), in the device timezone.
export function buildWeek(schedule: Schedule, start: Date): Week {
  const days = weekDays(start)
  const itemsByDay = new Map(
    buildAgendaDays(schedule.activities, days[0], 7).map((day) => [
      day.date.getTime(),
      day.items,
    ])
  )
  return {
    days,
    rows: schedule.members.map((member) => ({
      member,
      days: days.map((day) =>
        (itemsByDay.get(day.getTime()) ?? []).filter(
          (item) => item.activity.memberId === member.id
        )
      ),
    })),
    events: days.map((day) =>
      schedule.events.filter((event) => eventTouchesDay(event, day))
    ),
  }
}
