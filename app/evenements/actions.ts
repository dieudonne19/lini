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
  getEvent,
  refuseProposal,
  updateEvent,
  validateProposal,
  type EventResult,
} from "@/lib/events"
import type { ActionResult } from "@/lib/form-state"
import {
  notifyProposed,
  notifyPublished,
  notifyRefused,
  notifyRescheduled,
  notifyValidated,
} from "@/lib/notifications"
import { loadSchedule, type ScheduleResult } from "@/lib/schedule-request"

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

// A notification that cannot be sent never undoes what was saved: it comes back as a number of devices not reached,
// and a failure of the sending itself counts as one.
async function attempt(send: () => Promise<number>) {
  try {
    return await send()
  } catch {
    return 1
  }
}

// Where to go after a change: the event, with a notice (and a retry button) when some members were not told.
const eventPage = (id: string, failed: number) =>
  failed ? `/evenements/${id}?notif=echec` : `/evenements/${id}`

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

  const { id, status } = await createEvent(member, parsed.data)
  const event = { id, title: parsed.data.title }
  const failed = await attempt(() =>
    status === "confirmed"
      ? notifyPublished(member, event)
      : notifyProposed(member, event)
  )
  refresh()
  redirect(eventPage(id, failed))
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
  const failed = result.datesChanged
    ? await attempt(() =>
        notifyRescheduled(member, { id: eventId, title: parsed.data.title })
      )
    : 0
  refresh(eventId)
  redirect(eventPage(eventId, failed))
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

  // Read before the change: a refused proposal is deleted, and its title and author are still needed to tell them.
  const before = await getEvent(member, eventId)
  const result =
    intent === "validate"
      ? await validateProposal(member, eventId)
      : await refuseProposal(member, eventId)
  if (!result.ok) return toResult(result)
  refresh(eventId)
  if (!before) return null

  if (intent === "refuse") {
    await attempt(() =>
      notifyRefused(member, {
        title: before.title,
        createdById: before.createdById,
      })
    )
    return null
  }
  const failed = await attempt(() =>
    notifyValidated(member, { id: eventId, title: before.title })
  )
  if (failed) redirect(eventPage(eventId, failed))
  return null
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

// Read only: the family's schedule around a period (ISO instants), for the conflict preview and the free
// slots. Same masking as everywhere: no title for another member's private activity.
export async function loadScheduleAction(
  from: string,
  to: string
): Promise<ScheduleResult> {
  const member = await getSessionMember()
  if (!member) return { ok: false, message: LINK_INVALID }
  return loadSchedule(member, from, to)
}

// "Try again" after a notification failed: the same people are told again (those already reached get it twice).
// A parent for an event, the author for their proposal.
export async function retryNotificationAction(
  eventId: string
): Promise<ActionResult> {
  const member = await getSessionMember()
  if (!member) return { message: LINK_INVALID }

  const event = await getEvent(member, eventId)
  if (!event) return { message: FAILURE_MESSAGES["not-found"] }

  const ref = { id: event.id, title: event.title }
  let send: () => Promise<number>
  if (event.status === "confirmed") {
    if (member.role !== "parent") return { message: FAILURE_MESSAGES.forbidden }
    send = () =>
      event.validatedAt
        ? notifyValidated(member, ref)
        : notifyPublished(member, ref)
  } else {
    if (event.createdById !== member.id)
      return { message: FAILURE_MESSAGES.forbidden }
    send = () => notifyProposed(member, ref)
  }

  if (await attempt(send))
    return { message: "Certains membres n'ont toujours pas été prévenus." }
  redirect(`/evenements/${eventId}`)
}
