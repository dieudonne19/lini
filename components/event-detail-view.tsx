"use client"

import { useActionState, useMemo, useState } from "react"

import {
  answerEventAction,
  deleteEventAction,
  reviewProposalAction,
} from "@/app/evenements/actions"
import { CalendarSkeleton } from "@/components/calendar-skeleton"
import { ConflictNotice } from "@/components/conflict-notice"
import { EventDetail } from "@/components/event-detail"
import { useEventConflicts } from "@/hooks/use-event-conflicts"
import { useIsClient } from "@/hooks/use-is-client"
import {
  canAnswer,
  canDelete,
  canEdit,
  canValidate,
  hasEnded,
} from "@/lib/event-rules"
import type { EventDetail as EventDetailData } from "@/lib/events"
import type { Role } from "@/lib/generated/prisma/client"

type EventDetailViewProps = {
  event: EventDetailData
  viewer: { id: string; role: Role }
}

// Container: dates are shown in the device timezone, so the page waits for the browser. What the viewer may
// do comes from the same rules as the server; the server checks again when the action runs.
export function EventDetailView({ event, viewer }: EventDetailViewProps) {
  const isClient = useIsClient()
  const [now] = useState(() => new Date())
  const [answerState, answerAction, answering] = useActionState(
    (
      _previous: Awaited<ReturnType<typeof answerEventAction>>,
      formData: FormData
    ) => answerEventAction(event.id, String(formData.get("answer") ?? "")),
    null
  )
  const [reviewState, reviewAction, reviewing] = useActionState(
    reviewProposalAction,
    null
  )
  const [deleteState, deleteAction, deleting] = useActionState(
    () => deleteEventAction(event.id),
    null
  )

  const review = canValidate(viewer, event)
  // A parent sees who is busy before deciding; nobody else needs it, so nothing is loaded for them.
  const times = useMemo(
    () =>
      review
        ? {
            startsAt: event.startsAt,
            endsAt: event.endsAt,
            allDay: event.allDay,
          }
        : null,
    [review, event.startsAt, event.endsAt, event.allDay]
  )
  const conflicts = useEventConflicts(times)

  if (!isClient) return <CalendarSkeleton label="Chargement de l'événement…" />
  return (
    <EventDetail
      event={event}
      can={{
        answer: canAnswer(event, now),
        edit: canEdit(viewer, event),
        review,
        // A parent decides on a proposal (validate or refuse): no separate delete next to it.
        delete: canDelete(viewer, event) && !review,
        ended: hasEnded(event, now),
      }}
      isOwnProposal={
        event.status === "proposed" && event.createdById === viewer.id
      }
      answerAction={answerAction}
      reviewAction={reviewAction}
      deleteAction={deleteAction}
      conflicts={
        review && (
          <ConflictNotice
            status={conflicts.status}
            conflicts={conflicts.conflicts}
            onRetry={conflicts.retry}
            continueText="Tu peux valider quand même."
          />
        )
      }
      pending={answering || reviewing || deleting}
      message={
        answerState?.message ?? reviewState?.message ?? deleteState?.message
      }
    />
  )
}
