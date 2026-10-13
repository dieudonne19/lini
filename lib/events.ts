import { db } from "@/lib/db"
import {
  canAnswer,
  canDelete,
  canEdit,
  canSee,
  canValidate,
  hasEnded,
} from "@/lib/event-rules"
import type {
  EventStatus,
  Member,
  RsvpStatus,
} from "@/lib/generated/prisma/client"
import type { EventInput } from "@/lib/schemas"

// Family events: the single place that reads and changes them. Every function is scoped to the viewer's
// family and applies the rules of lib/event-rules.ts. An event the viewer may not see is "not found",
// never "forbidden": a proposal must not reveal that it exists to a member who may not see it.

export type EventViewer = Pick<Member, "id" | "familyId" | "role">

export type EventSummary = {
  id: string
  title: string
  place: string | null
  startsAt: Date
  endsAt: Date
  allDay: boolean
  status: EventStatus
  createdByName: string | null
  // The viewer's own answer ("pending" until they answer).
  myAnswer: RsvpStatus
}

export type EventAnswer = {
  memberId: string
  name: string
  color: string
  status: RsvpStatus
}

export type EventDetail = EventSummary & {
  description: string | null
  createdById: string | null
  validatedAt: Date | null
  // Every member of the family with their answer, "pending" by default. Empty for a proposal.
  answers: EventAnswer[]
}

export type EventResult =
  | { ok: true }
  | { ok: false; reason: "not-found" | "forbidden" | "already-handled" }

const OK = { ok: true } as const
const NOT_FOUND = { ok: false, reason: "not-found" } as const
const FORBIDDEN = { ok: false, reason: "forbidden" } as const
const ALREADY_HANDLED = { ok: false, reason: "already-handled" } as const

const withAuthor = { createdBy: { select: { name: true } } } as const

// The event, if it is in the viewer's family and the viewer may see it.
async function findVisible(viewer: EventViewer, id: string) {
  const event = await db.familyEvent.findFirst({
    where: { id, familyId: viewer.familyId },
    include: withAuthor,
  })
  return event && canSee(viewer, event) ? event : null
}

// The status comes from the role, never from the input: a parent publishes, a child proposes.
export async function createEvent(viewer: EventViewer, input: EventInput) {
  const event = await db.familyEvent.create({
    data: {
      ...input,
      familyId: viewer.familyId,
      createdById: viewer.id,
      status: viewer.role === "parent" ? "confirmed" : "proposed",
    },
  })
  return { id: event.id, status: event.status }
}

export async function getEvent(
  viewer: EventViewer,
  id: string
): Promise<EventDetail | null> {
  const event = await findVisible(viewer, id)
  if (!event) return null

  let answers: EventAnswer[] = []
  let myAnswer: RsvpStatus = "pending"
  if (event.status === "confirmed") {
    const [members, rsvps] = await Promise.all([
      db.member.findMany({
        where: { familyId: viewer.familyId },
        select: { id: true, name: true, color: true },
        orderBy: { createdAt: "asc" },
      }),
      db.rsvp.findMany({ where: { eventId: id } }),
    ])
    const byMember = new Map(rsvps.map((rsvp) => [rsvp.memberId, rsvp.status]))
    answers = members.map((member) => ({
      memberId: member.id,
      name: member.name,
      color: member.color,
      status: byMember.get(member.id) ?? "pending",
    }))
    myAnswer = byMember.get(viewer.id) ?? "pending"
  }

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    place: event.place,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    allDay: event.allDay,
    status: event.status,
    createdById: event.createdById,
    createdByName: event.createdBy?.name ?? null,
    validatedAt: event.validatedAt,
    answers,
    myAnswer,
  }
}

// What the events screen shows the viewer: the proposals they may see ("to validate" for a parent,
// "my proposals" for a child), then the confirmed events to come and the ones already over.
// shortcut: loads every confirmed event of the family and keeps the 100 latest past ones; paginate the
// past events if a family accumulates several hundred.
export async function listEvents(viewer: EventViewer, now = new Date()) {
  const [proposals, confirmed] = await Promise.all([
    db.familyEvent.findMany({
      where: {
        familyId: viewer.familyId,
        status: "proposed",
        ...(viewer.role === "parent" ? {} : { createdById: viewer.id }),
      },
      include: withAuthor,
      orderBy: { startsAt: "asc" },
    }),
    db.familyEvent.findMany({
      where: { familyId: viewer.familyId, status: "confirmed" },
      include: withAuthor,
      orderBy: { startsAt: "asc" },
    }),
  ])
  const answers = await db.rsvp.findMany({
    where: { memberId: viewer.id, eventId: { in: confirmed.map((e) => e.id) } },
  })
  const myAnswers = new Map(answers.map((rsvp) => [rsvp.eventId, rsvp.status]))

  const summarize = (event: (typeof confirmed)[number]): EventSummary => ({
    id: event.id,
    title: event.title,
    place: event.place,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    allDay: event.allDay,
    status: event.status,
    createdByName: event.createdBy?.name ?? null,
    myAnswer: myAnswers.get(event.id) ?? "pending",
  })
  const over = confirmed.filter((event) => hasEnded(event, now))
  return {
    proposals: proposals.map(summarize),
    upcoming: confirmed.filter((event) => !hasEnded(event, now)).map(summarize),
    past: over.slice(-100).reverse().map(summarize),
  }
}

