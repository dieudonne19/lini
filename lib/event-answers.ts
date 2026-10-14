import type { RsvpStatus } from "@/lib/generated/prisma/client"

// How the answers to an event stand, in one line: the headline of the event page.
// "waiting": someone has not answered yet. "all-yes": everyone answered and everyone comes. "mixed": all answered, not
// all coming.
export type AnswersSummary = {
  tone: "waiting" | "all-yes" | "mixed"
  title: string
  detail: string
}

export function summarizeAnswers(
  answers: { status: RsvpStatus }[]
): AnswersSummary {
  const total = answers.length
  const count = (status: RsvpStatus) =>
    answers.filter((answer) => answer.status === status).length
  const pending = count("pending")
  const yes = count("yes")
  const answered = total - pending
  const detail = `${answered} sur ${total} ${answered === 1 ? "a" : "ont"} répondu`

  if (pending === total)
    return { tone: "waiting", title: "Personne n'a encore répondu", detail }
  if (pending > 0)
    return {
      tone: "waiting",
      title:
        pending === 1 ? "1 réponse attendue" : `${pending} réponses attendues`,
      detail,
    }
  if (yes === total)
    return { tone: "all-yes", title: "Tout le monde vient", detail }
  return {
    tone: "mixed",
    title: `${yes} sur ${total} ${yes === 1 ? "vient" : "viennent"}`,
    detail,
  }
}
