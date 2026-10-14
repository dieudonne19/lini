import { addDays } from "@/lib/calendar-dates"
import { busyIntervals, localDayOfUtcDate } from "@/lib/busy-time"
import type { Schedule, ScheduleMember } from "@/lib/schedule"

export type EventTimes = { startsAt: Date; endsAt: Date; allDay: boolean }

// The time an event takes, as epoch milliseconds [start, end). An all-day event fills the whole local
// days from its first date to its last date, the last one included.
function eventInterval({ startsAt, endsAt, allDay }: EventTimes) {
  if (!allDay) return { start: startsAt.getTime(), end: endsAt.getTime() }
  return {
    start: localDayOfUtcDate(startsAt).getTime(),
    end: addDays(localDayOfUtcDate(endsAt), 1).getTime(),
  }
}

// The members who have an activity during the event, in the order they joined the family. An activity
// counts whether it is private or not, repetitions included, and it only counts when the two really
// overlap: finishing when the event starts is not a conflict. Only the member is named: the schedule
// holds no title for another member's private activity, and the titles of the others are never read.
export function findConflicts(
  schedule: Pick<Schedule, "members" | "activities">,
  event: EventTimes
): ScheduleMember[] {
  const { start, end } = eventInterval(event)
  if (end <= start) return []

  // busyIntervals keeps only what really overlaps [start, end): touching does not count.
  const busyMembers = new Set(
    busyIntervals(schedule.activities, new Date(start), new Date(end)).map(
      (interval) => interval.memberId
    )
  )
  return schedule.members.filter((member) => busyMembers.has(member.id))
}
