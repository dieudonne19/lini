import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { buildAgendaDays, type AgendaActivity } from "@/lib/agenda"
import {
  formatDayHeading,
  formatRepeat,
  formatTimeRange,
} from "@/lib/format-date"

// Depends on the runtime timezone: set it explicitly and restore it afterwards.
const originalTz = process.env.TZ
beforeAll(() => {
  process.env.TZ = "Europe/Paris"
})
afterAll(() => {
  if (originalTz === undefined) delete process.env.TZ
  else process.env.TZ = originalTz
})

const activity = (
  overrides: Partial<AgendaActivity> & { title: string }
): AgendaActivity => ({
  id: overrides.title,
  startsAt: new Date(2026, 9, 14, 18), // Wednesday 14 October 2026, 18:00 local
  endsAt: new Date(2026, 9, 14, 19),
  allDay: false,
  isPrivate: false,
  repeat: "none",
  repeatUntil: null,
  ...overrides,
})

const today = new Date(2026, 9, 14, 9) // Wednesday 14 October 2026, 09:00

describe("buildAgendaDays", () => {
  it("returns no day when there is nothing to show", () => {
    expect(buildAgendaDays([], today, 14)).toEqual([])
  })

  it("groups activities by day, sorted, all-day first then by start time", () => {
    const days = buildAgendaDays(
      [
        activity({ title: "Soir" }),
        activity({
          title: "Matin",
          startsAt: new Date(2026, 9, 14, 8),
          endsAt: new Date(2026, 9, 14, 9),
        }),
        activity({
          title: "Anniversaire",
          allDay: true,
          startsAt: new Date("2026-10-14T00:00:00.000Z"),
          endsAt: new Date("2026-10-14T00:00:00.000Z"),
        }),
        activity({
          title: "Demain",
          startsAt: new Date(2026, 9, 15, 10),
          endsAt: new Date(2026, 9, 15, 11),
        }),
      ],
      today,
      14
    )
    expect(days.map((d) => d.date.getDate())).toEqual([14, 15])
    expect(days[0].items.map((i) => i.activity.title)).toEqual([
      "Anniversaire",
      "Matin",
      "Soir",
    ])
  })

  it("shows a weekly activity once a week up to its end, within 14 days", () => {
    const days = buildAgendaDays(
      [
        activity({
          title: "Danse",
          repeat: "weekly",
          repeatUntil: new Date(2026, 9, 21, 23, 59, 59),
        }),
      ],
      today,
      14
    )
    expect(days.map((d) => d.date.getDate())).toEqual([14, 21])
  })

  it("leaves out past days and days beyond the window", () => {
    const days = buildAgendaDays(
      [
        activity({
          title: "Hier",
          startsAt: new Date(2026, 9, 13, 18),
          endsAt: new Date(2026, 9, 13, 19),
        }),
        activity({
          title: "Dans 14 jours",
          startsAt: new Date(2026, 9, 28, 18),
          endsAt: new Date(2026, 9, 28, 19),
        }),
        activity({
          title: "Dans 13 jours",
          startsAt: new Date(2026, 9, 27, 18),
          endsAt: new Date(2026, 9, 27, 19),
        }),
      ],
      today,
      14
    )
    expect(days.flatMap((d) => d.items.map((i) => i.activity.title))).toEqual([
      "Dans 13 jours",
    ])
  })

  it("keeps an all-day activity on its own calendar day in every timezone", () => {
    const birthday = activity({
      title: "Anniversaire",
      allDay: true,
      startsAt: new Date("2026-10-16T00:00:00.000Z"),
      endsAt: new Date("2026-10-16T00:00:00.000Z"),
    })
    for (const tz of [
      "Europe/Paris",
      "America/Los_Angeles",
      "Pacific/Auckland",
    ]) {
      process.env.TZ = tz
      const days = buildAgendaDays([birthday], new Date(2026, 9, 14, 9), 14)
      expect(
        days.map((d) => d.date.getDate()),
        tz
      ).toEqual([16])
    }
    process.env.TZ = "Europe/Paris"
  })
})

describe("date formats", () => {
  it("labels today and tomorrow, capitalizes other days", () => {
    expect(formatDayHeading(new Date(2026, 9, 14), today)).toBe(
      "Aujourd'hui, mercredi 14 octobre"
    )
    expect(formatDayHeading(new Date(2026, 9, 15), today)).toBe(
      "Demain, jeudi 15 octobre"
    )
    expect(formatDayHeading(new Date(2026, 9, 16), today)).toBe(
      "Vendredi 16 octobre"
    )
  })

  it("formats a time range in the device timezone, or the whole day", () => {
    const a = activity({ title: "Danse" })
    expect(formatTimeRange(a)).toBe("18:00 – 19:00")
    expect(formatTimeRange({ ...a, allDay: true })).toBe("Journée entière")
  })

  it("describes a repetition and its end", () => {
    expect(formatRepeat(activity({ title: "x" }))).toBeNull()
    expect(formatRepeat(activity({ title: "x", repeat: "daily" }))).toBe(
      "Chaque jour"
    )
    expect(
      formatRepeat(
        activity({
          title: "x",
          repeat: "weekly",
          repeatUntil: new Date(2026, 11, 31, 23, 59, 59),
        })
      )
    ).toBe("Chaque semaine jusqu'au 31 décembre")
    const allDay = activity({
      title: "x",
      allDay: true,
      repeat: "weekly",
      repeatUntil: new Date("2026-12-31T00:00:00.000Z"),
    })
    process.env.TZ = "America/Los_Angeles"
    expect(formatRepeat(allDay)).toBe("Chaque semaine jusqu'au 31 décembre")
    process.env.TZ = "Europe/Paris"
  })
})
