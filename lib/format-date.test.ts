import { describe, expect, it } from "vitest"

import { formatEventDay, formatEventMeta } from "@/lib/format-date"

// Timed events are built in local time, so the tests do not depend on the timezone of the machine. An all-day event
// is a UTC date, shown as is.
const at = (day: number, hour: number, minute = 0) =>
  new Date(2026, 9, day, hour, minute)
const allDay = (from: number, to = from) => ({
  startsAt: new Date(Date.UTC(2026, 9, from)),
  endsAt: new Date(Date.UTC(2026, 9, to)),
  allDay: true,
})

describe("formatEventDay", () => {
  it("gives the weekday, the day and the month of the day an event starts", () => {
    const expected = { weekday: "sam.", day: "17", month: "oct." }
    expect(formatEventDay(allDay(17))).toEqual(expected)
    expect(formatEventDay({ startsAt: at(17, 14), allDay: false })).toEqual(
      expected
    )
  })
})

describe("formatEventMeta", () => {
  it("has nothing to add for an all-day event on one day without a place", () => {
    expect(formatEventMeta(allDay(17))).toBe("")
  })

  it("shows the time of a timed event, then the place", () => {
    const event = { startsAt: at(17, 14), endsAt: at(17, 16), allDay: false }
    expect(formatEventMeta(event)).toBe("14:00 – 16:00")
    expect(formatEventMeta(event, "Chez mamie")).toBe(
      "14:00 – 16:00 · Chez mamie"
    )
  })

  it("shows the place alone for an all-day event", () => {
    expect(formatEventMeta(allDay(17), "Chez mamie")).toBe("Chez mamie")
  })

  it("says until when an event lasts several days", () => {
    expect(formatEventMeta(allDay(17, 18))).toBe("Jusqu'au dim. 18 oct.")
    expect(
      formatEventMeta({
        startsAt: at(17, 20),
        endsAt: at(18, 9, 30),
        allDay: false,
      })
    ).toBe("Jusqu'au dim. 18 oct., 09:30")
  })
})
