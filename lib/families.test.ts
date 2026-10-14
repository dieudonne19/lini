import { afterAll, describe, expect, it } from "vitest"

import { memberFromToken } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  canCreateFamily,
  createFamilyWithParent,
  deleteFamily,
} from "@/lib/families"
import { personalLink } from "@/lib/links"
import { normalizeRecoveryCode } from "@/lib/recovery"
import { hashToken } from "@/lib/token"

describe("personalLink", () => {
  it("builds the login URL", () => {
    expect(personalLink("https://lini.app", "abc")).toBe(
      "https://lini.app/m/abc"
    )
  })
})

describe.skipIf(!process.env.DATABASE_URL)("createFamilyWithParent", () => {
  const familyNames: string[] = []

  afterAll(async () => {
    await db.family.deleteMany({ where: { name: { in: familyNames } } })
    await db.$disconnect()
  })

  it("creates a family whose only member is a parent reachable by the returned token", async () => {
    const familyName = `Test ${crypto.randomUUID()}`
    familyNames.push(familyName)
    const { token, recoveryCode } = await createFamilyWithParent({
      familyName,
      name: "Lina",
      color: "#3D6DF2",
    })

    const member = await memberFromToken(token)
    expect(member).toMatchObject({
      name: "Lina",
      role: "parent",
      color: "#3D6DF2",
    })
    const family = await db.family.findUniqueOrThrow({
      where: { id: member!.familyId },
      include: { members: true },
    })
    expect(family.name).toBe(familyName)
    expect(family.members).toHaveLength(1)
    // Only the hash of the recovery code is stored, never the code itself.
    expect(family.recoveryCodeHash).toBe(
      hashToken(normalizeRecoveryCode(recoveryCode)!)
    )
    expect(family.recoveryCodeHash).not.toContain(recoveryCode)
  })

  // The limits are what is tested, not the number of families already in the database (other tests create some).
  it("lets families be created while the caps are not reached, and refuses when either one is", async () => {
    const open = { perHour: 1_000_000, total: 1_000_000 }
    expect(await canCreateFamily(open)).toBe(true)
    expect(await canCreateFamily({ ...open, perHour: 0 })).toBe(false)
    expect(await canCreateFamily({ ...open, total: 0 })).toBe(false)
    // The hourly cap counts the family just created.
    const familyName = `Test ${crypto.randomUUID()}`
    familyNames.push(familyName)
    await createFamilyWithParent({ familyName, name: "Lina", color: "#3D6DF2" })
    expect(await canCreateFamily({ ...open, perHour: 1 })).toBe(false)
  })

  it("deletes a family with all it holds, and leaves other families alone", async () => {
    const make = async (label: string) => {
      const familyName = `Test ${label} ${crypto.randomUUID()}`
      familyNames.push(familyName)
      const { token } = await createFamilyWithParent({
        familyName,
        name: "Lina",
        color: "#3D6DF2",
      })
      return (await memberFromToken(token))!
    }
    const doomed = await make("doomed")
    const kept = await make("kept")
    const at = new Date("2026-10-20T10:00:00Z")
    const activity = await db.activity.create({
      data: { memberId: doomed.id, title: "Piano", startsAt: at, endsAt: at },
    })
    const event = await db.familyEvent.create({
      data: {
        familyId: doomed.familyId,
        createdById: doomed.id,
        status: "confirmed",
        title: "Dîner",
        startsAt: at,
        endsAt: at,
        rsvps: { create: { memberId: doomed.id } },
      },
    })

    await deleteFamily(doomed.familyId)

    expect(
      await db.family.findUnique({ where: { id: doomed.familyId } })
    ).toBeNull()
    expect(await db.member.findUnique({ where: { id: doomed.id } })).toBeNull()
    expect(
      await db.activity.findUnique({ where: { id: activity.id } })
    ).toBeNull()
    expect(
      await db.familyEvent.findUnique({ where: { id: event.id } })
    ).toBeNull()
    expect(await db.rsvp.count({ where: { eventId: event.id } })).toBe(0)
    expect(
      await db.family.findUnique({ where: { id: kept.familyId } })
    ).not.toBeNull()
    expect(
      await db.member.findUnique({ where: { id: kept.id } })
    ).not.toBeNull()
  })
})
