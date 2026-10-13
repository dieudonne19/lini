import { db } from "@/lib/db"
import type { Member, Role } from "@/lib/generated/prisma/client"
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
