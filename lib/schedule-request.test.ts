import { afterAll, describe, expect, it } from "vitest"

import { db } from "@/lib/db"
import { loadSchedule } from "@/lib/schedule-request"

const SECRET = "Rendez-vous chez le psychologue"
const day = (iso: string) => `${iso}T00:00:00.000Z`
const at = (iso: string, hour: number) =>
  new Date(new Date(day(iso)).getTime() + hour * 3_600_000)

describe.skipIf(!process.env.DATABASE_URL)("loadSchedule", () => {
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
    return {
      family,
      parent: await member("Parent", "parent", "+261340000001"),
      child: await member("Enfant", "child"),
    }
  }

  const activity = (memberId: string, title: string, overrides = {}) =>
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

  it("refuses dates that are not UTC instants", async () => {
    const { parent } = await setupFamily()
    for (const [from, to] of [
      ["demain", day("2026-10-20")],
      [day("2026-10-14"), "2026-10-20"],
      [day("2026-10-14"), "2026-10-20T10:00:00+02:00"],
      ["", ""],
    ]) {
      expect(await loadSchedule(parent, from, to), `${from} -> ${to}`).toEqual({
        ok: false,
        message: "Impossible de lire cette période.",
      })
    }
  })

  it("refuses an empty, a reversed and a too long period", async () => {
    const { parent } = await setupFamily()
    const refused = { ok: false, message: "Impossible de lire cette période." }
    expect(
      await loadSchedule(parent, day("2026-10-14"), day("2026-10-14"))
    ).toEqual(refused)
    expect(
      await loadSchedule(parent, day("2026-10-20"), day("2026-10-14"))
    ).toEqual(refused)
    expect(
      await loadSchedule(parent, day("2026-01-01"), day("2026-06-01"))
    ).toEqual(refused)
  })

  it("returns the family's schedule for a valid period, and only the period", async () => {
    const { parent, child } = await setupFamily()
    await activity(child.id, "Dans la période")
    await activity(child.id, "Hors période", {
      startsAt: at("2026-12-01", 10),
      endsAt: at("2026-12-01", 11),
    })
    const result = await loadSchedule(
      parent,
      day("2026-10-12"),
      day("2026-10-19")
    )
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.schedule.members.map((m) => m.name)).toEqual([
      "Parent",
      "Enfant",
    ])
    expect(
      result.schedule.activities.map((a) =>
        a.kind === "full" ? a.title : "busy"
      )
    ).toEqual(["Dans la période"])
  })

  it("never sends the title of another member's private activity, nor a phone number", async () => {
    const { parent, child } = await setupFamily()
    await activity(child.id, SECRET, { isPrivate: true })
    await activity(parent.id, "Mon rendez-vous privé", { isPrivate: true })

    const asParent = await loadSchedule(
      parent,
      day("2026-10-12"),
      day("2026-10-19")
    )
    expect(asParent.ok).toBe(true)
    if (!asParent.ok) return
    const busy = asParent.schedule.activities.find(
      (a) => a.memberId === child.id
    )!
    expect(busy.kind).toBe("busy")
    expect(busy).not.toHaveProperty("title")
    expect(JSON.stringify(asParent)).not.toContain("psychologue")
    // The viewer's own private activity stays in full.
    expect(
      asParent.schedule.activities.find((a) => a.memberId === parent.id)
    ).toMatchObject({
      kind: "full",
      title: "Mon rendez-vous privé",
    })
    expect(JSON.stringify(asParent)).not.toContain("+26134")
  })

  it("never returns another family's activities", async () => {
    const mine = await setupFamily()
    const theirs = await setupFamily()
    await activity(theirs.child.id, "Secret d'une autre famille")
    const result = await loadSchedule(
      mine.parent,
      day("2026-10-12"),
      day("2026-10-19")
    )
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.schedule.activities).toEqual([])
    expect(JSON.stringify(result)).not.toContain("autre famille")
  })
})
