import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { expandActivity, type RecurringActivity } from "@/lib/recurrence"

// These tests depend on the runtime timezone: they set it explicitly and restore it afterwards.
const originalTz = process.env.TZ
beforeAll(() => {
  process.env.TZ = "Europe/Paris"
})
afterAll(() => {
  if (originalTz === undefined) delete process.env.TZ
  else process.env.TZ = originalTz
})

const timed = (overrides: Partial<RecurringActivity>): RecurringActivity => ({
  startsAt: new Date(2026, 0, 5, 10), // Monday 10:00, local time
  endsAt: new Date(2026, 0, 5, 11),
  allDay: false,
  repeat: "none",
  repeatUntil: null,
  ...overrides,
})

const iso = (dates: { startsAt: Date }[]) =>
  dates.map((d) => d.startsAt.toISOString())

describe("expandActivity", () => {
  it("runs in the timezone the tests expect (guards the daylight-saving tests below)", () => {
    expect(new Date(2026, 6, 1, 12).getTimezoneOffset()).toBe(-120)
    expect(new Date(2026, 0, 1, 12).getTimezoneOffset()).toBe(-60)
  })

  it("returns a one-off activity only when it overlaps the window", () => {
    const activity = timed({})
    expect(
      expandActivity(activity, new Date(2026, 0, 5), new Date(2026, 0, 6))
    ).toHaveLength(1)
    expect(
      expandActivity(activity, new Date(2026, 0, 6), new Date(2026, 0, 7))
    ).toHaveLength(0)
    // Ends exactly when the window starts: not an overlap.
    expect(
      expandActivity(activity, new Date(2026, 0, 5, 11), new Date(2026, 0, 6))
    ).toHaveLength(0)
  })

  it("ignores repeatUntil on a one-off activity", () => {
    const activity = timed({ repeatUntil: new Date(2026, 0, 1) })
    expect(
      expandActivity(activity, new Date(2026, 0, 5), new Date(2026, 0, 6))
    ).toHaveLength(1)
  })

  it("repeats daily across a month and year change", () => {
    const activity = timed({
      startsAt: new Date(2026, 11, 30, 8),
      endsAt: new Date(2026, 11, 30, 9),
      repeat: "daily",
    })
    const days = expandActivity(
      activity,
      new Date(2026, 11, 30),
      new Date(2027, 0, 3)
    )
    expect(days.map((d) => d.startsAt.getDate())).toEqual([30, 31, 1, 2])
  })

  it("repeats weekly up to and including the end day, then stops", () => {
    const base = timed({ repeat: "weekly" })
    const window = [new Date(2026, 0, 1), new Date(2026, 2, 1)] as const
    const endsOnThird = expandActivity(
      { ...base, repeatUntil: new Date(2026, 0, 19, 23, 59, 59) },
      ...window
    )
    expect(endsOnThird.map((d) => d.startsAt.getDate())).toEqual([5, 12, 19])
    const endsBefore = expandActivity(
      { ...base, repeatUntil: new Date(2026, 0, 18, 23, 59, 59) },
      ...window
    )
    expect(endsBefore.map((d) => d.startsAt.getDate())).toEqual([5, 12])
  })

  it("finds the right weeks when the activity started long before the window", () => {
    const activity = timed({
      startsAt: new Date(2025, 0, 6, 9),
      endsAt: new Date(2025, 0, 6, 10),
      repeat: "weekly",
    })
    const found = expandActivity(
      activity,
      new Date(2026, 5, 1),
      new Date(2026, 5, 15)
    )
    expect(iso(found)).toEqual([
      "2026-06-01T07:00:00.000Z",
      "2026-06-08T07:00:00.000Z",
    ])
  })

  it("keeps the wall-clock time when the clocks go forward (spring) and back (autumn)", () => {
    const thursday = timed({
      startsAt: new Date(2026, 2, 26, 18), // 18:00 CET = 17:00Z
      endsAt: new Date(2026, 2, 26, 19),
      repeat: "weekly",
    })
    const spring = expandActivity(
      thursday,
      new Date(2026, 2, 26),
      new Date(2026, 3, 10)
    )
    expect(iso(spring)).toEqual([
      "2026-03-26T17:00:00.000Z",
      "2026-04-02T16:00:00.000Z",
      "2026-04-09T16:00:00.000Z",
    ])

    const autumn = expandActivity(
      {
        ...thursday,
        startsAt: new Date(2026, 9, 22, 18),
        endsAt: new Date(2026, 9, 22, 19),
      },
      new Date(2026, 9, 22),
      new Date(2026, 10, 6)
    )
    expect(iso(autumn)).toEqual([
      "2026-10-22T16:00:00.000Z",
      "2026-10-29T17:00:00.000Z",
      "2026-11-05T17:00:00.000Z",
    ])
    expect(spring[1].endsAt.getTime() - spring[1].startsAt.getTime()).toBe(
      60 * 60 * 1000
    )
  })

  it("keeps an all-day activity on the same calendar day in every timezone", () => {
    const allDay: RecurringActivity = {
      startsAt: new Date("2026-03-27T00:00:00.000Z"),
      endsAt: new Date("2026-03-27T00:00:00.000Z"),
      allDay: true,
      repeat: "daily",
      repeatUntil: new Date("2026-03-31T00:00:00.000Z"),
    }
    for (const tz of [
      "Europe/Paris",
      "America/Los_Angeles",
      "Pacific/Auckland",
      "Indian/Antananarivo",
    ]) {
      process.env.TZ = tz
      const found = expandActivity(
        allDay,
        new Date("2026-03-01T00:00:00.000Z"),
        new Date("2026-04-30T00:00:00.000Z")
      )
      expect(iso(found), tz).toEqual([
        "2026-03-27T00:00:00.000Z",
        "2026-03-28T00:00:00.000Z",
        "2026-03-29T00:00:00.000Z",
        "2026-03-30T00:00:00.000Z",
        "2026-03-31T00:00:00.000Z",
      ])
    }
    process.env.TZ = "Europe/Paris"
  })

  it("includes an all-day activity whose day overlaps the window", () => {
    const day: RecurringActivity = {
      startsAt: new Date("2026-03-27T00:00:00.000Z"),
      endsAt: new Date("2026-03-27T00:00:00.000Z"),
      allDay: true,
      repeat: "none",
      repeatUntil: null,
    }
    expect(
      expandActivity(
        day,
        new Date("2026-03-27T12:00:00.000Z"),
        new Date("2026-03-27T13:00:00.000Z")
      )
    ).toHaveLength(1)
    expect(
      expandActivity(
        day,
        new Date("2026-03-28T00:00:00.000Z"),
        new Date("2026-03-29T00:00:00.000Z")
      )
    ).toHaveLength(0)
  })
})
