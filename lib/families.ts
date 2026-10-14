import { db } from "@/lib/db"
import { generateRecoveryCode, normalizeRecoveryCode } from "@/lib/recovery"
import type { FamilyInput } from "@/lib/schemas"
import { generateToken, hashToken } from "@/lib/token"

// Anyone can create a family, so creation is throttled: a cap on the families created in the last hour, and one on
// all of them. It keeps a script from filling the database; it is not a defence against a determined attacker.
// shortcut: global counters, not per address, and two simultaneous requests can both pass the check. Add a per-address
// limiter backed by a shared store if abuse ever shows up.
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