// Parents only, on a confirmed event. The answers go back to "pending" only when the dates change.
export function updateEvent(
  viewer: EventViewer,
  id: string,
  input: EventInput
) {
  return db.$transaction(async (tx): Promise<EventResult> => {
    const event = await tx.familyEvent.findFirst({
      where: { id, familyId: viewer.familyId },
    })
    if (!event || !canSee(viewer, event)) return NOT_FOUND
    if (!canEdit(viewer, event)) return FORBIDDEN

    const datesChanged =
      event.startsAt.getTime() !== input.startsAt.getTime() ||
      event.endsAt.getTime() !== input.endsAt.getTime() ||
      event.allDay !== input.allDay
    await tx.familyEvent.update({ where: { id }, data: input })
    if (datesChanged) await tx.rsvp.deleteMany({ where: { eventId: id } })
    return OK
  })
}

// A parent deletes any event. An author withdraws their own proposal, and the delete itself checks that
// it is still a proposal: if a parent validated it a moment ago, nothing is deleted.
export async function deleteEvent(
  viewer: EventViewer,
  id: string
): Promise<EventResult> {
  const event = await findVisible(viewer, id)
  if (!event) return NOT_FOUND
  if (!canDelete(viewer, event)) return FORBIDDEN

  if (viewer.role !== "parent") return withdrawProposal(viewer, id)
  const { count } = await db.familyEvent.deleteMany({
    where: { id, familyId: viewer.familyId },
  })
  return count ? OK : ALREADY_HANDLED
}

// The atomic part of a withdrawal: the delete itself only matches a proposal of this author, so a
// proposal validated by a parent between the check and the delete is left alone ("already handled").
export async function withdrawProposal(
  viewer: EventViewer,
  id: string
): Promise<EventResult> {
  const { count } = await db.familyEvent.deleteMany({
    where: {
      id,
      familyId: viewer.familyId,
      createdById: viewer.id,
      status: "proposed",
    },
  })
  return count ? OK : ALREADY_HANDLED
}

// Validation and refusal only apply while the event is still a proposal: two parents, or a double click,
// cannot apply them twice.
export async function validateProposal(
  viewer: EventViewer,
  id: string,
  now = new Date()
): Promise<EventResult> {
  const event = await findVisible(viewer, id)
  if (!event) return NOT_FOUND
  if (!canValidate(viewer, event)) return FORBIDDEN

  const { count } = await db.familyEvent.updateMany({
    where: { id, familyId: viewer.familyId, status: "proposed" },
    data: { status: "confirmed", validatedById: viewer.id, validatedAt: now },
  })
  return count ? OK : ALREADY_HANDLED
}

// Refusing deletes the proposal (the child is told in step 7).
export async function refuseProposal(
  viewer: EventViewer,
  id: string
): Promise<EventResult> {
  const event = await findVisible(viewer, id)
  if (!event) return NOT_FOUND
  if (!canValidate(viewer, event)) return FORBIDDEN

  const { count } = await db.familyEvent.deleteMany({
    where: { id, familyId: viewer.familyId, status: "proposed" },
  })
  return count ? OK : ALREADY_HANDLED
}

// The viewer answers for themselves: there is no way to answer for someone else.
export async function answerEvent(
  viewer: EventViewer,
  id: string,
  status: Exclude<RsvpStatus, "pending">,
  now = new Date()
): Promise<EventResult> {
  const event = await findVisible(viewer, id)
  if (!event) return NOT_FOUND
  if (!canAnswer(event, now)) return FORBIDDEN

  await db.rsvp.upsert({
    where: { eventId_memberId: { eventId: id, memberId: viewer.id } },
    create: { eventId: id, memberId: viewer.id, status },
    update: { status },
  })
  return OK
}
