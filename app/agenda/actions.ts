"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { getSessionMember } from "@/app/session"
import {
  createActivity,
  deleteActivity,
  updateActivity,
} from "@/lib/activities"
import { parseActivityPayload } from "@/lib/activity-form"

export type ActivityActionState = {
  message?: string
  // Keyed by the stored field names (title, startsAt, endsAt, repeat, repeatUntil).
  errors?: Partial<Record<string, string[]>>
} | null

const LINK_INVALID =
  "Ton lien ne fonctionne plus. Demande-en un nouveau à un parent."
const ACTIVITY_GONE = "Cette activité n'existe plus."

// Session + validation shared by creation and update. A member only ever acts on their own activities.
async function authorizeAndParse(formData: FormData) {
  const member = await getSessionMember()
  if (!member)
    return { state: { message: LINK_INVALID } as ActivityActionState }

  const parsed = parseActivityPayload(formData)
  if (!parsed.success) {
    return {
      state: {
        errors: z.flattenError(parsed.error).fieldErrors,
      } as ActivityActionState,
    }
  }
  return { member, input: parsed.data }
}

export async function createActivityAction(
  formData: FormData
): Promise<ActivityActionState> {
  const result = await authorizeAndParse(formData)
  if (!result.member) return result.state

  await createActivity(result.member.id, result.input)
  revalidatePath("/agenda")
  redirect("/agenda")
}

// Updates the whole series.
export async function updateActivityAction(
  activityId: string,
  formData: FormData
): Promise<ActivityActionState> {
  const result = await authorizeAndParse(formData)
  if (!result.member) return result.state

  if (!(await updateActivity(result.member.id, activityId, result.input))) {
    return { message: ACTIVITY_GONE }
  }
  revalidatePath("/agenda")
  redirect("/agenda")
}

// Deletes the whole series.
export async function deleteActivityAction(
  activityId: string
): Promise<ActivityActionState> {
  const member = await getSessionMember()
  if (!member) return { message: LINK_INVALID }

  if (!(await deleteActivity(member.id, activityId))) {
    return { message: ACTIVITY_GONE }
  }
  revalidatePath("/agenda")
  redirect("/agenda")
}
