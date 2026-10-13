"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { getSessionParent } from "@/app/session"
import type { FormState } from "@/lib/form-state"
import { createMember } from "@/lib/members"
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
