import { db } from "@/lib/db"
import type { FamilyInput } from "@/lib/schemas"
import { generateToken, hashToken } from "@/lib/token"

export async function hasFamily() {
  return (await db.family.count()) > 0
}

// Creates a family and its first parent. Returns the personal link token: it is not stored, only its hash is.
export async function createFamilyWithParent({ familyName, name, color }: FamilyInput) {
  const token = generateToken()
  await db.family.create({
    data: { name: familyName, members: { create: { name, color, role: "parent", tokenHash: hashToken(token) } } },
  })
  return token
}
