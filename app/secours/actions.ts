"use server"

import { setSession } from "@/app/session"
import { recoverParentLink } from "@/lib/recovery"
import { recoverySchema } from "@/lib/schemas"

export type RecoverAccessState = {
  message?: string
  // What was typed, to refill the form (never the code).
  name?: string
  // Set on success: the parent's new link token and the new recovery code, shown once.
  token?: string
  recoveryCode?: string
  memberName?: string
} | null

// Open to anyone, so it is strict: validation, then the domain, then one generic answer. Whatever was wrong (the code,
// the name, a child's name) the visitor gets the same message and learns nothing. On success the parent is signed in.
export async function recoverAccess(
  _prev: RecoverAccessState,
  formData: FormData
): Promise<RecoverAccessState> {
  const name = String(formData.get("name") ?? "")
  const parsed = recoverySchema.safeParse({
    code: String(formData.get("code") ?? ""),
    name,
  })
  if (!parsed.success)
    return { message: "Écris ton code de secours et ton prénom.", name }

  const result = await recoverParentLink(parsed.data.code, parsed.data.name)
  if (!result)
    return {
      message: "Code ou prénom incorrect. Vérifie-les et réessaie.",
      name,
    }

  await setSession(result.token)
  return result
}
