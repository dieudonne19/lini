import type { Schedule, ScheduleActivity, ScheduleMember } from "@/lib/schedule"

// Builders for the schedule tests: three members and activities with the same defaults.
// Dates are built by the tests themselves, after they have set the timezone they depend on.

export const members: ScheduleMember[] = [
  { id: "a", name: "Anna", color: "#3D6DF2", role: "parent" },
  { id: "b", name: "Basile", color: "#F2A93B", role: "child" },
  { id: "c", name: "Clara", color: "#2FB67C", role: "child" },
]

let counter = 0

type Overrides = Partial<Omit<ScheduleActivity, "kind" | "title" | "isPrivate">>

const times = (startsAt: Date, endsAt: Date, overrides: Overrides) => ({
  id: `activity-${counter++}`,
  memberId: "a",
  startsAt,
  endsAt,
  allDay: false,
  repeat: "none" as const,
  repeatUntil: null,
  ...overrides,
})

// An activity the viewer sees in full (their own, or a public one).
export const full = (
  title: string,
  startsAt: Date,
  endsAt: Date,
  overrides: Overrides = {}
): ScheduleActivity => ({
  kind: "full",
  title,
  isPrivate: false,
  ...times(startsAt, endsAt, overrides),
})

// Another member's private activity: it keeps its times and has no title.
export const busy = (
  startsAt: Date,
  endsAt: Date,
  overrides: Overrides = {}
): ScheduleActivity => ({ kind: "busy", ...times(startsAt, endsAt, overrides) })

// An all-day activity: a UTC date, the same day in every timezone.
export const allDayActivity = (
  title: string,
  iso: string,
  overrides: Overrides = {}
): ScheduleActivity =>
  full(
    title,
    new Date(`${iso}T00:00:00.000Z`),
    new Date(`${iso}T00:00:00.000Z`),
    { allDay: true, ...overrides }
  )

export const scheduleOf = (activities: ScheduleActivity[]): Schedule => ({
  members,
  activities,
  events: [],
})
