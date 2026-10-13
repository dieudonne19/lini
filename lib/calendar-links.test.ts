import { afterAll, describe, expect, it } from "vitest"

import { monthHref, weekHref, weekHrefForMonth } from "@/lib/calendar-links"
import { parseMonthParam, parseWeekParam } from "@/lib/calendar-params"

// Depends on the runtime timezone: set it explicitly, before any date below is built, and restore it afterwards.
const originalTz = process.env.TZ
process.env.TZ = "Europe/Paris"
afterAll(() => {
  if (originalTz === undefined) delete process.env.TZ
  else process.env.TZ = originalTz
})

describe("calendar links", () => {
  it("builds the address of a week and of a month from local dates", () => {
    expect(weekHref(new Date(2026, 9, 19))).toBe("/?du=2026-10-19")
    expect(monthHref(new Date(2026, 9, 14))).toBe("/?mois=2026-10")
  })

  it("opens the current week from the current month, and the week of the 1st from another month", () => {
    const today = new Date(2026, 9, 14)
    expect(weekHrefForMonth(new Date(2026, 9, 1), today)).toBe("/")
    // 1 November 2026 is a Sunday: its week starts on Monday 26 October.
    expect(weekHrefForMonth(new Date(2026, 10, 1), today)).toBe(
      "/?du=2026-10-26"
    )
    expect(weekHrefForMonth(new Date(2027, 9, 1), today)).toBe(
      "/?du=2027-09-27"
    )
  })

  it("only builds addresses that the page accepts back", () => {
    expect(parseWeekParam(weekHref(new Date(2026, 9, 14)).split("=")[1])).toBe(
      "2026-10-12"
    )
    expect(
      parseMonthParam(monthHref(new Date(2026, 9, 14)).split("=")[1])
    ).toBe("2026-10")
  })
})
