import {
  CalendarDays,
  CircleCheck,
  Hourglass,
  MapPin,
  Pencil,
  UserRound,
  Users,
} from "lucide-react"
import Link from "next/link"

import { AnswerButtons } from "@/components/answer-buttons"
import { ConfirmDelete } from "@/components/confirm-delete"
import { ParticipantGroups } from "@/components/participant-groups"
import { ProposalActions } from "@/components/proposal-actions"
import { buttonVariants } from "@/components/ui/button"
import { summarizeAnswers } from "@/lib/event-answers"
import type { EventDetail as EventDetailData } from "@/lib/events"
import { formatEventWhen } from "@/lib/format-date"
import { cn } from "@/lib/utils"

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

// A band of tint across the whole width of the screen, for what the viewer has to do on this page. The tint spreads
// sideways with a shadow, and the clip keeps it from spreading up and down, so the page does not scroll sideways.
const BAND =
  "bg-accent py-8 shadow-[0_0_0_100vmax_var(--accent)] [clip-path:inset(0_-100vmax)]"

// One line of the facts under the title: an icon, then the fact.
function Fact({
  icon: Icon,
  children,
}: {
  icon: typeof CalendarDays
  children: React.ReactNode
}) {
  return (
    <p className="flex items-center gap-3 text-lg text-muted-foreground">
      <Icon aria-hidden className="size-5 shrink-0" />
      <span className="min-w-0 break-words">{children}</span>
    </p>
  )
}

const SUMMARY_ICON = {
  "all-yes": { Icon: CircleCheck, tone: "text-success-foreground" },
  waiting: { Icon: Hourglass, tone: "text-warning-foreground" },
  mixed: { Icon: Users, tone: "text-foreground" },
} as const

// Where the answers stand, in one line under the facts: "Tout le monde vient", "2 réponses attendues"...
function AnswersHeadline({ answers }: { answers: EventDetailData["answers"] }) {
  const { tone, title, detail } = summarizeAnswers(answers)
  const { Icon, tone: color } = SUMMARY_ICON[tone]
  return (
    <div className="flex items-center gap-3">
      <Icon aria-hidden className={cn("size-9 shrink-0", color)} />
      <div>
        <p className="text-lg font-semibold">{title}</p>
        <p className="text-muted-foreground">{detail}</p>
      </div>
    </div>
  )
}

// Pure: the page of one event, in blocks that each answer one question. The title and the facts say what and when,
// and where the answers stand; a tinted band lets the viewer answer; the answers of the family come next, one list
// per answer; deleting is set apart at the bottom. Proposals show who sent them and the two decisions to a parent.
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
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        {isProposal && (
          <p className="mb-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-warning px-3 py-1 text-sm font-semibold text-warning-foreground">
            <Hourglass aria-hidden className="size-4" />
            Proposition en attente de validation
          </p>
        )}
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <h1 className="min-w-0 flex-1 text-3xl font-semibold tracking-tight break-words sm:text-5xl">
            {event.title}
          </h1>
          {can.edit && (
            <Link
              href={`/evenements/${event.id}/modifier`}
              className={buttonVariants({
                variant: "ghost",
                size: "lg",
                className: "shrink-0",
              })}
            >
              <Pencil aria-hidden />
              Modifier
            </Link>
          )}
        </div>

        <Fact icon={CalendarDays}>{formatEventWhen(event)}</Fact>
        {event.place && <Fact icon={MapPin}>{event.place}</Fact>}
        {isProposal && (
          <Fact icon={UserRound}>
            Proposé par {event.createdByName ?? "un membre"}
          </Fact>
        )}
        {event.description && (
          <p className="mt-1 break-words whitespace-pre-line">
            {event.description}
          </p>
        )}
        {!isProposal && (
          <div className="mt-3">
            <AnswersHeadline answers={event.answers} />
          </div>
        )}
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
        <section className={cn(BAND, "flex flex-col gap-4")}>
          <h2 className="text-2xl font-semibold">Ta décision</h2>
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
              className={cn(BAND, "flex flex-col gap-4")}
            >
              <h2 id="my-answer-title" className="text-2xl font-semibold">
                Ta réponse
              </h2>
              {can.answer ? (
                <>
                  <AnswerButtons
                    current={event.myAnswer}
                    action={answerAction}
                    pending={pending}
                  />
                  <p className="text-muted-foreground">
                    Tu peux changer ta réponse à tout moment.
                  </p>
                </>
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
