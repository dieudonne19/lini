import type { EventStatus, Role } from "@/lib/generated/prisma/client"

// Who may do what with a family event. Pure functions: the screens use them to show or hide a button, the
// domain (lib/events.ts) uses the same ones to refuse the action, so the two can never disagree.
// They assume the viewer and the event are in the same family (the queries are scoped to it).

type RuleViewer = { id: string; role: Role }
type RuleEvent = {
  status: EventStatus
  createdById: string | null
  endsAt: Date
  allDay: boolean
}

const DAY_MS = 24 * 60 * 60 * 1000

const isParent = (viewer: RuleViewer) => viewer.role === "parent"

// An all-day event covers its last day entirely (its endsAt is that day at midnight UTC).
export function hasEnded(
  event: Pick<RuleEvent, "endsAt" | "allDay">,
  now: Date
) {
  const end = event.endsAt.getTime() + (event.allDay ? DAY_MS : 0)
  return end <= now.getTime()
}

// A confirmed event is visible to the family; a proposal only to the parents and to its author.
export function canSee(viewer: RuleViewer, event: RuleEvent) {
  return (
    event.status === "confirmed" ||
    isParent(viewer) ||
    event.createdById === viewer.id
  )
}

// Parents change a confirmed event. A proposal is validated or refused, not edited.
export function canEdit(viewer: RuleViewer, event: RuleEvent) {
  return isParent(viewer) && event.status === "confirmed"
}

// Parents delete any event; an author withdraws their own proposal only while it is still a proposal.
export function canDelete(viewer: RuleViewer, event: RuleEvent) {
  return (
    isParent(viewer) ||
    (event.status === "proposed" && event.createdById === viewer.id)
  )
}

export function canValidate(viewer: RuleViewer, event: RuleEvent) {
  return isParent(viewer) && event.status === "proposed"
}

// Anyone in the family answers for themselves, to a confirmed event that has not ended.
export function canAnswer(event: RuleEvent, now: Date) {
  return event.status === "confirmed" && !hasEnded(event, now)
}
