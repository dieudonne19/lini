import { afterAll, describe, expect, it } from "vitest"

import { toIsoDate } from "@/lib/calendar-dates"
import { buildMonth, monthEvents, monthGrid } from "@/lib/month"
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
const activity = (
  memberId: string,
  overrides: Partial<ScheduleActivity> = {},
  kind: "full" | "busy" = "full"
) =>
  ({
    kind,
    ...(kind === "full" ? { title: "Activite", isPrivate: false } : {}),
    id: `activity-${counter++}`,
    memberId,
    startsAt: new Date(2026, 9, 14, 18),
    endsAt: new Date(2026, 9, 14, 19),
    allDay: false,
    repeat: "none",
    repeatUntil: null,
    ...overrides,
  }) as ScheduleActivity

const schedule = (
  activities: ScheduleActivity[],
  events: Schedule["events"] = []
): Schedule => ({
  members,
  activities,
  events,
})

const OCTOBER = new Date(2026, 9, 1)
const find = (weeks: ReturnType<typeof buildMonth>, iso: string) =>
  weeks.flat().find((day) => toIsoDate(day.date) === iso)!

describe("monthGrid", () => {
  it("is whole weeks from Monday: October 2026 has 5 rows from 28 September to 1 November", () => {
    const grid = monthGrid(OCTOBER)
    expect(grid).toHaveLength(5)
    expect(toIsoDate(grid[0][0])).toBe("2026-09-28")
    expect(toIsoDate(grid[4][6])).toBe("2026-11-01")
    expect(
      grid.every((week) => week.length === 7 && week[0].getDay() === 1)
    ).toBe(true)
  })

  it("has 6 rows when the month needs them (August 2026) and 5 for February 2026", () => {
    expect(monthGrid(new Date(2026, 7, 1))).toHaveLength(6)
    expect(toIsoDate(monthGrid(new Date(2026, 7, 1))[5][6])).toBe("2026-09-06")
    expect(monthGrid(new Date(2026, 1, 1))).toHaveLength(5)
  })

  it("goes into the next year for December", () => {
    const grid = monthGrid(new Date(2026, 11, 1))
    expect(toIsoDate(grid[grid.length - 1][6])).toBe("2027-01-03")
  })

  it("has distinct local midnights even when the clocks change (March and October 2026)", () => {
    for (const month of [new Date(2026, 2, 1), new Date(2026, 9, 1)]) {
      const days = monthGrid(month).flat()
      expect(new Set(days.map((day) => day.getTime())).size).toBe(days.length)
      expect(days.every((day) => day.getHours() === 0)).toBe(true)
    }
  })
})

