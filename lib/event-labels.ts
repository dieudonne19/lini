import type { RsvpStatus } from "@/lib/generated/prisma/client"

// The words for an answer to an event: what a member says about themselves, and how the answers are grouped.

export const ANSWER_LABELS: Record<Exclude<RsvpStatus, "pending">, string> = {
  yes: "Je viens",
  no: "Je ne viens pas",
  maybe: "Peut-être",
}

// What the list says about the viewer's own answer.
export const MY_ANSWER_NOTES: Record<RsvpStatus, string> = {
  yes: "Tu viens",
  no: "Tu ne viens pas",
  maybe: "Tu viens peut-être",
  pending: "Pas encore répondu",
}

// Participants are grouped by answer, in this order, "pending" last.
export const ANSWER_GROUPS: { status: RsvpStatus; title: string }[] = [
  { status: "yes", title: "Viennent" },
  { status: "maybe", title: "Peut-être" },
  { status: "no", title: "Ne viennent pas" },
  { status: "pending", title: "Pas encore répondu" },
]
