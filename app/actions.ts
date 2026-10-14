"use server"

import { redirect } from "next/navigation"
import { z } from "zod"

import { clearSession, setSession } from "@/app/session"
import { canCreateFamily, createFamilyWithParent } from "@/lib/families"
import type { FormState } from "@/lib/form-state"
import { familySchema } from "@/lib/schemas"

export type CreateFamilyField = "familyName" | "name" | "color"
export type CreateFamilyState =
  | (NonNullable<FormState<CreateFamilyField>> & {
      token?: string
      recoveryCode?: string
    })
  | null

// Form -> validation -> throttle -> domain -> cookie. Anyone can create a family.
export async function createFamily(
  _prev: CreateFamilyState,
  formData: FormData
): Promise<CreateFamilyState> {
  const values = {
    familyName: String(formData.get("familyName") ?? ""),
    name: String(formData.get("name") ?? ""),
    color: String(formData.get("color") ?? ""),
  }
  const parsed = familySchema.safeParse(values)
  if (!parsed.success)
    return { errors: z.flattenError(parsed.error).fieldErrors, values }

  if (!(await canCreateFamily())) {
    return {
      message:
        "Beaucoup de familles ont été créées ces dernières minutes. Réessaie dans une heure.",
      values,
    }
  }

  const { token, recoveryCode } = await createFamilyWithParent(parsed.data)
  await setSession(token)
  return { token, recoveryCode }
}

// Only removes the cookie: the personal link keeps working.
export async function logout() {
  await clearSession()
  redirect("/")
}
