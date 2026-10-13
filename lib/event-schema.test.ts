import { describe, expect, it } from "vitest"

import { eventSchema } from "@/lib/schemas"

const base = {
  title: "Week-end à la plage",
  description: "",
  place: "Mahambo",
  startsAt: "2026-10-17T00:00:00.000Z",
  endsAt: "2026-10-18T00:00:00.000Z",
  allDay: true,
}

const messages = (input: object) => {
  const result = eventSchema.safeParse(input)
  return result.success ? [] : result.error.issues.map((issue) => issue.message)
}

describe("eventSchema", () => {
  it("accepts an all-day range and parses its dates, empty texts becoming null", () => {
    const parsed = eventSchema.parse({ ...base, place: " " })
    expect(parsed.startsAt).toEqual(new Date("2026-10-17T00:00:00.000Z"))
    expect(parsed.place).toBeNull()
    expect(parsed.description).toBeNull()
  })

  it("never accepts a status from the input: it is not a field", () => {
    expect(
      eventSchema.parse({ ...base, status: "confirmed" })
    ).not.toHaveProperty("status")
  })

  it("trims the title and refuses an empty or long one, a long description or place", () => {
    expect(eventSchema.parse({ ...base, title: "  Fête  " }).title).toBe("Fête")
    expect(messages({ ...base, title: " " })).toContain("Écris un titre")
    expect(messages({ ...base, title: "x".repeat(81) })).toContain(
      "80 caractères au maximum"
    )
    expect(messages({ ...base, place: "x".repeat(81) })).toContain(
      "80 caractères au maximum"
    )
    expect(messages({ ...base, description: "x".repeat(501) })).toContain(
      "500 caractères au maximum"
    )
  })

  it("accepts an all-day event of 1 to 31 days only, from midnight UTC, last day not before the first", () => {
    const sameDay = { ...base, endsAt: base.startsAt }
    expect(messages(sameDay)).toEqual([])
    expect(messages({ ...base, endsAt: "2026-11-16T00:00:00.000Z" })).toEqual(
      []
    ) // 31 days
    expect(messages({ ...base, endsAt: "2026-11-17T00:00:00.000Z" })).toContain(
      "Un événement dure 31 jours au maximum"
    )
    expect(
      messages({
        ...base,
        startsAt: "2026-10-18T00:00:00.000Z",
        endsAt: "2026-10-17T00:00:00.000Z",
      })
    ).toContain("Le dernier jour ne peut pas être avant le premier")
    expect(
      messages({ ...base, startsAt: "2026-10-17T10:00:00.000Z" })
    ).toContain("Une journée entière commence à minuit")
  })

  it("accepts an event with times if the end is after the start and within 31 days", () => {
    const timed = {
      ...base,
      allDay: false,
      startsAt: "2026-10-17T17:00:00.000Z",
      endsAt: "2026-10-17T20:00:00.000Z",
    }
    expect(messages(timed)).toEqual([])
    expect(messages({ ...timed, endsAt: timed.startsAt })).toContain(
      "La fin doit être après le début"
    )
    expect(messages({ ...timed, endsAt: "2026-11-17T17:00:00.000Z" })).toEqual(
      []
    ) // exactly 31 days
    expect(
      messages({ ...timed, endsAt: "2026-11-17T17:00:01.000Z" })
    ).toContain("Un événement dure 31 jours au maximum")
  })

  it("refuses a malformed date without crashing", () => {
    expect(messages({ ...base, startsAt: "demain" })).toContain(
      "Date ou heure invalide"
    )
    expect(
      messages({ ...base, endsAt: "2026-10-18T00:00:00+02:00" })
    ).toContain("Date ou heure invalide")
  })
})
