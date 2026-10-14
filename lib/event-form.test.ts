import { afterAll, describe, expect, it } from "vitest"

import {
  eventTimesFromFields,
  eventToFields,
  missingEventFieldErrors,
  parseEventPayload,
  readEventFields,
  toEventFormValues,
  toEventPayload,
  whenFromSlot,
  whenOf,
  type EventFields,
} from "@/lib/event-form"

// Depends on the runtime timezone: set it explicitly, before any date below is built, and restore it afterwards.
const originalTz = process.env.TZ
process.env.TZ = "Europe/Paris"
afterAll(() => {
  if (originalTz === undefined) delete process.env.TZ
  else process.env.TZ = originalTz
})

const fields = (overrides: Partial<EventFields> = {}): EventFields => ({
  title: "Repas de famille",
  place: "Maison",
  description: "Chacun apporte un plat",
  startDate: "2026-10-17",
  endDate: "",
  startTime: "19:00",
  endTime: "22:00",
  allDay: false,
  ...overrides,
})

const payload = (overrides: Partial<EventFields> = {}) =>
  toEventPayload(fields(overrides))

describe("toEventPayload", () => {
  it("converts local times to UTC instants (Paris is UTC+2 in October)", () => {
    const data = payload()
    expect(data.get("startsAt")).toBe("2026-10-17T17:00:00.000Z")
    expect(data.get("endsAt")).toBe("2026-10-17T20:00:00.000Z")
    expect(data.get("allDay")).toBe("false")
  })

  it("uses the end date when there is one, for a multi-day event with times", () => {
    const data = payload({ endDate: "2026-10-19", endTime: "10:00" })
    expect(data.get("endsAt")).toBe("2026-10-19T08:00:00.000Z")
  })

  it("moves an end earlier than the start to the next day only when no end date was given", () => {
    const night = payload({ startTime: "22:00", endTime: "01:00" })
    expect(night.get("startsAt")).toBe("2026-10-17T20:00:00.000Z")
    expect(night.get("endsAt")).toBe("2026-10-17T23:00:00.000Z")
    const explicit = payload({
      startTime: "22:00",
      endTime: "01:00",
      endDate: "2026-10-17",
    })
    expect(parseEventPayload(explicit).success).toBe(false)
  })

  it("makes an all-day event a range of UTC dates, in any timezone", () => {
    for (const tz of [
      "Europe/Paris",
      "America/Los_Angeles",
      "Pacific/Auckland",
    ]) {
      process.env.TZ = tz
      const data = payload({
        allDay: true,
        startTime: "",
        endTime: "",
        endDate: "2026-10-18",
      })
      expect(data.get("startsAt"), tz).toBe("2026-10-17T00:00:00.000Z")
      expect(data.get("endsAt"), tz).toBe("2026-10-18T00:00:00.000Z")
    }
    process.env.TZ = "Europe/Paris"
  })

  it("is a single day when an all-day event has no end date", () => {
    const data = payload({ allDay: true, startTime: "", endTime: "" })
    expect(data.get("endsAt")).toBe(data.get("startsAt"))
  })

  it("does not throw on an empty date: the server reports it", () => {
    expect(parseEventPayload(payload({ startDate: "" })).success).toBe(false)
  })
})

describe("missingEventFieldErrors", () => {
  it("is empty for a complete form", () => {
    expect(missingEventFieldErrors(fields())).toEqual({})
  })

  it("names each empty field, and does not ask for times on an all-day event", () => {
    const empty = missingEventFieldErrors(
      fields({ title: " ", startDate: "", startTime: "", endTime: "" })
    )
    expect(Object.keys(empty).sort()).toEqual([
      "endTime",
      "startDate",
      "startTime",
      "title",
    ])
    expect(
      missingEventFieldErrors(
        fields({ allDay: true, startTime: "", endTime: "" })
      )
    ).toEqual({})
  })
})

describe("eventTimesFromFields", () => {
  const when = (overrides: Partial<EventFields> = {}) => {
    const { startDate, endDate, startTime, endTime, allDay } = fields(overrides)
    return { startDate, endDate, startTime, endTime, allDay }
  }

  it("gives the instants the server would store, in the device timezone", () => {
    expect(eventTimesFromFields(when())).toEqual({
      startsAt: new Date("2026-10-17T17:00:00.000Z"),
      endsAt: new Date("2026-10-17T20:00:00.000Z"),
      allDay: false,
    })
  })

  it("gives the whole range of an all-day event, as UTC dates", () => {
    expect(
      eventTimesFromFields(
        when({
          allDay: true,
          startTime: "",
          endTime: "",
          endDate: "2026-10-18",
        })
      )
    ).toEqual({
      startsAt: new Date("2026-10-17T00:00:00.000Z"),
      endsAt: new Date("2026-10-18T00:00:00.000Z"),
      allDay: true,
    })
  })

  it("is null while a date or a time is missing", () => {
    expect(eventTimesFromFields(when({ startDate: "" }))).toBeNull()
    expect(eventTimesFromFields(when({ startTime: "" }))).toBeNull()
    expect(eventTimesFromFields(when({ endTime: "" }))).toBeNull()
  })

  it("is null when the event is not valid: an end before the start, or more than 31 days", () => {
    expect(eventTimesFromFields(when({ endDate: "2026-10-16" }))).toBeNull()
    expect(eventTimesFromFields(when({ endDate: "2026-12-01" }))).toBeNull()
    expect(
      eventTimesFromFields(
        when({
          allDay: true,
          startTime: "",
          endTime: "",
          endDate: "2026-10-10",
        })
      )
    ).toBeNull()
  })
})

