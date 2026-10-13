import { describe, expect, it } from "vitest"

import {
  canAnswer,
  canDelete,
  canEdit,
  canSee,
  canValidate,
  hasEnded,
} from "@/lib/event-rules"

const parent = { id: "parent", role: "parent" as const }
const author = { id: "author", role: "child" as const }
const sibling = { id: "sibling", role: "child" as const }

const at = (iso: string) => new Date(iso)
const event = (overrides: Partial<Parameters<typeof canSee>[1]> = {}) => ({
  status: "confirmed" as const,
  createdById: author.id,
  endsAt: at("2026-10-17T20:00:00.000Z"),
  allDay: false,
  ...overrides,
})
const proposal = event({ status: "proposed" })

describe("canSee", () => {
  it("shows a confirmed event to everyone in the family", () => {
    for (const viewer of [parent, author, sibling])
      expect(canSee(viewer, event())).toBe(true)
  })

  it("shows a proposal only to the parents and to its author", () => {
    expect(canSee(parent, proposal)).toBe(true)
    expect(canSee(author, proposal)).toBe(true)
    expect(canSee(sibling, proposal)).toBe(false)
  })

  it("does not show a proposal whose author has left to a child who is not a parent", () => {
    expect(
      canSee(sibling, event({ status: "proposed", createdById: null }))
    ).toBe(false)
  })
})

describe("canEdit", () => {
  it("is for parents, on a confirmed event only", () => {
    expect(canEdit(parent, event())).toBe(true)
    expect(canEdit(parent, proposal)).toBe(false)
    expect(canEdit(author, event())).toBe(false)
    expect(canEdit(author, proposal)).toBe(false)
  })
})

describe("canDelete", () => {
  it("lets a parent delete anything", () => {
    expect(canDelete(parent, event())).toBe(true)
    expect(canDelete(parent, proposal)).toBe(true)
  })

  it("lets a child withdraw their own proposal, but nothing else", () => {
    expect(canDelete(author, proposal)).toBe(true)
    expect(canDelete(sibling, proposal)).toBe(false)
    // Once validated, the author's own event is a confirmed one: they cannot delete it.
    expect(canDelete(author, event())).toBe(false)
    expect(canDelete(sibling, event())).toBe(false)
  })
})

describe("canValidate", () => {
  it("is for parents, on a proposal only", () => {
    expect(canValidate(parent, proposal)).toBe(true)
    expect(canValidate(parent, event())).toBe(false)
    expect(canValidate(author, proposal)).toBe(false)
  })
})

describe("hasEnded and canAnswer", () => {
  it("ends a timed event at its end time", () => {
    const timed = event()
    expect(hasEnded(timed, at("2026-10-17T19:59:59.000Z"))).toBe(false)
    expect(hasEnded(timed, at("2026-10-17T20:00:00.000Z"))).toBe(true)
  })

  it("ends an all-day event after its last day, which it covers entirely", () => {
    const weekend = event({
      allDay: true,
      endsAt: at("2026-10-18T00:00:00.000Z"),
    })
    expect(hasEnded(weekend, at("2026-10-18T23:59:59.000Z"))).toBe(false)
    expect(hasEnded(weekend, at("2026-10-19T00:00:00.000Z"))).toBe(true)
  })

  it("lets members answer to a confirmed event that has not ended, and to nothing else", () => {
    const now = at("2026-10-17T12:00:00.000Z")
    expect(canAnswer(event(), now)).toBe(true)
    expect(canAnswer(proposal, now)).toBe(false)
    expect(canAnswer(event(), at("2026-10-17T21:00:00.000Z"))).toBe(false)
  })
})
