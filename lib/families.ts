import { db } from "@/lib/db"
import { generateRecoveryCode, normalizeRecoveryCode } from "@/lib/recovery"
import type { FamilyInput } from "@/lib/schemas"
import { generateToken, hashToken } from "@/lib/token"

export async function hasFamily() {
  return (await db.family.count()) > 0
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
