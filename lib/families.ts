import { db } from "@/lib/db"
import { generateRecoveryCode, normalizeRecoveryCode } from "@/lib/recovery"
import type { FamilyInput } from "@/lib/schemas"
import { generateToken, hashToken } from "@/lib/token"

// Anyone can create a family, so creation is throttled: a cap on the families created in the last hour, and one on
// all of them, on top of the per-address limit (lib/rate-limit.ts). It keeps a script from filling the database.
// shortcut: global counters, and two simultaneous requests can both pass the check. A botnet with many addresses can
// still use up the hourly cap; add a bot check on the form if that ever happens.
export const FAMILY_LIMITS = { perHour: 10, total: 500 }

export async function canCreateFamily(limits = FAMILY_LIMITS) {
  const [lastHour, total] = await Promise.all([
    db.family.count({
      where: { createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
    }),
    db.family.count(),
  ])
  return lastHour < limits.perHour && total < limits.total
}

// Deletes a family and everything that belongs to it: members, their activities, events and answers, through the
// cascades of the schema. Irreversible.
export async function deleteFamily(familyId: string) {
  await db.family.delete({ where: { id: familyId } })
}

// Creates a family and its first parent. Returns the personal link token and the recovery code: neither is stored,
// only their hashes are.
export async function createFamilyWithParent({
  familyName,
  name,
  color,
}: FamilyInput) {
  const token = generateToken()
  const recoveryCode = generateRecoveryCode()
  await db.family.create({
    data: {
      name: familyName,
      recoveryCodeHash: hashToken(normalizeRecoveryCode(recoveryCode)!),
      members: {
        create: { name, color, role: "parent", tokenHash: hashToken(token) },
      },
    },
  })
  return { token, recoveryCode }
}
