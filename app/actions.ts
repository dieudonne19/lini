"use server"

import { redirect } from "next/navigation"
import { z } from "zod"

import { clearSession, setSession } from "@/app/session"
import { createFamilyWithParent, hasFamily } from "@/lib/families"
import type { FormState } from "@/lib/form-state"
import { familySchema } from "@/lib/schemas"

export type CreateFamilyField = "familyName" | "name" | "color"
export type CreateFamilyState =
  | (NonNullable<FormState<CreateFamilyField>> & {
      token?: string
      recoveryCode?: string
    })
  | null

// Form -> validation -> domain -> cookie. Only possible while no family exists.
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

  // shortcut: two simultaneous first launches could both pass this check; add a DB-level guard if that ever matters.
  if (await hasFamily()) {
    return {
      message:
        "Une famille existe déjà. Demande ton lien personnel à un parent.",
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
