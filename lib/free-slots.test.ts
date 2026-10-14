import { afterAll, describe, expect, it } from "vitest"

import { findFreeSlots } from "@/lib/free-slots"
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

const at = (day: number, hour: number, minute = 0, month = 9) =>
  new Date(2026, month, day, hour, minute)
// Wednesday 14 October 2026, 10:10.
const NOW = at(14, 10, 10)
// Local "day hour:minute" of a slot, for readable expectations.
const label = (slot: { start: Date; end: Date }) =>
  `${slot.start.getDate()} ${slot.start.getHours()}:${String(slot.start.getMinutes()).padStart(2, "0")}-${slot.end.getHours()}:${String(slot.end.getMinutes()).padStart(2, "0")}`

describe("findFreeSlots", () => {
  it("offers every day of the next 14 days when nobody has anything, today from the next half hour", () => {
    const slots = findFreeSlots(scheduleOf([]), NOW)
    expect(slots).toHaveLength(14)
    expect(label(slots[0])).toBe("14 10:30-22:00")
    expect(slots[0].wholeDay).toBe(false)
    expect(label(slots[1])).toBe("15 8:00-22:00")
    expect(slots[1].wholeDay).toBe(true)
    expect(label(slots[13])).toBe("27 8:00-22:00")
  })

  it("starts today on the next half hour, or on the same one when it is exactly on one", () => {
    expect(label(findFreeSlots(scheduleOf([]), at(14, 10, 30))[0])).toBe(
      "14 10:30-22:00"
    )
    expect(label(findFreeSlots(scheduleOf([]), at(14, 10, 31))[0])).toBe(
      "14 11:00-22:00"
    )
    expect(label(findFreeSlots(scheduleOf([]), at(14, 6, 0))[0])).toBe(
      "14 8:00-22:00"
    )
  })

  it("drops today when less than two hours are left", () => {
    const slots = findFreeSlots(scheduleOf([]), at(14, 20, 5))
    expect(slots).toHaveLength(13)
    expect(label(slots[0])).toBe("15 8:00-22:00")
  })

  it("splits a day around an activity", () => {
    const slots = findFreeSlots(
      scheduleOf([full("Déjeuner", at(16, 12), at(16, 13))]),
      NOW
    )
    const day = slots.filter((slot) => slot.start.getDate() === 16)
    expect(day.map(label)).toEqual(["16 8:00-12:00", "16 13:00-22:00"])
    expect(day.every((slot) => !slot.wholeDay)).toBe(true)
  })

  it("counts every member and the private activities: a slot is free only if nobody is busy", () => {
    const slots = findFreeSlots(
      scheduleOf([
        full("Anna", at(16, 9), at(16, 11), { memberId: "a" }),
        busy(at(16, 10), at(16, 14), { memberId: "b" }), // private: no title
        full("Rendez-vous SECRET", at(16, 18), at(16, 19), { memberId: "c" }),
      ]),
      NOW
    )
    // 8:00-9:00 is only one hour (dropped). Free from 14:00 to 18:00, then from 19:00 to 22:00.
    expect(
      slots.filter((slot) => slot.start.getDate() === 16).map(label)
    ).toEqual(["16 14:00-18:00", "16 19:00-22:00"])
    expect(JSON.stringify(slots)).not.toContain("SECRET")
  })

  it("drops the stretches shorter than two hours, and keeps exactly two", () => {
    const slots = findFreeSlots(
      scheduleOf([
        full("Matin", at(16, 9, 30), at(16, 11)),
        full("Pause", at(16, 12), at(16, 13)),
      ]),
      NOW
    )
    // 8:00-9:30 is 1h30, 11:00-12:00 is 1h: dropped. 13:00-22:00 stays.
    expect(
      slots.filter((slot) => slot.start.getDate() === 16).map(label)
    ).toEqual(["16 13:00-22:00"])
    const exactlyTwo = findFreeSlots(
      scheduleOf([full("Début", at(16, 10), at(16, 20))]),
      NOW
    )
    expect(
      exactlyTwo.filter((slot) => slot.start.getDate() === 16).map(label)
    ).toEqual(["16 8:00-10:00", "16 20:00-22:00"])
  })

  it("leaves nothing on a day when someone has an all-day activity", () => {
    const slots = findFreeSlots(
      scheduleOf([
        allDayActivity("Anniversaire", "2026-10-16", { memberId: "b" }),
      ]),
      NOW
    )
    expect(slots.some((slot) => slot.start.getDate() === 16)).toBe(false)
    expect(slots).toHaveLength(13)
  })

  it("keeps an all-day activity on its own local day in every timezone", () => {
    for (const tz of [
      "Europe/Paris",
      "America/Los_Angeles",
      "Pacific/Auckland",
      "Pacific/Kiritimati",
    ]) {
      process.env.TZ = tz
      const now = new Date(2026, 9, 14, 6, 0)
      const slots = findFreeSlots(
        scheduleOf([allDayActivity("Anniversaire", "2026-10-16")]),
        now
      )
      expect(
        slots.filter((slot) => slot.start.getDate() === 16),
        tz
      ).toEqual([])
      expect(
        slots.some((slot) => slot.start.getDate() === 15),
        tz
      ).toBe(true)
      expect(
        slots.some((slot) => slot.start.getDate() === 17),
        tz
      ).toBe(true)
    }
    process.env.TZ = "Europe/Paris"
  })

  it("removes every repetition of a weekly activity", () => {
    const slots = findFreeSlots(
      scheduleOf([full("Danse", at(7, 17), at(7, 19), { repeat: "weekly" })]), // Wednesdays 17:00-19:00
      NOW
    )
    const wednesdays = slots.filter((slot) => slot.start.getDay() === 3)
    expect(wednesdays.map(label)).toEqual([
      "14 10:30-17:00",
      "14 19:00-22:00",
      "21 8:00-17:00",
      "21 19:00-22:00",
    ])
  })

  it("only touches the evening of an activity that runs past midnight", () => {
    const slots = findFreeSlots(
      scheduleOf([full("Soirée", at(16, 20), at(17, 2))]),
      NOW
    )
    expect(
      slots.filter((slot) => slot.start.getDate() === 16).map(label)
    ).toEqual(["16 8:00-20:00"])
    expect(
      slots.filter((slot) => slot.start.getDate() === 17).map(label)
    ).toEqual(["17 8:00-22:00"])
  })

  it("covers exactly the next 14 days, and only those", () => {
    const slots = findFreeSlots(
      scheduleOf([full("Hors période", at(28, 9), at(28, 12))]),
      NOW
    )
    expect(slots).toHaveLength(14)
    expect(slots.some((slot) => slot.start.getDate() === 28)).toBe(false)
    expect(findFreeSlots(scheduleOf([]), NOW, { days: 3 })).toHaveLength(3)
  })

  it("keeps 8:00 to 22:00 local on the days the clocks change", () => {
    const slots = findFreeSlots(scheduleOf([]), at(23, 6, 0), { days: 4 }) // 23 to 26 October, change on Sunday 25
    const sunday = slots.find((slot) => slot.start.getDate() === 25)!
    expect(label(sunday)).toBe("25 8:00-22:00")
    expect(sunday.wholeDay).toBe(true)
  })

  it("accepts another day window and another minimum length", () => {
    const slots = findFreeSlots(
      scheduleOf([full("Matin", at(16, 9), at(16, 10))]),
      NOW,
      {
        days: 3,
        dayStartHour: 9,
        dayEndHour: 18,
        minMinutes: 60,
      }
    )
    expect(
      slots.filter((slot) => slot.start.getDate() === 16).map(label)
    ).toEqual(["16 10:00-18:00"])
  })

  it("only ever returns times: no title, no member", () => {
    const [slot] = findFreeSlots(
      scheduleOf([full("Secret", at(16, 12), at(16, 13), { memberId: "b" })]),
      NOW
    )
    expect(Object.keys(slot).sort()).toEqual(["end", "start", "wholeDay"])
    expect(members.length).toBe(3)
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
    findFreeSlots(schedule, NOW) // warm up
    const start = performance.now()
    findFreeSlots(schedule, NOW)
    expect(performance.now() - start).toBeLessThan(100)
  })
})
