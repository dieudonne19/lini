import { db } from "@/lib/db"
import { hashToken } from "@/lib/token"

// The member a personal link token belongs to, or null (unknown, revoked or removed).
export function memberFromToken(token: string) {
  return db.member.findUnique({ where: { tokenHash: hashToken(token) } })
}

// Last-parent rule: a family must always keep one parent. Used by "remove" and "make child".
export async function isLastParent(memberId: string) {
  const member = await db.member.findUnique({ where: { id: memberId } })
  if (member?.role !== "parent") return false
  return (await db.member.count({ where: { familyId: member.familyId, role: "parent" } })) === 1
}
