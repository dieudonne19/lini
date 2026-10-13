import { afterAll, describe, expect, it } from "vitest"

import { memberFromToken } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  changeRole,
  createMember,
  listFamilyMembers,
  regenerateLink,
  removeMember,
} from "@/lib/members"
import { memberSchema } from "@/lib/schemas"

describe("memberSchema phone", () => {
  const base = { name: "Lina", color: "#3D6DF2", role: "child" }

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
      color: "#3D6DF2",
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
      color: "#2FB67C",
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

  // A family with one parent and one child, each with a known link token.
  async function setupManaged() {
    const family = await db.family.create({ data: { name: "Test" } })
    familyIds.push(family.id)
    const input = { color: "#3D6DF2", phone: null }
    const parentToken = await createMember(family.id, {
      ...input,
      name: "Papa",
      role: "parent",
    })
    const childToken = await createMember(family.id, {
      ...input,
      name: "Lina",
      role: "child",
    })
    const parent = (await memberFromToken(parentToken))!
    const child = (await memberFromToken(childToken))!
    return { family, parent, child, parentToken, childToken }
  }

  it("regenerates a link: the old one dies, the new one works, other families are refused", async () => {
    const { family, child, childToken } = await setupManaged()
    const newToken = await regenerateLink(family.id, child.id)
    expect(newToken).not.toBeNull()
    expect(await memberFromToken(childToken)).toBeNull()
    expect((await memberFromToken(newToken!))?.id).toBe(child.id)

    const other = await setupManaged()
    expect(await regenerateLink(other.family.id, child.id)).toBeNull()
    expect((await memberFromToken(newToken!))?.id).toBe(child.id)
  })

  it("removes a member, their proposals and their link, but keeps a confirmed event", async () => {
    const { family, child, childToken } = await setupManaged()
    const event = {
      familyId: family.id,
      createdById: child.id,
      startsAt: new Date(),
      endsAt: new Date(),
    }
    await db.familyEvent.create({
      data: { ...event, title: "Idée", status: "proposed" },
    })
    await db.familyEvent.create({
      data: { ...event, title: "Repas", status: "confirmed" },
    })

    expect(await removeMember(family.id, child.id)).toEqual({ ok: true })
    expect(await memberFromToken(childToken)).toBeNull()
    const titles = (
      await db.familyEvent.findMany({ where: { familyId: family.id } })
    ).map((e) => e.title)
    expect(titles).toEqual(["Repas"])
  })

  it("refuses to remove a member of another family", async () => {
    const { family } = await setupManaged()
    const other = await setupManaged()
    expect(await removeMember(family.id, other.child.id)).toEqual({
      ok: false,
      reason: "not-found",
    })
  })

  it("protects the last parent from removal and from becoming a child", async () => {
    const { family, parent } = await setupManaged()
    expect(await removeMember(family.id, parent.id)).toEqual({
      ok: false,
      reason: "last-parent",
    })
    expect(await changeRole(family.id, parent.id, "child")).toEqual({
      ok: false,
      reason: "last-parent",
    })
    expect(
      (await db.member.findUniqueOrThrow({ where: { id: parent.id } })).role
    ).toBe("parent")
  })

  it("lets a parent step down or be removed once another parent exists", async () => {
    const { family, parent, child } = await setupManaged()
    expect(await changeRole(family.id, child.id, "parent")).toEqual({
      ok: true,
    })
    expect(await changeRole(family.id, parent.id, "child")).toEqual({
      ok: true,
    })
    // child is now the only parent again
    expect(await removeMember(family.id, child.id)).toEqual({
      ok: false,
      reason: "last-parent",
    })
  })
})
