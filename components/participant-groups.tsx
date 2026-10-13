import { MemberAvatar } from "@/components/member-avatar"
import { ANSWER_GROUPS } from "@/lib/event-labels"
import type { EventAnswer } from "@/lib/events"

// Pure: who answered what, grouped by answer with the members who have not answered last.
// Everyone in the family sees this. Each member is named, so the color is never the only signal.
function ParticipantGroups({ answers }: { answers: EventAnswer[] }) {
  return (
    <div className="flex flex-col gap-4">
      {ANSWER_GROUPS.map(({ status, title }) => {
        const group = answers.filter((answer) => answer.status === status)
        if (group.length === 0) return null
        return (
          <section key={status}>
            <h3 className="mb-2 text-sm font-semibold">
              {title} ({group.length})
            </h3>
            <ul className="flex flex-wrap gap-x-4 gap-y-2">
              {group.map((answer) => (
                <li key={answer.memberId} className="flex items-center gap-2">
                  <MemberAvatar name={answer.name} color={answer.color} />
                  <span className="break-words">{answer.name}</span>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

export { ParticipantGroups }
