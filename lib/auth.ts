import { db } from "@/lib/db"
import { hashToken } from "@/lib/token"

// The member a personal link token belongs to, or null (unknown, revoked or removed).
export function memberFromToken(token: string) {
  return db.member.findUnique({ where: { tokenHash: hashToken(token) } })
}
