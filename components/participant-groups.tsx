import { AnswerIcon } from "@/components/answer-icon"
import { MemberAvatar } from "@/components/member-avatar"
import { ANSWER_GROUPS } from "@/lib/event-labels"
import type { EventAnswer } from "@/lib/events"
import { cn } from "@/lib/utils"

// The tint of each group's header: green for yes, orange for maybe, red for no, grey for not answered. Each header
// also carries the icon and the words, so the color is never the only signal.
const HEADER_TONE = {
  yes: "bg-success text-success-foreground",
  maybe: "bg-warning text-warning-foreground",
  no: "bg-destructive/10 text-destructive",
  pending: "bg-muted text-muted-foreground",
} as const

// Pure: who answered what. The members who answered sit in one card per answer; the ones who have not answered yet
// come last, in a separate dashed block, so what is still missing is easy to see. Everyone in the family sees this.
function ParticipantGroups({
  answers,
  viewerId,
}: {
  answers: EventAnswer[]
  viewerId: string
}) {
  const answered = answers.filter((answer) => answer.status !== "pending")

  return (
    <section aria-labelledby="answers-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="answers-title" className="text-xl font-semibold">
          Réponses de la famille
        </h2>
        <p className="text-sm text-muted-foreground">
          {answered.length} sur {answers.length} ont répondu
        </p>
      </div>

      {ANSWER_GROUPS.map(({ status, title }) => {
        const group = answers.filter((answer) => answer.status === status)
        if (group.length === 0) return null
        const waiting = status === "pending"
        return (
          <section
            key={status}
            className={cn(
              "overflow-hidden rounded-lg border",
              waiting ? "mt-2 border-dashed bg-muted/40" : "bg-card"
            )}
          >
            <h3
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold",
                HEADER_TONE[status]
              )}
            >
              <AnswerIcon status={status} className="size-4" />
              {title}
              <span className="ml-auto tabular-nums">{group.length}</span>
            </h3>
            <ul className="grid gap-x-4 gap-y-3 p-4 sm:grid-cols-2">
              {group.map((answer) => (
                <li key={answer.memberId} className="flex items-center gap-3">
                  <MemberAvatar
                    name={answer.name}
                    color={answer.color}
                    size="chip"
                  />
                  <span className="min-w-0 break-words">
                    {answer.name}
                    {answer.memberId === viewerId && (
                      <span className="ml-1.5 text-sm text-muted-foreground">
                        (toi)
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </section>
  )
}

export { ParticipantGroups }
