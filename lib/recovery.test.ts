import { afterAll, describe, expect, it } from "vitest"

import { memberFromToken } from "@/lib/auth"
import { db } from "@/lib/db"
import { createFamilyWithParent } from "@/lib/families"
import {
  generateRecoveryCode,
  hasRecoveryCode,
  normalizeRecoveryCode,
  recoverParentLink,
  setRecoveryCode,
} from "@/lib/recovery"
import { hashToken } from "@/lib/token"

const SHAPE = /^[0-9A-HJKMNP-TV-Z]{4}(-[0-9A-HJKMNP-TV-Z]{4}){3}$/

describe("generateRecoveryCode", () => {
  it("is 16 characters in four groups, with no look-alike letters", () => {
    for (let i = 0; i < 200; i++) expect(generateRecoveryCode()).toMatch(SHAPE)
  })

  it("never repeats", () => {
    const codes = new Set(Array.from({ length: 500 }, generateRecoveryCode))
    expect(codes.size).toBe(500)
  })
})

describe("normalizeRecoveryCode", () => {
  it("reads back what generateRecoveryCode wrote, whatever the case, dashes and spaces", () => {
    const code = generateRecoveryCode()
    const plain = code.replaceAll("-", "")
    expect(normalizeRecoveryCode(code)).toBe(plain)
    expect(normalizeRecoveryCode(code.toLowerCase())).toBe(plain)
    expect(normalizeRecoveryCode(` ${code.replaceAll("-", " ")} `)).toBe(plain)
  })

  it("reads O as 0, and I and L as 1", () => {
    expect(normalizeRecoveryCode("OOOO-IIII-LLLL-0011")).toBe(
      "0000111111110011"
    )
  })

  it("refuses anything that cannot be a code", () => {
    expect(normalizeRecoveryCode("")).toBeNull()
    expect(normalizeRecoveryCode("ABCD-EFGH")).toBeNull()
    expect(normalizeRecoveryCode("ABCD-EFGH-JKMN-PQRSX")).toBeNull()
    expect(normalizeRecoveryCode("ABCD-EFGH-JKMN-PQR!")).toBeNull()
    // U is not in the alphabet.
    expect(normalizeRecoveryCode("ABCD-EFGH-JKMN-PQRU")).toBeNull()
  })
})

describe.skipIf(!process.env.DATABASE_URL)("recovery with the database", () => {
  const familyNames: string[] = []

  afterAll(async () => {
    await db.family.deleteMany({ where: { name: { in: familyNames } } })
    await db.$disconnect()
  })

  async function setup() {
    const familyName = `Test ${crypto.randomUUID()}`
    familyNames.push(familyName)
    const { token, recoveryCode } = await createFamilyWithParent({
      familyName,
      name: "René",
      color: "#3D6DF2",
    })
    const parent = (await memberFromToken(token))!
    const child = await db.member.create({
      data: {
        familyId: parent.familyId,
        name: "Zoé",
        color: "#F2A93B",
        role: "child",
        tokenHash: hashToken(`child-${familyName}`),
      },
    })
    return { familyId: parent.familyId, parent, child, token, recoveryCode }
  }

  it("gives a parent a new link and a new code, and retires the old ones", async () => {
    const { parent, token, recoveryCode } = await setup()

    // Typed by hand: lower case, without dashes.
    const result = await recoverParentLink(
      recoveryCode.toLowerCase().replaceAll("-", ""),
      "  rené "
    )
    expect(result).not.toBeNull()
    expect(result!.memberName).toBe("René")
    expect(result!.recoveryCode).toMatch(SHAPE)
    expect(result!.recoveryCode).not.toBe(recoveryCode)

    expect((await memberFromToken(result!.token))?.id).toBe(parent.id)
    expect(await memberFromToken(token)).toBeNull()
    // The code worked once.
    expect(await recoverParentLink(recoveryCode, "René")).toBeNull()
    // The new one works, once more.
    expect(await recoverParentLink(result!.recoveryCode, "René")).not.toBeNull()
  })

  it("says nothing more than null for a wrong code, an unknown name or a child's name, and keeps the code valid", async () => {
    const { child, token, recoveryCode } = await setup()

    expect(await recoverParentLink(generateRecoveryCode(), "René")).toBeNull()
    expect(await recoverParentLink(recoveryCode, "Personne")).toBeNull()
    expect(await recoverParentLink(recoveryCode, child.name)).toBeNull()
    expect(await recoverParentLink("not a code", "René")).toBeNull()
    expect(await recoverParentLink(recoveryCode, "   ")).toBeNull()

    // Nothing changed: the parent's link and the code still work.
    expect(await memberFromToken(token)).not.toBeNull()
    expect(await recoverParentLink(recoveryCode, "René")).not.toBeNull()
  })

  it("lets only one of two simultaneous requests use a code", async () => {
    const { recoveryCode } = await setup()
    const results = await Promise.all([
      recoverParentLink(recoveryCode, "René"),
      recoverParentLink(recoveryCode, "René"),
    ])
    expect(results.filter((r) => r !== null)).toHaveLength(1)
  })

  it("replaces the code when a new one is set, and reports whether there is one", async () => {
    const { familyId, recoveryCode } = await setup()
    expect(await hasRecoveryCode(familyId)).toBe(true)

    const next = await setRecoveryCode(familyId)
    expect(next).toMatch(SHAPE)
    expect(await recoverParentLink(recoveryCode, "René")).toBeNull()
    expect(await recoverParentLink(next, "René")).not.toBeNull()

    await db.family.update({
      where: { id: familyId },
      data: { recoveryCodeHash: null },
    })
    expect(await hasRecoveryCode(familyId)).toBe(false)
  })
})
