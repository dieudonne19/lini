import { randomBytes } from "node:crypto"

import { db } from "@/lib/db"
import { generateToken, hashToken } from "@/lib/token"

// Crockford base32 without I, L, O and U: no look-alikes when the code is copied by hand.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
const CODE_LENGTH = 16

// 16 characters of 32 symbols: 80 bits, far beyond guessing. 256 is a multiple of 32, so `byte % 32` has no bias.
// Shown as XXXX-XXXX-XXXX-XXXX.
export function generateRecoveryCode() {
  const characters = Array.from(
    randomBytes(CODE_LENGTH),
    (byte) => ALPHABET[byte % ALPHABET.length]
  )
  return characters.join("").replace(/(.{4})(?=.)/g, "$1-")
}

// What a person types back: any case, with or without dashes and spaces; O reads as 0, I and L as 1 (the Crockford
// rule). Null when it cannot be a code, so that nothing is looked up for it.
export function normalizeRecoveryCode(input: string) {
  const code = input
    .toUpperCase()
    .replace(/[\s-]/g, "")
    .replace(/O/g, "0")
    .replace(/[IL]/g, "1")
  return code.length === CODE_LENGTH &&
    [...code].every((c) => ALPHABET.includes(c))
    ? code
    : null
}

// Gives the family a new recovery code, replacing any previous one. Returns it: only its hash is stored.
export async function setRecoveryCode(familyId: string) {
  const code = generateRecoveryCode()
  await db.family.update({
    where: { id: familyId },
    data: { recoveryCodeHash: hashToken(normalizeRecoveryCode(code)!) },
  })
  return code
}

export async function hasRecoveryCode(familyId: string) {
  const family = await db.family.findUnique({
    where: { id: familyId },
    select: { recoveryCodeHash: true },
  })
  return !!family?.recoveryCodeHash
}

// Recovery for a parent who lost their link. The code names the family, the first name names a parent of it.
// On success the parent's link AND the code are replaced (a code works once) and both new values are returned.
// Any mismatch (wrong code, unknown name, a child's name) returns null: the caller must not say which part was wrong.
// shortcut: no rate limit, an 80-bit code cannot be guessed; add a limiter backed by a shared store if codes get shorter.
// shortcut: two parents with the same first name: the older one is recovered.
export async function recoverParentLink(rawCode: string, rawName: string) {
  const code = normalizeRecoveryCode(rawCode)
  const name = rawName.trim().toLowerCase()
  if (!code || !name) return null

  const currentHash = hashToken(code)
  const family = await db.family.findUnique({
    where: { recoveryCodeHash: currentHash },
    include: {
      members: { where: { role: "parent" }, orderBy: { createdAt: "asc" } },
    },
  })
  const parent = family?.members.find((m) => m.name.toLowerCase() === name)
  if (!family || !parent) return null

  const token = generateToken()
  const recoveryCode = generateRecoveryCode()
  return db.$transaction(async (tx) => {
    // Single use even when two requests race: only the one that still finds the old hash wins.
    const { count } = await tx.family.updateMany({
      where: { id: family.id, recoveryCodeHash: currentHash },
      data: {
        recoveryCodeHash: hashToken(normalizeRecoveryCode(recoveryCode)!),
      },
    })
    if (count === 0) return null
    await tx.member.update({
      where: { id: parent.id },
      data: { tokenHash: hashToken(token) },
    })
    return { token, recoveryCode, memberName: parent.name }
  })
}
