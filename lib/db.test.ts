import { randomUUID } from "node:crypto"
import { afterAll, describe, expect, it } from "vitest"

import { db } from "@/lib/db"

// Runs on the Neon test branch (.env.test). Skipped when DATABASE_URL is missing (fork PRs).
describe.skipIf(!process.env.DATABASE_URL)("database constraints", () => {
  const familyIds: string[] = []

  async function setup() {
    const family = await db.family.create({ data: { name: "Test" } })
    familyIds.push(family.id)
    const member = await db.member.create({
      data: {
        familyId: family.id,
        name: "Parent",
        color: "#000000",
        role: "parent",
        tokenHash: randomUUID(),
      },
    })
    return { family, member }
  }

  // Deleting a family cascades to everything it owns.
  afterAll(async () => {
    await db.family.deleteMany({ where: { id: { in: familyIds } } })
    await db.$disconnect()
  })

  it("creates and reads back a member", async () => {
    const { member } = await setup()
    const found = await db.member.findUniqueOrThrow({ where: { id: member.id } })
    expect(found.role).toBe("parent")
    expect(found.phone).toBeNull()
  })

  it("refuses two members with the same token hash", async () => {
    const { family, member } = await setup()
    await expect(
      db.member.create({
        data: {
          familyId: family.id,
          name: "Clone",
          color: "#ffffff",
          role: "child",
          tokenHash: member.tokenHash,
        },
      })
    ).rejects.toThrow()
  })

  it("refuses two answers from the same member to the same event", async () => {
    const { family, member } = await setup()
    const event = await db.familyEvent.create({
      data: {
        familyId: family.id,
        createdById: member.id,
        status: "confirmed",
        title: "Repas",
        startsAt: new Date("2026-11-01T12:00:00Z"),
        endsAt: new Date("2026-11-01T14:00:00Z"),
      },
    })
    const data = { eventId: event.id, memberId: member.id }
    await db.rsvp.create({ data })
    await expect(db.rsvp.create({ data })).rejects.toThrow()
  })

  it("removing a member deletes their data but keeps a confirmed event", async () => {
    const { family, member } = await setup()
    const startsAt = new Date("2026-11-01T12:00:00Z")
    const endsAt = new Date("2026-11-01T14:00:00Z")
    await db.activity.create({
      data: { memberId: member.id, title: "Cours", startsAt, endsAt },
    })
    const event = await db.familyEvent.create({
      data: {
        familyId: family.id,
        createdById: member.id,
        status: "confirmed",
        title: "Repas",
        startsAt,
        endsAt,
      },
    })
    await db.rsvp.create({ data: { eventId: event.id, memberId: member.id } })

    await db.member.delete({ where: { id: member.id } })

    expect(await db.activity.count({ where: { memberId: member.id } })).toBe(0)
    expect(await db.rsvp.count({ where: { memberId: member.id } })).toBe(0)
    const kept = await db.familyEvent.findUniqueOrThrow({ where: { id: event.id } })
    expect(kept.createdById).toBeNull()
  })
})
