"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { getSessionMember } from "@/app/session"
import { parseEventPayload } from "@/lib/event-form"
import {
  answerEvent,
  createEvent,
  deleteEvent,
  refuseProposal,
  updateEvent,
  validateProposal,
  type EventResult,
} from "@/lib/events"
import type { ActionResult } from "@/lib/form-state"

const LINK_INVALID =
  "Ton lien ne fonctionne plus. Demande-en un nouveau à un parent."

// The words for each way an action can be refused. The domain says why; the screen says it plainly.
const FAILURE_MESSAGES = {
  "not-found": "Cet événement n'existe plus.",
  forbidden: "Tu ne peux pas faire cette action.",
  "already-handled": "Cette proposition a déjà été traitée.",
} as const

const toResult = (result: EventResult): ActionResult =>
  result.ok ? null : { message: FAILURE_MESSAGES[result.reason] }

// Everything the events screens show comes from these pages.
function refresh(id?: string) {
  revalidatePath("/")
  revalidatePath("/evenements")
  if (id) revalidatePath(`/evenements/${id}`)
}

// Form payload -> session -> validation -> domain. A parent publishes, a child proposes: the domain decides.
export async function createEventAction(
  formData: FormData
): Promise<ActionResult> {
  const member = await getSessionMember()
  if (!member) return { message: LINK_INVALID }

  const parsed = parseEventPayload(formData)
  if (!parsed.success)
    return { errors: z.flattenError(parsed.error).fieldErrors }

  const { id } = await createEvent(member, parsed.data)
  refresh()
  redirect(`/evenements/${id}`)
}

// Parents only (the domain refuses anyone else). The answers go back to "pending" if the dates change.
export async function updateEventAction(
  eventId: string,
  formData: FormData
): Promise<ActionResult> {
  const member = await getSessionMember()
  if (!member) return { message: LINK_INVALID }

  const parsed = parseEventPayload(formData)
  if (!parsed.success)
    return { errors: z.flattenError(parsed.error).fieldErrors }

  const result = await updateEvent(member, eventId, parsed.data)
  if (!result.ok) return toResult(result)
  refresh(eventId)
  redirect(`/evenements/${eventId}`)
}

const answerSchema = z.enum(["yes", "no", "maybe"])

// The member answers for themselves; "pending" cannot be chosen.
export async function answerEventAction(
  eventId: string,
  answer: string
): Promise<ActionResult> {
  const member = await getSessionMember()
  if (!member) return { message: LINK_INVALID }

  const parsed = answerSchema.safeParse(answer)
  if (!parsed.success)
    return { message: "Réponse inconnue. Recharge la page et réessaie." }

  const result = await answerEvent(member, eventId, parsed.data)
  if (result.ok) refresh(eventId)
  return toResult(result)
}

const proposalSchema = z.object({
  eventId: z.string().min(1),
  intent: z.enum(["validate", "refuse"]),
})

// A parent validates or refuses a proposal. Used as a form action: the button carries the intent.
export async function reviewProposalAction(
  _previous: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const member = await getSessionMember()
  if (!member) return { message: LINK_INVALID }

  const parsed = proposalSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success)
    return { message: "Action inconnue. Recharge la page et réessaie." }
  const { eventId, intent } = parsed.data

  const result =
    intent === "validate"
      ? await validateProposal(member, eventId)
      : await refuseProposal(member, eventId)
  if (result.ok) refresh(eventId)
  return toResult(result)
}

// A parent deletes any event; a child withdraws their own proposal (the domain applies the right rule).
export async function deleteEventAction(
  eventId: string
): Promise<ActionResult> {
  const member = await getSessionMember()
  if (!member) return { message: LINK_INVALID }

  const result = await deleteEvent(member, eventId)
  if (!result.ok) return toResult(result)
  refresh(eventId)
  redirect("/evenements")
}
