import { afterAll, describe, expect, it } from "vitest"

import { memberFromToken } from "@/lib/auth"
import { db } from "@/lib/db"
import { createMember, listFamilyMembers } from "@/lib/members"
import { memberSchema } from "@/lib/schemas"

describe("memberSchema phone", () => {
  const base = { name: "Lina", color: "#2563eb", role: "child" }

  it("accepts an international number with separators and normalizes it", () => {
    expect(
      memberSchema.parse({ ...base, phone: "+261 34 12 345 67" }).phone
    ).toBe("+261341234567")
  })

  it("treats an empty number as none", () => {
    expect(memberSchema.parse({ ...base, phone: "" }).phone).toBeNull()
  })

  it("refuses a national number", () => {
    expect(
      memberSchema.safeParse({ ...base, phone: "0341234567" }).success
    ).toBe(false)
  })
})

describe.skipIf(!process.env.DATABASE_URL)("members", () => {
  const familyIds: string[] = []

  async function setupFamily() {
    const family = await db.family.create({ data: { name: "Test" } })
    familyIds.push(family.id)
    const input = {
      name: "Lina",
      color: "#2563eb",
      role: "child" as const,
      phone: "+261341234567",
    }
    await createMember(family.id, input)
    await createMember(family.id, {
      ...input,
      name: "Marc",
      role: "parent",
      phone: null,
    })
    return family
  }

  afterAll(async () => {
    await db.family.deleteMany({ where: { id: { in: familyIds } } })
    await db.$disconnect()
  })

  it("gives the new member a link that resolves to them, in their family", async () => {
    const family = await db.family.create({ data: { name: "Test" } })
    familyIds.push(family.id)
    const token = await createMember(family.id, {
      name: "Zoé",
      color: "#16a34a",
      role: "child",
      phone: null,
    })
    expect(await memberFromToken(token)).toMatchObject({
      name: "Zoé",
      familyId: family.id,
      role: "child",
    })
  })

  it("shows phone numbers to a parent", async () => {
    const family = await setupFamily()
    const members = await listFamilyMembers({
      familyId: family.id,
      role: "parent",
    })
    expect(members.find((m) => m.name === "Lina")?.phone).toBe("+261341234567")
  })

  it("never sends the phone key to a child", async () => {
    const family = await setupFamily()
    const members = await listFamilyMembers({
      familyId: family.id,
      role: "child",
    })
    expect(members).toHaveLength(2)
    for (const member of members) expect(member).not.toHaveProperty("phone")
  })

  it("never lists members of another family", async () => {
    const mine = await setupFamily()
    const other = await setupFamily()
    const members = await listFamilyMembers({
      familyId: mine.id,
      role: "parent",
    })
    const otherIds = (
      await db.member.findMany({ where: { familyId: other.id } })
    ).map((m) => m.id)
    expect(members.map((m) => m.id).some((id) => otherIds.includes(id))).toBe(
      false
    )
  })
})
