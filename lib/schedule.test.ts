import { afterAll, describe, expect, it } from "vitest"

import { db } from "@/lib/db"
import { listFamilySchedule, type ScheduleActivity } from "@/lib/schedule"

type ActivityTimes = Pick<
  ScheduleActivity,
  | "id"
  | "memberId"
  | "startsAt"
  | "endsAt"
  | "allDay"
  | "repeat"
  | "repeatUntil"
>

const DAY_MS = 24 * 60 * 60 * 1000
const SECRET = "Rendez-vous chez le psychologue"
const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`)
const at = (iso: string, hour: number) =>
  new Date(day(iso).getTime() + hour * 3_600_000)

// The window every test reads unless it says otherwise: the week of 12 October 2026.
const WEEK = { from: day("2026-10-12"), to: day("2026-10-19") }

describe.skipIf(!process.env.DATABASE_URL)("listFamilySchedule", () => {
  const familyIds: string[] = []

  async function setupFamily() {
    const family = await db.family.create({ data: { name: "Test" } })
    familyIds.push(family.id)
    const member = (
      name: string,
      role: "parent" | "child",
      phone: string | null = null
    ) =>
      db.member.create({
        data: {
          familyId: family.id,
          name,
          color: "#3D6DF2",
          role,
          phone,
          tokenHash: crypto.randomUUID(),
        },
      })
    const parent = await member("Parent", "parent", "+261340000001")
    const child = await member("Enfant", "child", "+261340000002")
    const sibling = await member("Frere", "child")
    return { family, parent, child, sibling }
  }

  const activity = (
    memberId: string,
    title: string,
    overrides: Partial<Omit<ActivityTimes, "id" | "memberId">> & {
      isPrivate?: boolean
    } = {}
  ) =>
    db.activity.create({
      data: {
        memberId,
        title,
        startsAt: at("2026-10-14", 14),
        endsAt: at("2026-10-14", 15),
        ...overrides,
      },
    })

  afterAll(async () => {
    await db.family.deleteMany({ where: { id: { in: familyIds } } })
    await db.$disconnect()
  })

  describe("privacy", () => {
    it("turns another member's private activity into busy, with no title key and no title anywhere", async () => {
      const { parent, child, sibling } = await setupFamily()
      await activity(child.id, SECRET, { isPrivate: true, repeat: "weekly" })

      for (const viewer of [sibling, parent]) {
        const { activities } = await listFamilySchedule(viewer, WEEK)
        expect(activities).toHaveLength(1)
        const [busy] = activities
        expect(busy.kind).toBe("busy")
        expect(busy).not.toHaveProperty("title")
        expect(busy).not.toHaveProperty("isPrivate")
        // Times and repetition stay, so the screen can show "Occupé" at the right hours.
        expect(busy).toMatchObject({
          memberId: child.id,
          startsAt: at("2026-10-14", 14),
          repeat: "weekly",
        })
        expect(
          JSON.stringify(await listFamilySchedule(viewer, WEEK))
        ).not.toContain("psychologue")
      }
    })

    it("only ever exposes an allowlist of fields on a busy activity", async () => {
      const { sibling, child } = await setupFamily()
      await activity(child.id, SECRET, { isPrivate: true })
      const [busy] = (await listFamilySchedule(sibling, WEEK)).activities
      expect(Object.keys(busy).sort()).toEqual([
        "allDay",
        "endsAt",
        "id",
        "kind",
        "memberId",
        "repeat",
        "repeatUntil",
        "startsAt",
      ])
    })

    it("shows the owner their own private activity in full", async () => {
      const { child } = await setupFamily()
      await activity(child.id, SECRET, { isPrivate: true })
      const [own] = (await listFamilySchedule(child, WEEK)).activities
      expect(own).toMatchObject({
        kind: "full",
        title: SECRET,
        isPrivate: true,
      })
    })

    it("shows everyone the title of a public activity", async () => {
      const { child, sibling } = await setupFamily()
      await activity(child.id, "Foot")
      const [seen] = (await listFamilySchedule(sibling, WEEK)).activities
      expect(seen).toMatchObject({
        kind: "full",
        title: "Foot",
        isPrivate: false,
      })
    })

    it("never returns another family's members, activities or events", async () => {
      const mine = await setupFamily()
      const theirs = await setupFamily()
      await db.family.update({
        where: { id: theirs.family.id },
        data: { name: "Autre famille" },
      })
      await activity(theirs.child.id, "Secret d'une autre famille")
      await db.familyEvent.create({
        data: {
          familyId: theirs.family.id,
          status: "confirmed",
          title: "Evenement d'une autre famille",
          startsAt: at("2026-10-14", 10),
          endsAt: at("2026-10-14", 12),
        },
      })

      const schedule = await listFamilySchedule(mine.parent, WEEK)
      const ids = schedule.members.map((m) => m.id)
      expect(ids.sort()).toEqual(
        [mine.parent.id, mine.child.id, mine.sibling.id].sort()
      )
      expect(schedule.activities).toHaveLength(0)
      expect(schedule.events).toHaveLength(0)
      expect(JSON.stringify(schedule)).not.toContain("autre famille")
    })

    it("never returns a phone number, even to a parent", async () => {
      const { parent } = await setupFamily()
      const schedule = await listFamilySchedule(parent, WEEK)
      for (const member of schedule.members)
        expect(member).not.toHaveProperty("phone")
      expect(JSON.stringify(schedule)).not.toContain("+26134")
    })

    it("leaves out proposed events and keeps confirmed ones", async () => {
      const { family, parent, child } = await setupFamily()
      const base = {
        familyId: family.id,
        createdById: child.id,
        startsAt: at("2026-10-14", 10),
        endsAt: at("2026-10-14", 12),
      }
      await db.familyEvent.create({
        data: { ...base, status: "proposed", title: "Proposition" },
      })
      await db.familyEvent.create({
        data: { ...base, status: "confirmed", title: "Repas", place: "Maison" },
      })
      const { events } = await listFamilySchedule(parent, WEEK)
      expect(events.map((e) => e.title)).toEqual(["Repas"])
      expect(Object.keys(events[0]).sort()).toEqual([
        "allDay",
        "endsAt",
        "id",
        "place",
        "startsAt",
        "title",
      ])
    })
  })

  describe("window", () => {
    it("returns an old repeating activity that is still running, and not one that ended before the window", async () => {
      const { parent, child } = await setupFamily()
      await activity(child.id, "Toujours actif", {
        startsAt: at("2025-10-13", 18),
        endsAt: at("2025-10-13", 19),
        repeat: "weekly",
      })
      await activity(child.id, "Termine", {
        startsAt: at("2025-10-13", 18),
        endsAt: at("2025-10-13", 19),
        repeat: "weekly",
        repeatUntil: at("2026-06-30", 23),
      })
      const titles = (await listFamilySchedule(parent, WEEK)).activities.map(
        (a) => (a.kind === "full" ? a.title : "")
      )
      expect(titles).toEqual(["Toujours actif"])
    })

    it("leaves out one-off activities outside the window and keeps the ones at its edges", async () => {
      const { parent, child } = await setupFamily()
      const at14 = (title: string, iso: string, hour: number) =>
        activity(child.id, title, {
          startsAt: at(iso, hour),
          endsAt: at(iso, hour + 1),
        })
      await at14("Trop tot", "2026-10-05", 10)
      await at14("Trop tard", "2026-10-26", 10)
      await at14("Premier jour", "2026-10-12", 0)
      await at14("Dernier jour", "2026-10-18", 23)
      const titles = (await listFamilySchedule(parent, WEEK)).activities.map(
        (a) => (a.kind === "full" ? a.title : "")
      )
      expect(titles.sort()).toEqual(["Dernier jour", "Premier jour"])
    })

    it("keeps an all-day activity on the first and last day of the window", async () => {
      const { parent, child } = await setupFamily()
      for (const iso of ["2026-10-12", "2026-10-18"]) {
        await activity(child.id, `Journee ${iso}`, {
          allDay: true,
          startsAt: day(iso),
          endsAt: day(iso),
        })
      }
      const { activities } = await listFamilySchedule(parent, WEEK)
      expect(activities).toHaveLength(2)
    })

    it("refuses an empty, reversed or too long window", async () => {
      const { parent } = await setupFamily()
      await expect(
        listFamilySchedule(parent, { from: WEEK.to, to: WEEK.from })
      ).rejects.toThrow(RangeError)
      await expect(
        listFamilySchedule(parent, { from: WEEK.from, to: WEEK.from })
      ).rejects.toThrow(RangeError)
      await expect(
        listFamilySchedule(parent, {
          from: WEEK.from,
          to: new Date(WEEK.from.getTime() + 71 * DAY_MS),
        })
      ).rejects.toThrow(RangeError)
    })
  })

  it("lists the members of the family in the order they joined", async () => {
    const { parent } = await setupFamily()
    const { members } = await listFamilySchedule(parent, WEEK)
    expect(members.map((m) => m.name)).toEqual(["Parent", "Enfant", "Frere"])
  })
})
