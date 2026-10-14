import { AnswerIcon } from "@/components/answer-icon"
import { MemberAvatar } from "@/components/member-avatar"
import { ANSWER_GROUPS } from "@/lib/event-labels"
import type { EventAnswer } from "@/lib/events"
import { cn } from "@/lib/utils"

// The color of each group's icon. The icon, the title and the count carry the meaning too, never the color alone.
const ICON_TONE = {
  yes: "text-success-foreground",
  maybe: "text-warning-foreground",
  no: "text-destructive",
  pending: "text-muted-foreground",
} as const

// Pure: who answered what, as plain lists. One block per answer, a title row with its count, then one member per row
// between hairlines. The members who have not answered come last. Everyone in the family sees this.
function ParticipantGroups({
  answers,
  viewerId,
}: {
  answers: EventAnswer[]
  viewerId: string
}) {
  return (
    <section aria-labelledby="answers-title" className="flex flex-col gap-8">
      <h2 id="answers-title" className="text-2xl font-semibold">
        Réponses de la famille
      </h2>

      {ANSWER_GROUPS.map(({ status, title }) => {
        const group = answers.filter((answer) => answer.status === status)
        if (group.length === 0) return null
        return (
          <section key={status}>
            <h3 className="flex items-center gap-2 border-b py-3 font-semibold">
              <AnswerIcon
                status={status}
                className={cn("size-5", ICON_TONE[status])}
              />
              {title}
              <span className="ml-auto tabular-nums">{group.length}</span>
            </h3>
            <ul className="divide-y">
              {group.map((answer) => (
                <li
                  key={answer.memberId}
                  className="flex items-center gap-4 py-3"
                >
                  <MemberAvatar
                    name={answer.name}
                    color={answer.color}
                    size="chip"
                  />
                  <span className="min-w-0 break-words">
                    {answer.name}
                    {answer.memberId === viewerId && (
                      <span className="ml-2 text-sm text-muted-foreground">
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
