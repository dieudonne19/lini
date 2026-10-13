import { afterAll, describe, expect, it } from "vitest"

import {
  addDays,
  addMonths,
  fromIsoDate,
  fromIsoMonth,
  startOfWeek,
  toIsoDate,
  toIsoMonth,
  weekDays,
} from "@/lib/calendar-dates"
import type { Schedule, ScheduleActivity, ScheduleMember } from "@/lib/schedule"
import { buildWeek } from "@/lib/week"

// Depends on the runtime timezone: set it explicitly, before any date below is built, and restore it afterwards.
const originalTz = process.env.TZ
process.env.TZ = "Europe/Paris"
afterAll(() => {
  if (originalTz === undefined) delete process.env.TZ
  else process.env.TZ = originalTz
})

const members: ScheduleMember[] = [
  { id: "a", name: "Anna", color: "#3D6DF2", role: "parent" },
  { id: "b", name: "Basile", color: "#F2A93B", role: "child" },
  { id: "c", name: "Clara", color: "#2FB67C", role: "child" },
]

let counter = 0
const times = (overrides: Partial<ScheduleActivity> = {}) => ({
  id: `activity-${counter++}`,
  memberId: "a",
  startsAt: new Date(2026, 9, 14, 18), // Wednesday 14 October 2026, 18:00 local
  endsAt: new Date(2026, 9, 14, 19),
  allDay: false,
  repeat: "none" as const,
  repeatUntil: null,
  ...overrides,
})
const full = (title: string, overrides: Partial<ScheduleActivity> = {}) =>
  ({
    kind: "full",
    title,
    isPrivate: false,
    ...times(overrides),
  }) as ScheduleActivity
const busy = (overrides: Partial<ScheduleActivity> = {}) =>
  ({ kind: "busy", ...times(overrides) }) as ScheduleActivity
const allDay = (iso: string, overrides: Partial<ScheduleActivity> = {}) =>
  ({
    startsAt: new Date(`${iso}T00:00:00.000Z`),
    endsAt: new Date(`${iso}T00:00:00.000Z`),
    allDay: true,
    ...overrides,
  }) as Partial<ScheduleActivity>

const schedule = (
  activities: ScheduleActivity[],
  events: Schedule["events"] = []
): Schedule => ({
  members,
  activities,
  events,
})

const MONDAY = new Date(2026, 9, 12) // the week of 12 October 2026

describe("calendar dates", () => {
  it("finds the Monday of the week from any day, Sunday included", () => {
    for (let day = 12; day <= 18; day++) {
      expect(toIsoDate(startOfWeek(new Date(2026, 9, day, 15)))).toBe(
        "2026-10-12"
      )
    }
  })

  it("has seven midnights in the weeks where the clocks change", () => {
    for (const monday of [new Date(2026, 2, 23), new Date(2026, 9, 19)]) {
      const days = weekDays(monday)
      expect(days).toHaveLength(7)
      expect(
        days.every((day) => day.getHours() === 0 && day.getMinutes() === 0)
      ).toBe(true)
      expect(new Set(days.map((day) => day.getTime())).size).toBe(7)
    }
    expect(weekDays(new Date(2026, 2, 23)).map((day) => day.getDate())).toEqual(
      [23, 24, 25, 26, 27, 28, 29]
    )
  })

  it("moves by whole days and months, across month and year ends", () => {
    expect(toIsoDate(addDays(new Date(2026, 11, 30), 3))).toBe("2027-01-02")
    expect(toIsoMonth(addMonths(new Date(2026, 11, 15), 1))).toBe("2027-01")
    expect(toIsoMonth(addMonths(new Date(2026, 0, 31), -1))).toBe("2025-12")
    expect(toIsoMonth(addMonths(new Date(2026, 0, 31), 1))).toBe("2026-02")
  })

  it("converts to and from ISO strings", () => {
    expect(toIsoDate(fromIsoDate("2026-10-14"))).toBe("2026-10-14")
    expect(toIsoMonth(fromIsoMonth("2026-02"))).toBe("2026-02")
    expect(fromIsoDate("2026-10-14").getHours()).toBe(0)
  })
})