describe("whenFromSlot and whenOf", () => {
  it("fills a single local day from the start to the end of the slot", () => {
    const slot = {
      start: new Date(2026, 9, 24, 8),
      end: new Date(2026, 9, 24, 22),
    }
    expect(whenFromSlot(slot)).toEqual({
      startDate: "2026-10-24",
      endDate: "",
      startTime: "08:00",
      endTime: "22:00",
      allDay: false,
    })
  })

  it("gives back exactly the slot once the form is turned into an event, in several timezones and across a clock change", () => {
    for (const tz of [
      "Europe/Paris",
      "America/Los_Angeles",
      "Pacific/Auckland",
      "Indian/Antananarivo",
    ]) {
      process.env.TZ = tz
      for (const day of [24, 25]) {
        // 25 October 2026: the clocks go back in Paris.
        const slot = {
          start: new Date(2026, 9, day, 10, 30),
          end: new Date(2026, 9, day, 13),
        }
        expect(
          eventTimesFromFields(whenFromSlot(slot)),
          `${tz} ${day}`
        ).toEqual({
          startsAt: slot.start,
          endsAt: slot.end,
          allDay: false,
        })
      }
    }
    process.env.TZ = "Europe/Paris"
  })

  it("keeps only the dates and times of a whole event's fields", () => {
    expect(Object.keys(whenOf(fields())).sort()).toEqual([
      "allDay",
      "endDate",
      "endTime",
      "startDate",
      "startTime",
    ])
  })
})

describe("form to server round trip", () => {
  it("parses a valid form into the stored event, with empty texts becoming null", () => {
    const parsed = parseEventPayload(payload({ place: "  ", description: "" }))
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data).toMatchObject({
        title: "Repas de famille",
        place: null,
        description: null,
        allDay: false,
      })
    }
  })

  const roundTrip = (overrides: Partial<EventFields>) => {
    const original = fields(overrides)
    const parsed = parseEventPayload(toEventPayload(original))
    if (!parsed.success) throw new Error("the fields should be valid")
    return { original, reopened: eventToFields(parsed.data) }
  }

  it("gives back what was typed for a timed multi-day event, in several timezones", () => {
    for (const tz of [
      "Europe/Paris",
      "America/Los_Angeles",
      "Pacific/Auckland",
      "Indian/Antananarivo",
    ]) {
      process.env.TZ = tz
      const { original, reopened } = roundTrip({
        endDate: "2026-10-19",
        endTime: "10:00",
      })
      expect(reopened, tz).toEqual(original)
    }
    process.env.TZ = "Europe/Paris"
  })

  it("gives back an all-day range on the same days in every timezone", () => {
    for (const tz of [
      "Europe/Paris",
      "America/Los_Angeles",
      "Pacific/Auckland",
    ]) {
      process.env.TZ = tz
      const typed = {
        allDay: true,
        startTime: "",
        endTime: "",
        endDate: "2026-10-18",
      }
      const { original, reopened } = roundTrip(typed)
      expect(reopened, tz).toEqual(original)
    }
    process.env.TZ = "Europe/Paris"
  })

  it("fills the end date when it was left empty, and shows an event across midnight on its next day", () => {
    expect(roundTrip({}).reopened.endDate).toBe("2026-10-17")
    const night = roundTrip({ startTime: "22:00", endTime: "01:00" }).reopened
    expect(night).toMatchObject({
      startDate: "2026-10-17",
      endDate: "2026-10-18",
      startTime: "22:00",
      endTime: "01:00",
    })
  })

  it("reads the checkbox as typed in the form and turns it into a form value", () => {
    const form = new FormData()
    form.set("title", "Fête")
    form.set("allDay", "on")
    expect(readEventFields(form)).toMatchObject({
      title: "Fête",
      allDay: true,
      endDate: "",
    })
    expect(toEventFormValues(fields({ allDay: true })).allDay).toBe("true")
  })
})
