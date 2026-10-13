import { describe, expect, it } from "vitest"

import { activitySchema } from "@/lib/schemas"

const base = {
  title: "Cours de danse",
  startsAt: "2026-10-14T16:00:00.000Z",
  endsAt: "2026-10-14T17:00:00.000Z",
  allDay: false,
  isPrivate: false,
  repeat: "none",
  repeatUntil: null,
}

const messages = (input: object) => {
  const result = activitySchema.safeParse(input)
  return result.success ? [] : result.error.issues.map((i) => i.message)
}

describe("activitySchema", () => {
  it("accepts a timed activity and parses its dates", () => {
    const parsed = activitySchema.parse(base)
    expect(parsed.startsAt).toEqual(new Date("2026-10-14T16:00:00.000Z"))
    expect(parsed.title).toBe("Cours de danse")
  })

  it("trims the title and refuses an empty or long one", () => {
    expect(activitySchema.parse({ ...base, title: "  Foot  " }).title).toBe(
      "Foot"
    )
    expect(messages({ ...base, title: "   " })).toContain("Écris un titre")
    expect(messages({ ...base, title: "x".repeat(81) })).toContain(
      "80 caractères au maximum"
    )
  })

  it("refuses an end that is not after the start", () => {
    expect(messages({ ...base, endsAt: base.startsAt })).toContain(
      "La fin doit être après le début"
    )
  })

  it("accepts an activity across midnight but not one longer than 24 hours", () => {
    expect(
      messages({
        ...base,
        startsAt: "2026-10-14T21:00:00.000Z",
        endsAt: "2026-10-15T00:00:00.000Z",
      })
    ).toEqual([])
    expect(messages({ ...base, endsAt: "2026-10-15T16:00:01.000Z" })).toContain(
      "Une activité dure 24 heures au maximum"
    )
    expect(messages({ ...base, endsAt: "2026-10-15T16:00:00.000Z" })).toEqual(
      []
    )
  })

  it("accepts an all-day activity only as one UTC day", () => {
    const allDay = {
      ...base,
      allDay: true,
      startsAt: "2026-10-14T00:00:00.000Z",
      endsAt: "2026-10-14T00:00:00.000Z",
    }
    expect(messages(allDay)).toEqual([])
    expect(
      messages({
        ...allDay,
        startsAt: "2026-10-14T10:00:00.000Z",
        endsAt: "2026-10-14T10:00:00.000Z",
      })
    ).not.toEqual([])
    expect(
      messages({ ...allDay, endsAt: "2026-10-15T00:00:00.000Z" })
    ).not.toEqual([])
  })

  it("refuses a malformed date", () => {
    expect(messages({ ...base, startsAt: "demain" })).toContain(
      "Date ou heure invalide"
    )
    expect(
      messages({ ...base, startsAt: "2026-10-14T16:00:00+02:00" })
    ).toContain("Date ou heure invalide")
  })

  it("bounds the end of a repetition", () => {
    const weekly = { ...base, repeat: "weekly" }
    expect(
      messages({ ...weekly, repeatUntil: "2026-12-31T22:59:59.000Z" })
    ).toEqual([])
    expect(
      messages({ ...weekly, repeatUntil: "2026-10-13T00:00:00.000Z" })
    ).toContain("La fin de la répétition doit être après le début")
    expect(
      messages({ ...weekly, repeatUntil: "2029-01-01T00:00:00.000Z" })
    ).toContain("La répétition dure 2 ans au maximum")
  })

  it("drops repeatUntil when the activity does not repeat", () => {
    expect(
      activitySchema.parse({ ...base, repeatUntil: "2026-12-31T22:59:59.000Z" })
        .repeatUntil
    ).toBeNull()
  })
})
