import { db } from "@/lib/db"
import type { Role } from "@/lib/generated/prisma/client"
import { sendToMembers, type PushPayload } from "@/lib/push"

// Who is told what, and the words. Every function returns how many devices could not be reached, so the screen can
// say "saved, but some members were not told" and offer to try again. Texts carry no date: the server does not know
// the time zone of each device, and the page one tap away shows it right.

type Actor = { id: string; name: string; familyId: string }
type EventRef = { id: string; title: string }

const q = (title: string) => `« ${title} »`
const eventUrl = (event: EventRef) => `/evenements/${event.id}`

// The members of the family to tell: everyone but the person who acted, optionally only one role.
async function recipients(
  familyId: string,
  options: { except?: string; role?: Role } = {}
) {
  const members = await db.member.findMany({
    where: {
      familyId,
      ...(options.role ? { role: options.role } : {}),
      ...(options.except ? { id: { not: options.except } } : {}),
    },
    select: { id: true },
  })
  return members.map((member) => member.id)
}

async function tell(memberIds: string[], payload: PushPayload) {
  return (await sendToMembers(memberIds, payload)).failed
}

// A parent published an event: everyone else is told.
export async function notifyPublished(actor: Actor, event: EventRef) {
  return tell(await recipients(actor.familyId, { except: actor.id }), {
    title: "Nouvel événement",
    body: `${actor.name} a ajouté ${q(event.title)}.`,
    url: eventUrl(event),
  })
}

// A parent validated a child's proposal: everyone else is told it is now an event.
export async function notifyValidated(actor: Actor, event: EventRef) {
  return tell(await recipients(actor.familyId, { except: actor.id }), {
    title: "Événement confirmé",
    body: `${q(event.title)} est confirmé.`,
    url: eventUrl(event),
  })
}

// The dates changed: the answers went back to "pending", so everyone else is asked to answer again.
export async function notifyRescheduled(actor: Actor, event: EventRef) {
  return tell(await recipients(actor.familyId, { except: actor.id }), {
    title: "Événement modifié",
    body: `Les dates de ${q(event.title)} ont changé. Réponds à nouveau.`,
    url: eventUrl(event),
  })
}

// A child proposed an event: the parents are told, so that no proposal waits unseen.
export async function notifyProposed(actor: Actor, event: EventRef) {
  return tell(
    await recipients(actor.familyId, { except: actor.id, role: "parent" }),
    {
      title: "Nouvelle proposition",
      body: `${actor.name} propose ${q(event.title)}.`,
      url: eventUrl(event),
    }
  )
}

// A parent refused a proposal: its author is told (the proposal itself is gone, so the link leads to the list).
export async function notifyRefused(
  actor: Actor,
  proposal: { title: string; createdById: string | null }
) {
  if (!proposal.createdById || proposal.createdById === actor.id) return 0
  return tell([proposal.createdById], {
    title: "Proposition refusée",
    body: `Ta proposition ${q(proposal.title)} n'a pas été retenue.`,
    url: "/evenements",
  })
}

// The reminder of the day before, to the members who have not said they are not coming.
export async function notifyReminder(familyId: string, event: EventRef) {
  const declined = await db.rsvp.findMany({
    where: { eventId: event.id, status: "no" },
    select: { memberId: true },
  })
  const skip = new Set(declined.map((rsvp) => rsvp.memberId))
  const ids = (await recipients(familyId)).filter((id) => !skip.has(id))
  return tell(ids, {
    title: "Rappel",
    body: `Bientôt${" "}: ${q(event.title)}.`,
    url: eventUrl(event),
  })
}
