import { afterAll, beforeAll, describe, expect, it } from "vitest"

import {
  activityToFields,
  missingFieldErrors,
  parseActivityPayload,
  toFormValues,
  readActivityFields,
  toActivityPayload,
  type ActivityFields,
} from "@/lib/activity-form"

// Depends on the runtime timezone: set it explicitly and restore it afterwards.
const originalTz = process.env.TZ
beforeAll(() => {
  process.env.TZ = "Europe/Paris"
})
afterAll(() => {
  if (originalTz === undefined) delete process.env.TZ
  else process.env.TZ = originalTz
})

const fields = (overrides: Partial<ActivityFields> = {}): ActivityFields => ({
  title: "Cours de danse",
  date: "2026-10-14",
  startTime: "18:00",
  endTime: "19:30",
  allDay: false,
  isPrivate: false,
  repeat: "none",
  repeatUntil: "",
  ...overrides,
})

const payload = (overrides: Partial<ActivityFields> = {}) =>
  toActivityPayload(fields(overrides))

describe("toActivityPayload", () => {
  it("converts local times to UTC instants (Paris is UTC+2 in October)", () => {
    const data = payload()
    expect(data.get("startsAt")).toBe("2026-10-14T16:00:00.000Z")
    expect(data.get("endsAt")).toBe("2026-10-14T17:30:00.000Z")
    expect(data.get("allDay")).toBe("false")
  })

  it("moves an end earlier than the start to the next day, but not an equal one", () => {
    const night = payload({ startTime: "22:00", endTime: "01:00" })
    expect(night.get("startsAt")).toBe("2026-10-14T20:00:00.000Z")
    expect(night.get("endsAt")).toBe("2026-10-14T23:00:00.000Z")
    const equal = payload({ startTime: "10:00", endTime: "10:00" })
    expect(equal.get("endsAt")).toBe(equal.get("startsAt"))
  })

  it("makes an all-day activity a UTC date, in any timezone", () => {
    for (const tz of [
      "Europe/Paris",
      "America/Los_Angeles",
      "Pacific/Auckland",
    ]) {
      process.env.TZ = tz
      const data = payload({ allDay: true, startTime: "", endTime: "" })
      expect(data.get("startsAt"), tz).toBe("2026-10-14T00:00:00.000Z")
      expect(data.get("endsAt"), tz).toBe("2026-10-14T00:00:00.000Z")
    }
    process.env.TZ = "Europe/Paris"
  })

  it("ends a repetition at the end of its last local day, or at the UTC date for all-day", () => {
    const timed = payload({ repeat: "weekly", repeatUntil: "2026-12-31" })
    expect(timed.get("repeatUntil")).toBe("2026-12-31T22:59:59.999Z") // Paris is UTC+1 in winter
    const allDay = payload({
      allDay: true,
      repeat: "weekly",
      repeatUntil: "2026-12-31",
    })
    expect(allDay.get("repeatUntil")).toBe("2026-12-31T00:00:00.000Z")
  })

  it("sends no end of repetition for a one-off activity or an open-ended repetition", () => {
    expect(
      payload({ repeat: "none", repeatUntil: "2026-12-31" }).get("repeatUntil")
    ).toBe("")
    expect(
      payload({ repeat: "daily", repeatUntil: "" }).get("repeatUntil")
    ).toBe("")
  })

  it("does not throw on an empty date: the server reports it", () => {
    const data = payload({ date: "" })
    expect(parseActivityPayload(data).success).toBe(false)
  })
})

describe("activityToFields", () => {
  // Typing the fields, saving, then reopening the activity must give back the same fields.
  const roundTrip = (overrides: Partial<ActivityFields>) => {
    const original = fields(overrides)
    const parsed = parseActivityPayload(toActivityPayload(original))
    if (!parsed.success) throw new Error("the fields should be valid")
    return { original, reopened: activityToFields(parsed.data) }
  }

  it("gives back what was typed for a timed, private, repeating activity", () => {
    const { original, reopened } = roundTrip({
      isPrivate: true,
      repeat: "weekly",
      repeatUntil: "2026-12-31",
    })
    expect(reopened).toEqual(original)
  })

  it("gives back the same local times in other timezones", () => {
    for (const tz of [
      "America/Los_Angeles",
      "Pacific/Auckland",
      "Indian/Antananarivo",
    ]) {
      process.env.TZ = tz
      const { original, reopened } = roundTrip({
        startTime: "08:15",
        endTime: "09:45",
      })
      expect(reopened, tz).toEqual(original)
    }
    process.env.TZ = "Europe/Paris"
  })

  it("gives back an all-day activity on the same day in every timezone", () => {
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
        repeat: "daily",
        repeatUntil: "2026-10-20",
      }
      const { original, reopened } = roundTrip(typed)
      expect(reopened, tz).toEqual(original)
    }
    process.env.TZ = "Europe/Paris"
  })

  it("shows an activity across midnight with its end time", () => {
    const { reopened } = roundTrip({ startTime: "22:00", endTime: "01:00" })
    expect(reopened).toMatchObject({
      date: "2026-10-14",
      startTime: "22:00",
      endTime: "01:00",
    })
  })

  it("turns the checkboxes into form values", () => {
    expect(
      toFormValues(fields({ allDay: true, isPrivate: false }))
    ).toMatchObject({
      allDay: "true",
      isPrivate: "false",
    })
  })
})

describe("missingFieldErrors", () => {
  it("is empty for a complete form", () => {
    expect(missingFieldErrors(fields())).toEqual({})
  })

  it("names each empty field", () => {
    const errors = missingFieldErrors(
      fields({ title: "  ", date: "", startTime: "", endTime: "" })
    )
    expect(Object.keys(errors).sort()).toEqual([
      "date",
      "endTime",
      "startTime",
      "title",
    ])
  })

  it("does not ask for times on an all-day activity", () => {
    expect(
      missingFieldErrors(fields({ allDay: true, startTime: "", endTime: "" }))
    ).toEqual({})
  })
})

describe("form to server round trip", () => {
  it("a valid form parses into the stored activity", () => {
    const parsed = parseActivityPayload(
      payload({ isPrivate: true, repeat: "weekly", repeatUntil: "2026-12-31" })
    )
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data).toMatchObject({
        title: "Cours de danse",
        isPrivate: true,
        repeat: "weekly",
        allDay: false,
      })
      expect(parsed.data.repeatUntil).toEqual(
        new Date("2026-12-31T22:59:59.999Z")
      )
    }
  })

  it("refuses a title that is too long", () => {
    const parsed = parseActivityPayload(payload({ title: "x".repeat(81) }))
    expect(parsed.success).toBe(false)
  })

  it("reads the checkboxes as typed in the form", () => {
    const form = new FormData()
    form.set("title", "Foot")
    form.set("allDay", "on")
    const read = readActivityFields(form)
    expect(read).toMatchObject({
      title: "Foot",
      allDay: true,
      isPrivate: false,
      repeat: "none",
    })
  })
})
