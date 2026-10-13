import { db } from "@/lib/db"
import type { Member, Repeat, Role } from "@/lib/generated/prisma/client"

// The single function that reads other members' activities. A private activity of someone else becomes
// "busy": it keeps the times and the repetition but has no title (the key does not exist), so no screen
// can show a title it was never given.

type ActivityTimes = {
  id: string
  memberId: string
  startsAt: Date
  endsAt: Date
  allDay: boolean
  repeat: Repeat
  repeatUntil: Date | null
}

export type ScheduleActivity =
  | (ActivityTimes & { kind: "full"; title: string; isPrivate: boolean })
  | (ActivityTimes & { kind: "busy" })

export type ScheduleMember = {
  id: string
  name: string
  color: string
  role: Role
}

export type ScheduleEvent = {
  id: string
  title: string
  place: string | null
  startsAt: Date
  endsAt: Date
  allDay: boolean
}

export type Schedule = {
  members: ScheduleMember[]
  activities: ScheduleActivity[]
  events: ScheduleEvent[]
}

const DAY_MS = 24 * 60 * 60 * 1000
// Longest window accepted: a six-week month grid plus its margins.
const MAX_WINDOW_MS = 70 * DAY_MS

// The family's members, their activities and the confirmed family events that can touch [from, to).
// The window is widened by one day on each side because the browser lays days out in the device
// timezone (up to 14 hours from UTC); the browser keeps only what overlaps the days it shows.
export async function listFamilySchedule(
  viewer: Pick<Member, "id" | "familyId">,
  { from, to }: { from: Date; to: Date }
): Promise<Schedule> {
  if (!(from < to) || to.getTime() - from.getTime() > MAX_WINDOW_MS) {
    throw new RangeError("The schedule window must be between 0 and 70 days")
  }
  const start = new Date(from.getTime() - DAY_MS)
  const end = new Date(to.getTime() + DAY_MS)
  // An all-day activity covers the day after its startsAt, so look one more day back.
  const endedBefore = new Date(start.getTime() - DAY_MS)

  const [members, activities, events] = await Promise.all([
    db.member.findMany({
      where: { familyId: viewer.familyId },
      select: { id: true, name: true, color: true, role: true },
      orderBy: { createdAt: "asc" },
    }),
    db.activity.findMany({
      where: {
        member: { familyId: viewer.familyId },
        startsAt: { lt: end },
        OR: [
          { repeat: "none", endsAt: { gt: endedBefore } },
          {
            repeat: { not: "none" },
            OR: [{ repeatUntil: null }, { repeatUntil: { gte: endedBefore } }],
          },
        ],
      },
      orderBy: { startsAt: "asc" },
    }),
    db.familyEvent.findMany({
      where: {
        familyId: viewer.familyId,
        status: "confirmed",
        startsAt: { lt: end },
        endsAt: { gt: endedBefore },
      },
      select: {
        id: true,
        title: true,
        place: true,
        startsAt: true,
        endsAt: true,
        allDay: true,
      },
      orderBy: { startsAt: "asc" },
    }),
  ])

  return {
    members,
    activities: activities.map((activity): ScheduleActivity => {
      const { id, memberId, startsAt, endsAt, allDay, repeat, repeatUntil } =
        activity
      const times = {
        id,
        memberId,
        startsAt,
        endsAt,
        allDay,
        repeat,
        repeatUntil,
      }
      if (activity.isPrivate && activity.memberId !== viewer.id)
        return { kind: "busy", ...times }
      return {
        kind: "full",
        ...times,
        title: activity.title,
        isPrivate: activity.isPrivate,
      }
    }),
    events,
  }
}
