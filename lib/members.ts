import { db } from "@/lib/db"
import type { Member, Prisma, Role } from "@/lib/generated/prisma/client"
import type { MemberInput } from "@/lib/schemas"
import { generateToken, hashToken } from "@/lib/token"

// What a viewer may see of a member. `phone` is present only for parents: for a child the key does not exist.
export type MemberView = {
  id: string
  name: string
  color: string
  role: Role
  phone?: string | null
}

// The single read function for family members: scoped to the viewer's family, phone hidden from children.
export async function listFamilyMembers(
  viewer: Pick<Member, "familyId" | "role">
): Promise<MemberView[]> {
  const members = await db.member.findMany({
    where: { familyId: viewer.familyId },
    orderBy: { createdAt: "asc" },
  })
  return members.map(({ id, name, color, role, phone }) =>
    viewer.role === "parent"
      ? { id, name, color, role, phone }
      : { id, name, color, role }
  )
}

// Adds a member to a family. Returns the personal link token: it is not stored, only its hash is.
export async function createMember(familyId: string, input: MemberInput) {
  const token = generateToken()
  await db.member.create({
    data: { ...input, familyId, tokenHash: hashToken(token) },
  })
  return token
}

export type ManageResult =
  { ok: true } | { ok: false; reason: "not-found" | "last-parent" }

// Replaces the member's link: the old one stops working at once. Returns the new token, or null
// when the member does not belong to the family.
export async function regenerateLink(familyId: string, memberId: string) {
  const token = generateToken()
  const { count } = await db.member.updateMany({
    where: { id: memberId, familyId },
    data: { tokenHash: hashToken(token) },
  })
  return count ? token : null
}

// Last-parent rule: a family keeps at least one parent. `losesParent` is true when the action
// would stop this member from being a parent (removal, or role change to child).
async function checkTarget(
  tx: Prisma.TransactionClient,
  familyId: string,
  memberId: string,
  losesParent: boolean
): Promise<ManageResult> {
  const target = await tx.member.findFirst({
    where: { id: memberId, familyId },
  })
  if (!target) return { ok: false, reason: "not-found" }
  if (losesParent && target.role === "parent") {
    const parents = await tx.member.count({
      where: { familyId, role: "parent" },
    })
    if (parents === 1) return { ok: false, reason: "last-parent" }
  }
  return { ok: true }
}

// Serializable: two parents removing each other at the same time must not leave the family without one.
const SERIALIZABLE = { isolationLevel: "Serializable" } as const

// Removes a member with their proposals. Their activities and answers go with them (cascade);
// confirmed events they created stay.
export function removeMember(familyId: string, memberId: string) {
  return db.$transaction(async (tx) => {
    const check = await checkTarget(tx, familyId, memberId, true)
    if (!check.ok) return check
    await tx.familyEvent.deleteMany({
      where: { createdById: memberId, status: "proposed" },
    })
    await tx.member.delete({ where: { id: memberId } })
    return check
  }, SERIALIZABLE)
}

export function changeRole(familyId: string, memberId: string, role: Role) {
  return db.$transaction(async (tx) => {
    const check = await checkTarget(tx, familyId, memberId, role === "child")
    if (!check.ok) return check
    await tx.member.update({ where: { id: memberId }, data: { role } })
    return check
  }, SERIALIZABLE)
}
