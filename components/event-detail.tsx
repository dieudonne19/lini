import Link from "next/link"

import { AnswerButtons } from "@/components/answer-buttons"
import { ConfirmDelete } from "@/components/confirm-delete"
import { ParticipantGroups } from "@/components/participant-groups"
import { ProposalActions } from "@/components/proposal-actions"
import { buttonVariants } from "@/components/ui/button"
import type { EventDetail as EventDetailData } from "@/lib/events"
import { formatEventWhen } from "@/lib/format-date"

type ServerAction = (formData: FormData) => void

type EventDetailProps = {
  event: EventDetailData
  // What the viewer may do: computed with the same rules the server applies.
  can: {
    answer: boolean
    edit: boolean
    review: boolean
    delete: boolean
    ended: boolean
  }
  // True when the viewer is the author of this proposal (they withdraw it rather than delete an event).
  isOwnProposal: boolean
  answerAction: ServerAction
  reviewAction: ServerAction
  deleteAction: () => void
  pending: boolean
  message?: string
}

// Pure: the page of one event. Proposals show who sent them and the two decisions to a parent; confirmed
// events show the answers, and the answer buttons while the event has not ended.
function EventDetail({
  event,
  can,
  isOwnProposal,
  answerAction,
  reviewAction,
  deleteAction,
  pending,
  message,
}: EventDetailProps) {
  const isProposal = event.status === "proposed"
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        {isProposal && (
          <p className="w-fit rounded-md bg-muted px-2 py-1 text-sm font-medium">
            Proposition en attente de validation
          </p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight break-words">
          {event.title}
        </h1>
        <p>{formatEventWhen(event)}</p>
        {event.place && <p className="text-muted-foreground">{event.place}</p>}
        {isProposal && (
          <p className="text-muted-foreground">
            Proposé par {event.createdByName ?? "un membre"}.
          </p>
        )}
      </header>

      {message && (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
        >
          {message}
        </p>
      )}

      {event.description && (
        <p className="break-words whitespace-pre-line">{event.description}</p>
      )}

      {can.edit && (
        <Link
          href={`/evenements/${event.id}/modifier`}
          className={buttonVariants({
            variant: "outline",
            className: "h-11 w-fit",
          })}
        >
          Modifier l&apos;événement
        </Link>
      )}

      {can.review && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Ta décision</h2>
          <ProposalActions
            eventId={event.id}
            action={reviewAction}
            pending={pending}
          />
        </section>
      )}

      {!isProposal && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Qui vient ?</h2>
          {can.answer ? (
            <AnswerButtons
              current={event.myAnswer}
              action={answerAction}
              pending={pending}
            />
          ) : (
            can.ended && (
              <p className="text-muted-foreground">
                Cet événement est terminé : les réponses ne changent plus.
              </p>
            )
          )}
          <ParticipantGroups answers={event.answers} />
        </section>
      )}

      {can.delete && (
        <ConfirmDelete
          label={
            isOwnProposal ? "Retirer ma proposition" : "Supprimer l'événement"
          }
          confirmLabel={
            isOwnProposal ? "Retirer ma proposition" : "Supprimer l'événement"
          }
          pendingLabel={isOwnProposal ? "Retrait…" : "Suppression…"}
          action={deleteAction}
          pending={pending}
        >
          {isOwnProposal
            ? `Retirer « ${event.title} » annule ta proposition. Cette action est définitive.`
            : `Supprimer « ${event.title} » le supprime pour toute la famille, avec les réponses. Cette action est définitive.`}
        </ConfirmDelete>
      )}
    </div>
  )
}

export { EventDetail }