describe("buildWeek", () => {
  it("has one row per member in the family order, and seven days", () => {
    const week = buildWeek(schedule([]), MONDAY)
    expect(week.rows.map((row) => row.member.name)).toEqual([
      "Anna",
      "Basile",
      "Clara",
    ])
    expect(week.days).toHaveLength(7)
    expect(week.rows.every((row) => row.days.length === 7)).toBe(true)
    expect(week.events).toHaveLength(7)
  })

  it("puts each occurrence in its member's row and on its day", () => {
    const week = buildWeek(
      schedule([
        full("Danse", { memberId: "a" }),
        full("Foot", {
          memberId: "b",
          startsAt: new Date(2026, 9, 16, 10),
          endsAt: new Date(2026, 9, 16, 11),
        }),
      ]),
      MONDAY
    )
    const titles = (row: number, day: number) =>
      week.rows[row].days[day].map((item) =>
        item.activity.kind === "full" ? item.activity.title : "busy"
      )
    expect(titles(0, 2)).toEqual(["Danse"]) // Anna, Wednesday
    expect(titles(1, 4)).toEqual(["Foot"]) // Basile, Friday
    expect(week.rows.flatMap((row) => row.days).flat()).toHaveLength(2)
  })

  it("keeps a busy activity without a title all the way into the week", () => {
    const week = buildWeek(schedule([busy({ memberId: "b" })]), MONDAY)
    const [item] = week.rows[1].days[2]
    expect(item.activity.kind).toBe("busy")
    expect(item.activity).not.toHaveProperty("title")
    expect(JSON.stringify(week)).not.toContain("title")
  })

  it("lists the all-day activity first, then the others by start time", () => {
    const week = buildWeek(
      schedule([
        full("Soir"),
        full("Matin", {
          startsAt: new Date(2026, 9, 14, 8),
          endsAt: new Date(2026, 9, 14, 9),
        }),
        full("Journee", allDay("2026-10-14")),
      ]),
      MONDAY
    )
    expect(
      week.rows[0].days[2].map((item) =>
        item.activity.kind === "full" ? item.activity.title : ""
      )
    ).toEqual(["Journee", "Matin", "Soir"])
  })

  it("shows a weekly activity on its weekday only, from its start and up to its end", () => {
    const weekly = full("Cours", {
      startsAt: new Date(2026, 8, 30, 18), // Wednesday 30 September
      endsAt: new Date(2026, 8, 30, 19),
      repeat: "weekly",
      repeatUntil: new Date(2026, 9, 14, 23, 59, 59),
    })
    const count = (monday: Date) =>
      buildWeek(schedule([weekly]), monday).rows[0].days.map(
        (day) => day.length
      )
    expect(count(new Date(2026, 9, 12))).toEqual([0, 0, 1, 0, 0, 0, 0]) // 14 October: the last one
    expect(count(new Date(2026, 9, 19))).toEqual([0, 0, 0, 0, 0, 0, 0]) // ended
    expect(count(new Date(2026, 8, 28))).toEqual([0, 0, 1, 0, 0, 0, 0]) // 30 September: the first one
    expect(count(new Date(2026, 8, 21))).toEqual([0, 0, 0, 0, 0, 0, 0]) // before it started
  })

  it("keeps an all-day activity on the same weekday in every timezone", () => {
    for (const tz of [
      "Europe/Paris",
      "America/Los_Angeles",
      "Pacific/Auckland",
      "Pacific/Kiritimati",
    ]) {
      process.env.TZ = tz
      const week = buildWeek(
        schedule([full("Anniversaire", allDay("2026-10-16"))]),
        new Date(2026, 9, 12)
      )
      expect(
        week.rows[0].days.map((day) => day.length),
        tz
      ).toEqual([0, 0, 0, 0, 1, 0, 0])
    }
    process.env.TZ = "Europe/Paris"
  })

  it("covers the week where the clocks go forward", () => {
    const monday = new Date(2026, 2, 23)
    const sunday = new Date(2026, 2, 29, 10)
    const week = buildWeek(
      schedule([
        full("Dimanche", {
          startsAt: sunday,
          endsAt: new Date(2026, 2, 29, 11),
        }),
      ]),
      monday
    )
    expect(week.rows[0].days.map((day) => day.length)).toEqual([
      0, 0, 0, 0, 0, 0, 1,
    ])
  })
})

describe("family events in a week", () => {
  const event = (overrides: Partial<Schedule["events"][number]>) => ({
    id: "e",
    title: "Evenement",
    place: null,
    startsAt: new Date(2026, 9, 17, 10),
    endsAt: new Date(2026, 9, 17, 12),
    allDay: false,
    ...overrides,
  })

  it("puts an all-day event on each day of its range, the last day included", () => {
    const weekend = event({
      allDay: true,
      startsAt: new Date("2026-10-17T00:00:00.000Z"),
      endsAt: new Date("2026-10-18T00:00:00.000Z"),
    })
    const week = buildWeek(schedule([], [weekend]), MONDAY)
    expect(week.events.map((day) => day.length)).toEqual([0, 0, 0, 0, 0, 1, 1])
  })

  it("keeps an all-day event on the same days in every timezone", () => {
    const weekend = event({
      allDay: true,
      startsAt: new Date("2026-10-17T00:00:00.000Z"),
      endsAt: new Date("2026-10-18T00:00:00.000Z"),
    })
    for (const tz of ["America/Los_Angeles", "Pacific/Auckland"]) {
      process.env.TZ = tz
      const week = buildWeek(schedule([], [weekend]), new Date(2026, 9, 12))
      expect(
        week.events.map((day) => day.length),
        tz
      ).toEqual([0, 0, 0, 0, 0, 1, 1])
    }
    process.env.TZ = "Europe/Paris"
  })

  it("puts a timed event that crosses midnight on both days", () => {
    const night = event({
      startsAt: new Date(2026, 9, 14, 22),
      endsAt: new Date(2026, 9, 15, 1),
    })
    const week = buildWeek(schedule([], [night]), MONDAY)
    expect(week.events.map((day) => day.length)).toEqual([0, 0, 1, 1, 0, 0, 0])
  })

  it("does not put an event on the day it ends exactly at midnight", () => {
    const evening = event({
      startsAt: new Date(2026, 9, 14, 20),
      endsAt: new Date(2026, 9, 15, 0),
    })
    const week = buildWeek(schedule([], [evening]), MONDAY)
    expect(week.events.map((day) => day.length)).toEqual([0, 0, 1, 0, 0, 0, 0])
  })
})
