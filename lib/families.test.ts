import { afterAll, describe, expect, it } from "vitest"

import { memberFromToken } from "@/lib/auth"
import { db } from "@/lib/db"
import { createFamilyWithParent } from "@/lib/families"
import { personalLink } from "@/lib/links"

describe("personalLink", () => {
  it("builds the login URL", () => {
    expect(personalLink("https://lini.app", "abc")).toBe("https://lini.app/m/abc")
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
    const token = await createFamilyWithParent({ familyName, name: "Lina", color: "#3D6DF2" })

    const member = await memberFromToken(token)
    expect(member).toMatchObject({ name: "Lina", role: "parent", color: "#3D6DF2" })
    const family = await db.family.findUniqueOrThrow({ where: { id: member!.familyId }, include: { members: true } })
    expect(family.name).toBe(familyName)
    expect(family.members).toHaveLength(1)
  })
})
