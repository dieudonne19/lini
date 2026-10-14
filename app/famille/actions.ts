"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { getSessionParent } from "@/app/session"
import { db } from "@/lib/db"
import type { FormState } from "@/lib/form-state"
import {
  changeRole,
  createMember,
  regenerateLink,
  removeMember,
} from "@/lib/members"
import { setRecoveryCode } from "@/lib/recovery"
import { memberSchema } from "@/lib/schemas"

export type AddMemberField = "name" | "color" | "role" | "phone"
export type AddMemberState =
  | (NonNullable<FormState<AddMemberField>> & {
      token?: string
      memberName?: string
    })
  | null

// Form -> parent check -> validation -> domain. The new member's link is returned once.
export async function addMember(
  _prev: AddMemberState,
  formData: FormData
): Promise<AddMemberState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    color: String(formData.get("color") ?? ""),
    role: String(formData.get("role") ?? ""),
    phone: String(formData.get("phone") ?? ""),
  }
  const parent = await getSessionParent()
  if (!parent)
    return { message: "Seuls les parents peuvent ajouter un membre.", values }

  const parsed = memberSchema.safeParse(values)
  if (!parsed.success)
    return { errors: z.flattenError(parsed.error).fieldErrors, values }

  const token = await createMember(parent.familyId, parsed.data)
  revalidatePath("/famille")
  return { token, memberName: parsed.data.name }
}

const manageSchema = z.object({
  memberId: z.string().min(1),
  intent: z.enum(["regenerate", "make-parent", "make-child", "remove"]),
})

export type ManageMemberState = {
  message?: string
  token?: string
  memberName?: string
} | null

const FAILURE_MESSAGES = {
  "not-found": "Ce membre n'existe plus.",
  "last-parent":
    "Une famille garde au moins un parent. Ajoute d'abord un deuxième parent.",
} as const

// Form -> parent check -> domain, always scoped to the parent's own family.
export async function manageMember(
  _prev: ManageMemberState,
  formData: FormData
): Promise<ManageMemberState> {
  const parent = await getSessionParent()
  if (!parent)
    return { message: "Seuls les parents peuvent gérer les membres." }

  const parsed = manageSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success)
    return { message: "Action inconnue. Recharge la page et réessaie." }
  const { memberId, intent } = parsed.data

  if (intent === "regenerate") {
    const token = await regenerateLink(parent.familyId, memberId)
    if (!token) return { message: FAILURE_MESSAGES["not-found"] }
    const member = await db.member.findUnique({
      where: { id: memberId },
      select: { name: true },
    })
    revalidatePath("/famille")
    return { token, memberName: member?.name }
  }

  const result =
    intent === "remove"
      ? await removeMember(parent.familyId, memberId)
      : await changeRole(
          parent.familyId,
          memberId,
          intent === "make-parent" ? "parent" : "child"
        )
  revalidatePath("/famille")
  return result.ok ? null : { message: FAILURE_MESSAGES[result.reason] }
}

export type RenewRecoveryState = { message?: string; code?: string } | null

// Makes a new recovery code for the family (the old one stops working) and returns it once. Parents only.
export async function renewRecoveryCode(): Promise<RenewRecoveryState> {
  const parent = await getSessionParent()
  if (!parent)
    return { message: "Seuls les parents peuvent gérer le code de secours." }

  const code = await setRecoveryCode(parent.familyId)
  revalidatePath("/famille")
  return { code }
}
