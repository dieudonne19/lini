"use client"

import { useActionState } from "react"
import { Plus } from "lucide-react"
import Link from "next/link"

import { reviewProposalAction } from "@/app/evenements/actions"
import { CalendarSkeleton } from "@/components/calendar-skeleton"
import { EventList } from "@/components/event-list"
import { ProposalActions } from "@/components/proposal-actions"
import { buttonVariants } from "@/components/ui/button"
import { useIsClient } from "@/hooks/use-is-client"
import { MY_ANSWER_NOTES } from "@/lib/event-labels"
import type { EventSummary } from "@/lib/events"

type EventsViewProps = {
  proposals: EventSummary[]
  upcoming: EventSummary[]
  past: EventSummary[]
  isParent: boolean
}

// Container: dates are shown in the device timezone, so the lists wait for the browser. For a parent the
// proposals are "to validate" (with the two decisions right there); for a child they are "my proposals".
export function EventsView({
  proposals,
  upcoming,
  past,
  isParent,
}: EventsViewProps) {
  const isClient = useIsClient()
  const [reviewState, reviewAction, reviewing] = useActionState(
    reviewProposalAction,
    null
  )

  if (!isClient) return <CalendarSkeleton label="Chargement des événements…" />
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Événements
        </h1>
        <Link
          href="/evenements/nouveau"
          className={buttonVariants({ className: "h-11" })}
        >
          <Plus aria-hidden />
          {isParent ? "Nouvel événement" : "Proposer un événement"}
        </Link>
      </div>

      {reviewState?.message && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          {reviewState.message}
        </p>
      )}

      {proposals.length > 0 && (
        <EventList
          title={isParent ? "À valider" : "Mes propositions"}
          events={proposals}
          note={(event) =>
            isParent
              ? `Proposé par ${event.createdByName ?? "un membre"}`
              : "En attente de validation par un parent"
          }
          renderActions={
            isParent
              ? (event) => (
                  <ProposalActions
                    eventId={event.id}
                    action={reviewAction}
                    pending={reviewing}
                  />
                )
              : undefined
          }
        />
      )}
      <EventList
        title="À venir"
        events={upcoming}
        emptyText={
          isParent
            ? "Aucun événement à venir. Crée-en un pour réunir la famille."
            : "Aucun événement à venir."
        }
        note={(event) => MY_ANSWER_NOTES[event.myAnswer]}
      />
      {past.length > 0 && <EventList title="Passés" events={past} />}
    </div>
  )
}
