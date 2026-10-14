import { afterAll, describe, expect, it } from "vitest"

import { db } from "@/lib/db"
import {
  answerEvent,
  createEvent,
  deleteEvent,
  getEvent,
  listEvents,
  refuseProposal,
  updateEvent,
  validateProposal,
  withdrawProposal,
  type EventViewer,
} from "@/lib/events"
import { eventSchema } from "@/lib/schemas"

const SECRET_TITLE = "Surprise pour Mamy"

// Instants used by the tests: the event is on 17 October 2026.
const input = (overrides: Partial<Record<string, string | boolean>> = {}) =>
  eventSchema.parse({
    title: "Repas de famille",
    description: "",
    place: "Maison",
    startsAt: "2026-10-17T17:00:00.000Z",
    endsAt: "2026-10-17T20:00:00.000Z",
    allDay: false,
    ...overrides,
  })

const BEFORE = new Date("2026-10-10T12:00:00.000Z")
const AFTER = new Date("2026-10-18T12:00:00.000Z")

describe.skipIf(!process.env.DATABASE_URL)("events", () => {
  const familyIds: string[] = []

  async function setupFamily() {
    const family = await db.family.create({ data: { name: "Test" } })
    familyIds.push(family.id)
    const member = (name: string, role: "parent" | "child") =>
      db.member.create({
        data: {
          familyId: family.id,
          name,
          color: "#3D6DF2",
          role,
          tokenHash: crypto.randomUUID(),
        },
      })
    return {
      family,
      parent: await member("Parent", "parent"),
      otherParent: await member("Autre parent", "parent"),
      child: await member("Enfant", "child"),
      sibling: await member("Frere", "child"),
    }
  }

  afterAll(async () => {
    await db.family.deleteMany({ where: { id: { in: familyIds } } })
    await db.$disconnect()
  })

  const asViewer = (member: EventViewer): EventViewer => ({
    id: member.id,
    familyId: member.familyId,
    role: member.role,
  })

  describe("creation", () => {
    it("publishes the event of a parent and makes the event of a child a proposal", async () => {
      const { parent, child } = await setupFamily()
      expect((await createEvent(asViewer(parent), input())).status).toBe(
        "confirmed"
      )
      expect((await createEvent(asViewer(child), input())).status).toBe(
        "proposed"
      )
    })

    it("takes the status from the role only: there is no way to pass one", async () => {
      const { child } = await setupFamily()
      const sneaky = { ...input(), status: "confirmed" } as ReturnType<
        typeof input
      >
      expect((await createEvent(asViewer(child), sneaky)).status).toBe(
        "proposed"
      )
    })
  })

  describe("visibility of a proposal", () => {
    it("is visible to the parents and to its author, and unknown to anyone else", async () => {
      const { parent, otherParent, child, sibling } = await setupFamily()
      const { id } = await createEvent(
        asViewer(child),
        input({ title: SECRET_TITLE })
      )

      expect((await getEvent(asViewer(parent), id))?.title).toBe(SECRET_TITLE)
      expect((await getEvent(asViewer(otherParent), id))?.title).toBe(
        SECRET_TITLE
      )
      expect((await getEvent(asViewer(child), id))?.title).toBe(SECRET_TITLE)
      expect(await getEvent(asViewer(sibling), id)).toBeNull()
    })

    it("never appears in the lists of another child, nor anywhere in what they receive", async () => {
      const { parent, child, sibling } = await setupFamily()
      await createEvent(asViewer(child), input({ title: SECRET_TITLE }))

      const seenBySibling = await listEvents(asViewer(sibling), BEFORE)
      expect(seenBySibling.proposals).toEqual([])
      expect(JSON.stringify(seenBySibling)).not.toContain("Surprise")
      expect(
        (await listEvents(asViewer(child), BEFORE)).proposals.map(
          (e) => e.title
        )
      ).toEqual([SECRET_TITLE])
      expect(
        (await listEvents(asViewer(parent), BEFORE)).proposals.map(
          (e) => e.title
        )
      ).toEqual([SECRET_TITLE])
    })

    it("shows the parents who proposed it", async () => {
      const { parent, child } = await setupFamily()
      await createEvent(asViewer(child), input())
      expect(
        (await listEvents(asViewer(parent), BEFORE)).proposals[0].createdByName
      ).toBe("Enfant")
    })
  })

  describe("withdrawing and deleting", () => {
    it("lets a child withdraw their own proposal", async () => {
      const { child } = await setupFamily()
      const { id } = await createEvent(asViewer(child), input())
      expect(await deleteEvent(asViewer(child), id)).toEqual({ ok: true })
      expect(await db.familyEvent.findUnique({ where: { id } })).toBeNull()
    })

    it("does not let a child delete a confirmed event, theirs once validated included", async () => {
      const { parent, child } = await setupFamily()
      const confirmed = await createEvent(asViewer(parent), input())
      expect(await deleteEvent(asViewer(child), confirmed.id)).toEqual({
        ok: false,
        reason: "forbidden",
      })

      const proposal = await createEvent(asViewer(child), input())
      await validateProposal(asViewer(parent), proposal.id)
      expect(await deleteEvent(asViewer(child), proposal.id)).toEqual({
        ok: false,
        reason: "forbidden",
      })
      expect(
        await db.familyEvent.count({
          where: { id: { in: [confirmed.id, proposal.id] } },
        })
      ).toBe(2)
    })

    it("withdraws only a proposal of the author: the delete itself refuses a validated one", async () => {
      // deleteEvent checks the rights first; withdrawProposal is the atomic part that closes the race where a
      // parent validates between that check and the delete. It is called directly here, as that race would.
      const { parent, child, sibling } = await setupFamily()
      const validated = await createEvent(asViewer(child), input())
      await validateProposal(asViewer(parent), validated.id)
      expect(await withdrawProposal(asViewer(child), validated.id)).toEqual({
        ok: false,
        reason: "already-handled",
      })
      expect(
        await db.familyEvent.findUnique({ where: { id: validated.id } })
      ).not.toBeNull()

      const stillProposal = await createEvent(asViewer(child), input())
      expect(
        await withdrawProposal(asViewer(sibling), stillProposal.id)
      ).toEqual({
        ok: false,
        reason: "already-handled",
      })
      expect(await withdrawProposal(asViewer(child), stillProposal.id)).toEqual(
        { ok: true }
      )
      expect(
        await db.familyEvent.findUnique({ where: { id: stillProposal.id } })
      ).toBeNull()
    })

    it("does not let a child delete another child's proposal, which they cannot even see", async () => {
      const { child, sibling } = await setupFamily()
      const { id } = await createEvent(asViewer(child), input())
      expect(await deleteEvent(asViewer(sibling), id)).toEqual({
        ok: false,
        reason: "not-found",
      })
      expect(await db.familyEvent.findUnique({ where: { id } })).not.toBeNull()
    })

    it("lets a parent delete any event, past ones included", async () => {
      const { parent, child } = await setupFamily()
      const confirmed = await createEvent(asViewer(parent), input())
      const proposal = await createEvent(asViewer(child), input())
      expect(await deleteEvent(asViewer(parent), confirmed.id)).toEqual({
        ok: true,
      })
      expect(await deleteEvent(asViewer(parent), proposal.id)).toEqual({
        ok: true,
      })
      expect(await deleteEvent(asViewer(parent), proposal.id)).toEqual({
        ok: false,
        reason: "not-found",
      })
    })
  })

  describe("validation and refusal", () => {
    it("confirms the proposal and records who validated it and when", async () => {
      const { parent, child, sibling } = await setupFamily()
      const { id } = await createEvent(asViewer(child), input())
      const at = new Date("2026-10-11T08:30:00.000Z")
      expect(await validateProposal(asViewer(parent), id, at)).toEqual({
        ok: true,
      })

      const row = await db.familyEvent.findUniqueOrThrow({ where: { id } })
      expect(row).toMatchObject({
        status: "confirmed",
        validatedById: parent.id,
        createdById: child.id,
      })
      expect(row.validatedAt).toEqual(at)
      // Now the whole family sees it.
      expect((await getEvent(asViewer(sibling), id))?.status).toBe("confirmed")
    })

    it("applies once only, even when two parents validate at the same time", async () => {
      const { parent, otherParent, child } = await setupFamily()
      const { id } = await createEvent(asViewer(child), input())
      const results = await Promise.all([
        validateProposal(asViewer(parent), id),
        validateProposal(asViewer(otherParent), id),
      ])
      expect(results.filter((r) => r.ok)).toHaveLength(1)
      expect(results.filter((r) => !r.ok)).toEqual([
        { ok: false, reason: "already-handled" },
      ])
    })

    it("does not let a child validate, even their own proposal", async () => {
      const { child } = await setupFamily()
      const { id } = await createEvent(asViewer(child), input())
      expect(await validateProposal(asViewer(child), id)).toEqual({
        ok: false,
        reason: "forbidden",
      })
      expect(
        (await db.familyEvent.findUniqueOrThrow({ where: { id } })).status
      ).toBe("proposed")
    })

    it("refuses by deleting the proposal, once", async () => {
      const { parent, otherParent, child } = await setupFamily()
      const { id } = await createEvent(asViewer(child), input())
      expect(await refuseProposal(asViewer(parent), id)).toEqual({ ok: true })
      expect(await db.familyEvent.findUnique({ where: { id } })).toBeNull()
      expect(await refuseProposal(asViewer(otherParent), id)).toEqual({
        ok: false,
        reason: "not-found",
      })
    })

    it("does not refuse an event that is already confirmed, nor let a child refuse", async () => {
      const { parent, child } = await setupFamily()
      const confirmed = await createEvent(asViewer(parent), input())
      expect(await refuseProposal(asViewer(parent), confirmed.id)).toEqual({
        ok: false,
        reason: "forbidden",
      })
      const proposal = await createEvent(asViewer(child), input())
      expect(await refuseProposal(asViewer(child), proposal.id)).toEqual({
        ok: false,
        reason: "forbidden",
      })
      expect(
        await db.familyEvent.count({
          where: { id: { in: [confirmed.id, proposal.id] } },
        })
      ).toBe(2)
    })
  })

  describe("answers", () => {
    it("starts everyone as pending, in the order members joined, without writing anything", async () => {
      const { parent } = await setupFamily()
      const { id } = await createEvent(asViewer(parent), input())
      const detail = (await getEvent(asViewer(parent), id))!
      expect(detail.answers.map((a) => [a.name, a.status])).toEqual([
        ["Parent", "pending"],
        ["Autre parent", "pending"],
        ["Enfant", "pending"],
        ["Frere", "pending"],
      ])
      expect(await db.rsvp.count({ where: { eventId: id } })).toBe(0)
    })

    it("records my answer and changes it without duplicating it, others stay pending", async () => {
      const { parent, child } = await setupFamily()
      const { id } = await createEvent(asViewer(parent), input())
      expect(await answerEvent(asViewer(child), id, "yes", BEFORE)).toEqual({
        ok: true,
      })
      expect(await answerEvent(asViewer(child), id, "maybe", BEFORE)).toEqual({
        ok: true,
      })

      expect(await db.rsvp.count({ where: { eventId: id } })).toBe(1)
      const detail = (await getEvent(asViewer(child), id))!
      expect(detail.myAnswer).toBe("maybe")
      expect(detail.answers.find((a) => a.name === "Enfant")?.status).toBe(
        "maybe"
      )
      expect(detail.answers.filter((a) => a.status === "pending")).toHaveLength(
        3
      )
      // Everyone sees who answered what.
      expect(
        (await getEvent(asViewer(parent), id))!.answers.find(
          (a) => a.name === "Enfant"
        )?.status
      ).toBe("maybe")
    })

    it("shows my own answer in the list", async () => {
      const { parent, child } = await setupFamily()
      const { id } = await createEvent(asViewer(parent), input())
      await answerEvent(asViewer(child), id, "no", BEFORE)
      const mine = (await listEvents(asViewer(child), BEFORE)).upcoming.find(
        (e) => e.id === id
      )
      expect(mine?.myAnswer).toBe("no")
      expect(
        (await listEvents(asViewer(parent), BEFORE)).upcoming.find(
          (e) => e.id === id
        )?.myAnswer
      ).toBe("pending")
    })

    it("does not accept an answer to a proposal or to an event that has ended", async () => {
      const { parent, child } = await setupFamily()
      const proposal = await createEvent(asViewer(child), input())
      expect(
        await answerEvent(asViewer(child), proposal.id, "yes", BEFORE)
      ).toEqual({ ok: false, reason: "forbidden" })
      const confirmed = await createEvent(asViewer(parent), input())
      expect(
        await answerEvent(asViewer(child), confirmed.id, "yes", AFTER)
      ).toEqual({ ok: false, reason: "forbidden" })
      expect(await db.rsvp.count()).toBeGreaterThanOrEqual(0)
      expect(
        await db.rsvp.count({
          where: { eventId: { in: [proposal.id, confirmed.id] } },
        })
      ).toBe(0)
    })

    it("keeps the answers visible once the event is over", async () => {
      const { parent, child } = await setupFamily()
      const { id } = await createEvent(asViewer(parent), input())
      await answerEvent(asViewer(child), id, "yes", BEFORE)
      const detail = (await getEvent(asViewer(child), id))!
      expect(detail.answers.find((a) => a.name === "Enfant")?.status).toBe(
        "yes"
      )
      const { past, upcoming } = await listEvents(asViewer(child), AFTER)
      expect(past.map((e) => e.id)).toEqual([id])
      expect(upcoming).toEqual([])
    })

    it("loses the answers of a member who leaves the family", async () => {
      const { parent, child } = await setupFamily()
      const { id } = await createEvent(asViewer(parent), input())
      await answerEvent(asViewer(child), id, "yes", BEFORE)
      await db.member.delete({ where: { id: child.id } })
      expect(await db.rsvp.count({ where: { eventId: id } })).toBe(0)
    })
  })

  describe("updating", () => {
    it("lets a parent change the title without touching the answers", async () => {
      const { parent, child } = await setupFamily()
      const { id } = await createEvent(asViewer(parent), input())
      await answerEvent(asViewer(child), id, "yes", BEFORE)
      expect(
        await updateEvent(
          asViewer(parent),
          id,
          input({ title: "Autre titre", place: "Jardin" })
        )
      ).toEqual({ ok: true, datesChanged: false })
      const detail = (await getEvent(asViewer(parent), id))!
      expect(detail).toMatchObject({ title: "Autre titre", place: "Jardin" })
      expect(detail.answers.find((a) => a.name === "Enfant")?.status).toBe(
        "yes"
      )
    })

    it("sets the answers back to pending when the dates change", async () => {
      const { parent, child } = await setupFamily()
      const { id } = await createEvent(asViewer(parent), input())
      await answerEvent(asViewer(child), id, "yes", BEFORE)
      await db.familyEvent.update({
        where: { id },
        data: { reminderSentAt: new Date() },
      })
      const moved = input({
        startsAt: "2026-10-18T17:00:00.000Z",
        endsAt: "2026-10-18T20:00:00.000Z",
      })
      expect(await updateEvent(asViewer(parent), id, moved)).toEqual({
        ok: true,
        datesChanged: true,
      })
      // New dates mean the reminder is due again.
      expect(
        (await db.familyEvent.findUnique({ where: { id } }))!.reminderSentAt
      ).toBeNull()
      const detail = (await getEvent(asViewer(parent), id))!
      expect(detail.answers.every((a) => a.status === "pending")).toBe(true)
      expect(await db.rsvp.count({ where: { eventId: id } })).toBe(0)
    })

    it("treats a change to all-day as a change of dates", async () => {
      const { parent, child } = await setupFamily()
      const { id } = await createEvent(asViewer(parent), input())
      await answerEvent(asViewer(child), id, "yes", BEFORE)
      const allDay = input({
        allDay: true,
        startsAt: "2026-10-17T00:00:00.000Z",
        endsAt: "2026-10-17T00:00:00.000Z",
      })
      await updateEvent(asViewer(parent), id, allDay)
      expect(await db.rsvp.count({ where: { eventId: id } })).toBe(0)
    })

    it("does not let a child edit, nor a parent edit a proposal", async () => {
      const { parent, child } = await setupFamily()
      const confirmed = await createEvent(asViewer(parent), input())
      expect(
        await updateEvent(
          asViewer(child),
          confirmed.id,
          input({ title: "Piraté" })
        )
      ).toEqual({
        ok: false,
        reason: "forbidden",
      })
      const proposal = await createEvent(asViewer(child), input())
      expect(
        await updateEvent(
          asViewer(parent),
          proposal.id,
          input({ title: "Corrigé" })
        )
      ).toEqual({
        ok: false,
        reason: "forbidden",
      })
      expect(
        (
          await db.familyEvent.findUniqueOrThrow({
            where: { id: confirmed.id },
          })
        ).title
      ).toBe("Repas de famille")
      expect(
        (await db.familyEvent.findUniqueOrThrow({ where: { id: proposal.id } }))
          .title
      ).toBe("Repas de famille")
    })
  })

  describe("families are separate", () => {
    it("shows, changes and answers nothing across families", async () => {
      const mine = await setupFamily()
      const theirs = await setupFamily()
      const confirmed = await createEvent(asViewer(mine.parent), input())
      const proposal = await createEvent(
        asViewer(mine.child),
        input({ title: SECRET_TITLE })
      )
      const stranger = asViewer(theirs.parent)

      expect(await getEvent(stranger, confirmed.id)).toBeNull()
      expect(await getEvent(stranger, proposal.id)).toBeNull()
      const notFound = { ok: false, reason: "not-found" }
      expect(await updateEvent(stranger, confirmed.id, input())).toEqual(
        notFound
      )
      expect(await deleteEvent(stranger, confirmed.id)).toEqual(notFound)
      expect(await validateProposal(stranger, proposal.id)).toEqual(notFound)
      expect(await refuseProposal(stranger, proposal.id)).toEqual(notFound)
      expect(await answerEvent(stranger, confirmed.id, "yes", BEFORE)).toEqual(
        notFound
      )

      const lists = await listEvents(stranger, BEFORE)
      expect(JSON.stringify(lists)).not.toContain("Repas")
      expect(JSON.stringify(lists)).not.toContain("Surprise")
      expect(
        await db.familyEvent.count({
          where: { id: { in: [confirmed.id, proposal.id] } },
        })
      ).toBe(2)
    })
  })

  describe("lists", () => {
    it("splits confirmed events into upcoming (soonest first) and past (latest first)", async () => {
      const { parent } = await setupFamily()
      const day = (n: number) => {
        const iso = `2026-10-${String(n).padStart(2, "0")}`
        return {
          startsAt: `${iso}T10:00:00.000Z`,
          endsAt: `${iso}T11:00:00.000Z`,
          title: `Jour ${n}`,
        }
      }
      for (const n of [25, 5, 20, 8])
        await createEvent(asViewer(parent), input(day(n)))
      const { upcoming, past } = await listEvents(
        asViewer(parent),
        new Date("2026-10-15T00:00:00.000Z")
      )
      expect(upcoming.map((e) => e.title)).toEqual(["Jour 20", "Jour 25"])
      expect(past.map((e) => e.title)).toEqual(["Jour 8", "Jour 5"])
    })

    it("keeps a multi-day all-day event upcoming until its last day is over", async () => {
      const { parent } = await setupFamily()
      await createEvent(
        asViewer(parent),
        input({
          allDay: true,
          startsAt: "2026-10-17T00:00:00.000Z",
          endsAt: "2026-10-18T00:00:00.000Z",
          title: "Week-end",
        })
      )
      const duringLastDay = new Date("2026-10-18T22:00:00.000Z")
      expect(
        (await listEvents(asViewer(parent), duringLastDay)).upcoming.map(
          (e) => e.title
        )
      ).toEqual(["Week-end"])
      expect(
        (
          await listEvents(
            asViewer(parent),
            new Date("2026-10-19T00:00:00.000Z")
          )
        ).past.map((e) => e.title)
      ).toEqual(["Week-end"])
    })
  })
})
