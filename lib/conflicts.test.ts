import { afterAll, describe, expect, it } from "vitest"

import { findConflicts } from "@/lib/conflicts"
import {
  allDayActivity,
  busy,
  full,
  members,
  scheduleOf,
} from "@/lib/test-utils/schedule"

// Depends on the runtime timezone: set it explicitly, before any date below is built, and restore it afterwards.
const originalTz = process.env.TZ
process.env.TZ = "Europe/Paris"
afterAll(() => {
  if (originalTz === undefined) delete process.env.TZ
  else process.env.TZ = originalTz
})

const names = (list: { name: string }[]) => list.map((member) => member.name)
const at = (day: number, hour: number, minute = 0, month = 9) =>
  new Date(2026, month, day, hour, minute)
// An event on 17 October 2026, from 15:00 to 17:00 unless told otherwise.
const event = (startHour = 15, endHour = 17) => ({
  startsAt: at(17, startHour),
  endsAt: at(17, endHour),
  allDay: false,
})

describe("findConflicts", () => {
  it("names the member who has an activity during the event, and nobody else", () => {
    const schedule = scheduleOf([
      full("Danse", at(17, 16), at(17, 18)),
      full("Foot", at(17, 9), at(17, 10), { memberId: "b" }),
    ])
    expect(names(findConflicts(schedule, event()))).toEqual(["Anna"])
  })

  it("counts a private activity, which has no title, and never reads the title of the others", () => {
    const schedule = scheduleOf([
      busy(at(17, 16), at(17, 17), { memberId: "b" }),
      full("Rendez-vous psychologue SECRET", at(17, 16), at(17, 17), {
        memberId: "c",
      }),
    ])
    const result = findConflicts(schedule, event())
    expect(names(result)).toEqual(["Basile", "Clara"])
    expect(JSON.stringify(result)).not.toContain("SECRET")
    expect(Object.keys(result[0]).sort()).toEqual([
      "color",
      "id",
      "name",
      "role",
    ])
  })

  it("is not a conflict when an activity ends as the event starts, or starts as it ends", () => {
    const schedule = scheduleOf([
      full("Avant", at(17, 14), at(17, 15)),
      full("Après", at(17, 17), at(17, 18), { memberId: "b" }),
    ])
    expect(findConflicts(schedule, event())).toEqual([])
  })

  it("is a conflict as soon as they overlap by a minute, whichever one contains the other", () => {
    const touching = scheduleOf([
      full("Un peu avant", at(17, 14), at(17, 15, 1)),
    ])
    expect(names(findConflicts(touching, event()))).toEqual(["Anna"])
    const inside = scheduleOf([
      full("Dedans", at(17, 15, 30), at(17, 16), { memberId: "b" }),
    ])
    expect(names(findConflicts(inside, event()))).toEqual(["Basile"])
    const around = scheduleOf([
      full("Autour", at(17, 8), at(17, 23), { memberId: "c" }),
    ])
    expect(names(findConflicts(around, event()))).toEqual(["Clara"])
  })

  it("lists the members in the order they joined the family, whatever the order of the activities", () => {
    const schedule = scheduleOf([
      full("C", at(17, 16), at(17, 17), { memberId: "c" }),
      full("A", at(17, 16), at(17, 17), { memberId: "a" }),
      busy(at(17, 16), at(17, 17), { memberId: "b" }),
    ])
    expect(names(findConflicts(schedule, event()))).toEqual(
      members.map((m) => m.name)
    )
  })

  it("reports each member once, even with several overlapping activities", () => {
    const schedule = scheduleOf([
      full("1", at(17, 15), at(17, 16)),
      full("2", at(17, 16), at(17, 17)),
    ])
    expect(names(findConflicts(schedule, event()))).toEqual(["Anna"])
  })

  it("keeps a member busy all day for an all-day activity, on that day only", () => {
    const schedule = scheduleOf([allDayActivity("Anniversaire", "2026-10-17")])
    expect(names(findConflicts(schedule, event()))).toEqual(["Anna"])
    const nextDay = { startsAt: at(18, 15), endsAt: at(18, 17), allDay: false }
    expect(findConflicts(schedule, nextDay)).toEqual([])
  })

  it("conflicts an all-day event with any activity on one of its days, the last day included", () => {
    const weekend = {
      startsAt: new Date("2026-10-17T00:00:00.000Z"),
      endsAt: new Date("2026-10-18T00:00:00.000Z"),
      allDay: true,
    }
    const sundayEvening = scheduleOf([
      full("Dimanche soir", at(18, 20), at(18, 22)),
    ])
    expect(names(findConflicts(sundayEvening, weekend))).toEqual(["Anna"])
    const mondayMorning = scheduleOf([full("Lundi", at(19, 7), at(19, 8))])
    expect(findConflicts(mondayMorning, weekend)).toEqual([])
    const fridayNight = scheduleOf([full("Vendredi", at(16, 20), at(16, 22))])
    expect(findConflicts(fridayNight, weekend)).toEqual([])
  })

  it("counts an activity that goes past midnight on both days", () => {
    const night = scheduleOf([full("Soirée", at(16, 23), at(17, 1))])
    expect(
      names(
        findConflicts(night, {
          startsAt: at(17, 0, 30),
          endsAt: at(17, 2),
          allDay: false,
        })
      )
    ).toEqual(["Anna"])
    expect(
      findConflicts(night, {
        startsAt: at(17, 1),
        endsAt: at(17, 2),
        allDay: false,
      })
    ).toEqual([])
  })

  it("counts every repetition, and stops at the end of the repetition", () => {
    const weekly = (repeatUntil: Date | null) =>
      scheduleOf([
        full("Danse", at(7, 18), at(7, 19), { repeat: "weekly", repeatUntil }),
      ]) // Wednesday 7 October
    const eveningOf21 = {
      startsAt: at(21, 18, 30),
      endsAt: at(21, 19, 30),
      allDay: false,
    }
    expect(names(findConflicts(weekly(null), eveningOf21))).toEqual(["Anna"])
    expect(names(findConflicts(weekly(at(21, 23, 59)), eveningOf21))).toEqual([
      "Anna",
    ])
    expect(findConflicts(weekly(at(14, 23, 59)), eveningOf21)).toEqual([])
    expect(
      findConflicts(weekly(null), {
        startsAt: at(22, 18, 30),
        endsAt: at(22, 19, 30),
        allDay: false,
      })
    ).toEqual([])
  })

  it("keeps the wall-clock time of a repetition when the clocks change", () => {
    // Thursday 18:00 Paris, from 26 March (winter time). On 2 April it is summer time: still 18:00 local.
    const thursdays = scheduleOf([
      full("Cours", at(26, 18, 0, 2), at(26, 19, 0, 2), { repeat: "weekly" }),
    ])
    const afterChange = {
      startsAt: at(2, 18, 30, 3),
      endsAt: at(2, 19, 30, 3),
      allDay: false,
    }
    expect(names(findConflicts(thursdays, afterChange))).toEqual(["Anna"])
    const oneHourLater = {
      startsAt: at(2, 19, 30, 3),
      endsAt: at(2, 20, 30, 3),
      allDay: false,
    }
    expect(findConflicts(thursdays, oneHourLater)).toEqual([])
  })

  it("keeps an all-day activity on its own local day in every timezone", () => {
    for (const tz of [
      "Europe/Paris",
      "America/Los_Angeles",
      "Pacific/Auckland",
      "Pacific/Kiritimati",
    ]) {
      process.env.TZ = tz
      const schedule = scheduleOf([
        allDayActivity("Anniversaire", "2026-10-17"),
      ])
      const sameDay = {
        startsAt: new Date(2026, 9, 17, 9),
        endsAt: new Date(2026, 9, 17, 10),
        allDay: false,
      }
      const nextDay = {
        startsAt: new Date(2026, 9, 18, 9),
        endsAt: new Date(2026, 9, 18, 10),
        allDay: false,
      }
      const dayBefore = {
        startsAt: new Date(2026, 9, 16, 22),
        endsAt: new Date(2026, 9, 16, 23),
        allDay: false,
      }
      expect(names(findConflicts(schedule, sameDay)), tz).toEqual(["Anna"])
      expect(findConflicts(schedule, nextDay), tz).toEqual([])
      expect(findConflicts(schedule, dayBefore), tz).toEqual([])
    }
    process.env.TZ = "Europe/Paris"
  })

  it("finds nothing for an empty or reversed event", () => {
    const schedule = scheduleOf([full("Tout le temps", at(17, 0), at(17, 23))])
    expect(
      findConflicts(schedule, {
        startsAt: at(17, 16),
        endsAt: at(17, 16),
        allDay: false,
      })
    ).toEqual([])
    expect(
      findConflicts(schedule, {
        startsAt: at(17, 17),
        endsAt: at(17, 15),
        allDay: false,
      })
    ).toEqual([])
    expect(findConflicts(scheduleOf([]), event())).toEqual([])
  })

  it("stays fast with many repeating activities", () => {
    const many = Array.from({ length: 500 }, (_, index) =>
      full(
        "x",
        at(5 + (index % 7), 8 + (index % 10), 0, 0),
        at(5 + (index % 7), 9 + (index % 10), 0, 0),
        {
          memberId: members[index % 3].id,
          repeat: index % 2 ? "weekly" : "daily",
        }
      )
    )
    const schedule = scheduleOf(many)
    findConflicts(schedule, event()) // warm up
    const start = performance.now()
    findConflicts(schedule, event())
    expect(performance.now() - start).toBeLessThan(100)
  })
})
