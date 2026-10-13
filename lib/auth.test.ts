import { afterAll, describe, expect, it } from "vitest"

import { isLastParent, memberFromToken } from "@/lib/auth"
import { db } from "@/lib/db"
import { generateToken, hashToken } from "@/lib/token"

describe.skipIf(!process.env.DATABASE_URL)("auth", () => {
  const familyIds: string[] = []

  async function setup() {
    const family = await db.family.create({ data: { name: "Test" } })
    familyIds.push(family.id)
    const make = async (role: "parent" | "child") => {
      const token = generateToken()
      const member = await db.member.create({
        data: { familyId: family.id, name: role, color: "#000000", role, tokenHash: hashToken(token) },
      })
      return { member, token }
    }
    return { make }
  }

  afterAll(async () => {
    await db.family.deleteMany({ where: { id: { in: familyIds } } })
    await db.$disconnect()
  })

  it("finds a member by token, and nobody for an unknown token", async () => {
    const { make } = await setup()
    const { member, token } = await make("parent")
    expect((await memberFromToken(token))?.id).toBe(member.id)
    expect(await memberFromToken(generateToken())).toBeNull()
  })

  it("refuses the old token once the link is regenerated or the member removed", async () => {
    const { make } = await setup()
    const { member, token } = await make("child")
    await db.member.update({ where: { id: member.id }, data: { tokenHash: hashToken(generateToken()) } })
    expect(await memberFromToken(token)).toBeNull()
    const other = await make("child")
    await db.member.delete({ where: { id: other.member.id } })
    expect(await memberFromToken(other.token)).toBeNull()
  })

  it("protects the last parent only", async () => {
    const { make } = await setup()
    const first = await make("parent")
    const child = await make("child")
    expect(await isLastParent(first.member.id)).toBe(true)
    expect(await isLastParent(child.member.id)).toBe(false)
    const second = await make("parent")
    expect(await isLastParent(first.member.id)).toBe(false)
    expect(await isLastParent(second.member.id)).toBe(false)
  })
})