describe("buildMonth", () => {
  it("marks the days outside the month", () => {
    const weeks = buildMonth(schedule([]), OCTOBER)
    expect(find(weeks, "2026-09-28").inMonth).toBe(false)
    expect(find(weeks, "2026-10-01").inMonth).toBe(true)
    expect(find(weeks, "2026-10-31").inMonth).toBe(true)
    expect(find(weeks, "2026-11-01").inMonth).toBe(false)
  })

  it("lists each busy member once per day, in the order they joined, private activities included", () => {
    const weeks = buildMonth(
      schedule([
        activity("b"),
        activity("a"),
        activity("a", {
          startsAt: new Date(2026, 9, 14, 8),
          endsAt: new Date(2026, 9, 14, 9),
        }),
        activity(
          "c",
          {
            startsAt: new Date(2026, 9, 15, 8),
            endsAt: new Date(2026, 9, 15, 9),
          },
          "busy"
        ),
      ]),
      OCTOBER
    )
    expect(
      find(weeks, "2026-10-14").busyMembers.map((member) => member.name)
    ).toEqual(["Anna", "Basile"])
    expect(
      find(weeks, "2026-10-15").busyMembers.map((member) => member.name)
    ).toEqual(["Clara"])
    expect(find(weeks, "2026-10-16").busyMembers).toEqual([])
  })

  it("shows a weekly activity every week up to its end, and the days of the neighbouring months too", () => {
    const weekly = activity("a", {
      startsAt: new Date(2026, 8, 30, 18), // Wednesday 30 September, outside October
      endsAt: new Date(2026, 8, 30, 19),
      repeat: "weekly",
      repeatUntil: new Date(2026, 9, 21, 23, 59, 59),
    })
    const busyDays = buildMonth(schedule([weekly]), OCTOBER)
      .flat()
      .filter((day) => day.busyMembers.length > 0)
      .map((day) => toIsoDate(day.date))
    expect(busyDays).toEqual([
      "2026-09-30",
      "2026-10-07",
      "2026-10-14",
      "2026-10-21",
    ])
  })

  it("puts family events on every day they touch", () => {
    const weekend = {
      id: "e",
      title: "Week-end",
      place: null,
      allDay: true,
      startsAt: new Date("2026-10-17T00:00:00.000Z"),
      endsAt: new Date("2026-10-18T00:00:00.000Z"),
    }
    const weeks = buildMonth(schedule([], [weekend]), OCTOBER)
    const withEvent = weeks
      .flat()
      .filter((day) => day.events.length > 0)
      .map((day) => toIsoDate(day.date))
    expect(withEvent).toEqual(["2026-10-17", "2026-10-18"])
  })

  it("keeps an all-day activity on the same day in every timezone", () => {
    const birthday = activity("a", {
      allDay: true,
      startsAt: new Date("2026-10-16T00:00:00.000Z"),
      endsAt: new Date("2026-10-16T00:00:00.000Z"),
    })
    for (const tz of [
      "Europe/Paris",
      "America/Los_Angeles",
      "Pacific/Auckland",
      "Pacific/Kiritimati",
    ]) {
      process.env.TZ = tz
      const busy = buildMonth(schedule([birthday]), new Date(2026, 9, 1))
        .flat()
        .filter((day) => day.busyMembers.length > 0)
        .map((day) => toIsoDate(day.date))
      expect(busy, tz).toEqual(["2026-10-16"])
    }
    process.env.TZ = "Europe/Paris"
  })
})

describe("monthEvents", () => {
  const event = (id: string, startsAt: Date, endsAt: Date, allDay = false) => ({
    id,
    title: id,
    place: null,
    startsAt,
    endsAt,
    allDay,
  })

  it("lists each event once, in start order, even when it spans several days", () => {
    const weekend = event(
      "weekend",
      new Date("2026-10-17T00:00:00.000Z"),
      new Date("2026-10-18T00:00:00.000Z"),
      true
    )
    const dinner = event(
      "dinner",
      new Date(2026, 9, 3, 19),
      new Date(2026, 9, 3, 21)
    )
    const weeks = buildMonth(schedule([], [weekend, dinner]), OCTOBER)
    expect(monthEvents(weeks).map((e) => e.id)).toEqual(["dinner", "weekend"])
  })

  it("leaves out events that only touch the neighbouring months shown in the grid", () => {
    const lastDaySeptember = event(
      "september",
      new Date(2026, 8, 30, 10),
      new Date(2026, 8, 30, 11)
    )
    const firstDayNovember = event(
      "november",
      new Date(2026, 10, 1, 10),
      new Date(2026, 10, 1, 11)
    )
    const weeks = buildMonth(
      schedule([], [lastDaySeptember, firstDayNovember]),
      OCTOBER
    )
    expect(weeks.flat().some((day) => day.events.length > 0)).toBe(true)
    expect(monthEvents(weeks)).toEqual([])
  })
})

describe("performance", () => {
  // The browser lays out only the displayed period. This guards the cost of one layout.
  const many = Array.from({ length: 500 }, (_, index) =>
    activity(members[index % 3].id, {
      startsAt: new Date(2026, 0, 5 + (index % 7), 8 + (index % 10)),
      endsAt: new Date(2026, 0, 5 + (index % 7), 9 + (index % 10)),
      repeat: index % 2 ? "weekly" : "daily",
    })
  )

  it("lays out a month of 500 repeating activities in under 100 ms", () => {
    buildMonth(schedule(many), OCTOBER) // warm up
    const start = performance.now()
    buildMonth(schedule(many), OCTOBER)
    expect(performance.now() - start).toBeLessThan(100)
  })

  it("lays out a week of 500 repeating activities in under 100 ms", () => {
    buildWeek(schedule(many), new Date(2026, 9, 12)) // warm up
    const start = performance.now()
    buildWeek(schedule(many), new Date(2026, 9, 12))
    expect(performance.now() - start).toBeLessThan(100)
  })
})
