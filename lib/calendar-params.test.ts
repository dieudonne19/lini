import { afterAll, describe, expect, it } from "vitest"

import { addDays, startOfWeek } from "@/lib/calendar-dates"
import {
  monthWindow,
  parseMonthParam,
  parseWeekParam,
  weekWindow,
} from "@/lib/calendar-params"
import { monthGrid } from "@/lib/month"

// Depends on the runtime timezone: restore it afterwards.
const originalTz = process.env.TZ
afterAll(() => {
  if (originalTz === undefined) delete process.env.TZ
  else process.env.TZ = originalTz
})

const DAY_MS = 24 * 60 * 60 * 1000
// The server widens every window by one day on each side (listFamilySchedule).
const SERVER_MARGIN_MS = DAY_MS
const EXTREME_TIMEZONES = [
  "Pacific/Kiritimati",
  "Pacific/Auckland",
  "Europe/Paris",
  "America/Los_Angeles",
  "Pacific/Pago_Pago",
]

describe("parseWeekParam", () => {
  it("turns any valid date into the Monday of its week", () => {
    expect(parseWeekParam("2026-10-12")).toBe("2026-10-12")
    expect(parseWeekParam("2026-10-14")).toBe("2026-10-12")
    expect(parseWeekParam("2026-10-18")).toBe("2026-10-12")
    expect(parseWeekParam("2026-10-19")).toBe("2026-10-19")
    expect(parseWeekParam("2027-01-01")).toBe("2026-12-28")
  })

  it("ignores anything that is not a real date", () => {
    for (const value of [
      undefined,
      "",
      "abc",
      "2026-13-01",
      "2026-02-30",
      "2026-10-1",
      "12/10/2026",
      "2026-10-12T10:00",
    ]) {
      expect(parseWeekParam(value), String(value)).toBeUndefined()
    }
  })
})

describe("parseMonthParam", () => {
  it("accepts a month and ignores anything else", () => {
    expect(parseMonthParam("2026-10")).toBe("2026-10")
    for (const value of [
      undefined,
      "",
      "2026-13",
      "2026-00",
      "2026-1",
      "2026-10-01",
      "octobre",
    ]) {
      expect(parseMonthParam(value), String(value)).toBeUndefined()
    }
  })
})

describe("weekWindow", () => {
  it("covers the week asked for with a week on each side", () => {
    const { from, to } = weekWindow(
      "2026-10-12",
      new Date("2026-01-01T00:00:00.000Z")
    )
    expect(from.toISOString()).toBe("2026-10-05T00:00:00.000Z")
    expect(to.toISOString()).toBe("2026-10-26T00:00:00.000Z")
  })

  it("without a parameter, always contains the device's own current week, whatever its timezone", () => {
    // Instants around the Sunday to Monday change in UTC, where devices disagree about the week.
    const instants = [
      "2026-10-18T10:00:00Z",
      "2026-10-18T23:30:00Z",
      "2026-10-19T00:30:00Z",
      "2026-10-19T10:00:00Z",
      "2026-03-29T00:30:00Z",
    ]
    for (const tz of EXTREME_TIMEZONES) {
      process.env.TZ = tz
      for (const instant of instants) {
        const now = new Date(instant)
        const start = startOfWeek(now)
        const end = addDays(start, 7)
        const { from, to } = weekWindow(undefined, now)
        expect(
          from.getTime() - SERVER_MARGIN_MS,
          `${tz} ${instant} start`
        ).toBeLessThanOrEqual(start.getTime())
        expect(
          to.getTime() + SERVER_MARGIN_MS,
          `${tz} ${instant} end`
        ).toBeGreaterThanOrEqual(end.getTime())
      }
    }
  })
})

describe("monthWindow", () => {
  it("covers the month grid, whatever the number of rows, in extreme timezones", () => {
    for (const tz of EXTREME_TIMEZONES) {
      process.env.TZ = tz
      for (const year of [2026, 2027]) {
        for (let month = 1; month <= 12; month++) {
          const iso = `${year}-${String(month).padStart(2, "0")}`
          const grid = monthGrid(new Date(year, month - 1, 1)).flat()
          const { from, to } = monthWindow(iso)
          const label = `${tz} ${iso}`
          expect(from.getTime() - SERVER_MARGIN_MS, label).toBeLessThanOrEqual(
            grid[0].getTime()
          )
          expect(to.getTime() + SERVER_MARGIN_MS, label).toBeGreaterThanOrEqual(
            addDays(grid[grid.length - 1], 1).getTime()
          )
        }
      }
    }
  })

  it("stays within the 70 days the server accepts", () => {
    for (let month = 1; month <= 12; month++) {
      const { from, to } = monthWindow(`2026-${String(month).padStart(2, "0")}`)
      expect(to.getTime() - from.getTime()).toBeLessThanOrEqual(70 * DAY_MS)
    }
    const week = weekWindow(undefined, new Date())
    expect(week.to.getTime() - week.from.getTime()).toBeLessThanOrEqual(
      70 * DAY_MS
    )
  })

  it("spans the month with eight days of margin on each side", () => {
    const { from, to } = monthWindow("2026-10")
    expect(from.toISOString()).toBe("2026-09-23T00:00:00.000Z")
    expect(to.toISOString()).toBe("2026-11-09T00:00:00.000Z")
  })
})
