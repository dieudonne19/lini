import { describe, expect, it } from "vitest"

import { summarizeAnswers } from "@/lib/event-answers"
import type { RsvpStatus } from "@/lib/generated/prisma/client"

const answers = (...statuses: RsvpStatus[]) =>
  statuses.map((status) => ({ status }))

describe("summarizeAnswers", () => {
  it("says everyone comes when everyone answered yes", () => {
    expect(summarizeAnswers(answers("yes", "yes"))).toEqual({
      tone: "all-yes",
      title: "Tout le monde vient",
      detail: "2 sur 2 ont répondu",
    })
  })

  it("counts the answers still missing", () => {
    expect(summarizeAnswers(answers("yes", "pending", "pending"))).toEqual({
      tone: "waiting",
      title: "2 réponses attendues",
      detail: "1 sur 3 a répondu",
    })
    expect(summarizeAnswers(answers("no", "pending")).title).toBe(
      "1 réponse attendue"
    )
  })

  it("says nobody answered yet", () => {
    expect(summarizeAnswers(answers("pending", "pending"))).toEqual({
      tone: "waiting",
      title: "Personne n'a encore répondu",
      detail: "0 sur 2 ont répondu",
    })
  })

  it("counts who comes when everyone answered but not all say yes", () => {
    expect(summarizeAnswers(answers("yes", "no", "maybe")).title).toBe(
      "1 sur 3 vient"
    )
    expect(summarizeAnswers(answers("yes", "yes", "maybe"))).toMatchObject({
      tone: "mixed",
      title: "2 sur 3 viennent",
    })
  })

  it("waits for the missing answers before judging the others", () => {
    expect(summarizeAnswers(answers("no", "maybe", "pending")).tone).toBe(
      "waiting"
    )
  })
})
