"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { getSessionMember } from "@/app/session"
import { createActivity } from "@/lib/activities"
import { parseActivityPayload } from "@/lib/activity-form"

export type ActivityActionState = {
  message?: string
  // Keyed by the stored field names (title, startsAt, endsAt, repeat, repeatUntil).
  errors?: Partial<Record<string, string[]>>
} | null

// Form payload -> session -> validation -> domain. A member only ever creates activities for themselves.
export async function createActivityAction(
  _prev: ActivityActionState,
  formData: FormData
): Promise<ActivityActionState> {
  const member = await getSessionMember()
  if (!member) {
    return {
      message:
        "Ton lien ne fonctionne plus. Demande-en un nouveau à un parent.",
    }
  }

  const parsed = parseActivityPayload(formData)
  if (!parsed.success)
    return { errors: z.flattenError(parsed.error).fieldErrors }

  await createActivity(member.id, parsed.data)
  revalidatePath("/agenda")
  redirect("/agenda")
}
