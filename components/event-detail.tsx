import {
  CalendarDays,
  Hourglass,
  MapPin,
  Pencil,
  UserRound,
} from "lucide-react"
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
  viewerId: string
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
  // Shown to a parent above the decision on a proposal: who is busy at that time.
  conflicts?: React.ReactNode
  pending: boolean
  message?: string
}

// One line of the card of facts: an icon, then the fact.
function Fact({
  icon: Icon,
  children,
}: {
  icon: typeof CalendarDays
  children: React.ReactNode
}) {
  return (
    <p className="flex items-start gap-3">
      <Icon
        aria-hidden
        className="mt-0.5 size-5 shrink-0 text-muted-foreground"
      />
      <span className="min-w-0 break-words">{children}</span>
    </p>
  )
}

// Pure: the page of one event, in blocks that each answer one question. The title and a card of facts say what and
// when; "Ta réponse" lets the viewer answer; the answers of the family come next; deleting is set apart at the bottom.
// Proposals show who sent them and the two decisions to a parent.
function EventDetail({
  event,
  viewerId,
  can,
  isOwnProposal,
  answerAction,
  reviewAction,
  deleteAction,
  conflicts,
  pending,
  message,
}: EventDetailProps) {
  const isProposal = event.status === "proposed"
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        {isProposal && (
          <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-warning px-3 py-1 text-sm font-semibold text-warning-foreground">
            <Hourglass aria-hidden className="size-4" />
            Proposition en attente de validation
          </p>
        )}
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <h1 className="min-w-0 flex-1 text-3xl font-semibold tracking-tight break-words sm:text-4xl">
            {event.title}
          </h1>
          {can.edit && (
            <Link
              href={`/evenements/${event.id}/modifier`}
              className={buttonVariants({
                variant: "outline",
                className: "h-11 shrink-0",
              })}
            >
              <Pencil aria-hidden />
              Modifier
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
          <Fact icon={CalendarDays}>
            <span className="font-medium">{formatEventWhen(event)}</span>
          </Fact>
          {event.place && <Fact icon={MapPin}>{event.place}</Fact>}
          {isProposal && (
            <Fact icon={UserRound}>
              Proposé par {event.createdByName ?? "un membre"}
            </Fact>
          )}
          {event.description && (
            <p className="border-t pt-3 break-words whitespace-pre-line text-muted-foreground">
              {event.description}
            </p>
          )}
        </div>
      </header>

      {message && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          {message}
        </p>
      )}

      {can.review && (
        <section className="flex flex-col gap-4 rounded-lg border bg-card p-4">
          <h2 className="text-xl font-semibold">Ta décision</h2>
          {conflicts}
          <ProposalActions
            eventId={event.id}
            action={reviewAction}
            pending={pending}
          />
        </section>
      )}

      {!isProposal && (
        <>
          {(can.answer || can.ended) && (
            <section
              aria-labelledby="my-answer-title"
              className="flex flex-col gap-3 rounded-lg border bg-card p-4"
            >
              <h2 id="my-answer-title" className="text-xl font-semibold">
                Ta réponse
              </h2>
              {can.answer ? (
                <AnswerButtons
                  current={event.myAnswer}
                  action={answerAction}
                  pending={pending}
                />
              ) : (
                <p className="text-muted-foreground">
                  Cet événement est terminé : les réponses ne changent plus.
                </p>
              )}
            </section>
          )}
          <ParticipantGroups answers={event.answers} viewerId={viewerId} />
        </>
      )}

      {can.delete && (
        <div className="border-t pt-6">
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
        </div>
      )}
    </div>
  )
}

export { EventDetail }
