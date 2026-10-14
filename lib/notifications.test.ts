import { afterAll, beforeEach, describe, expect, it, vi } from "vitest"

import { memberFromToken } from "@/lib/auth"
import { db } from "@/lib/db"
import { createFamilyWithParent } from "@/lib/families"
import { createMember } from "@/lib/members"
import {
  notifyProposed,
  notifyPublished,
  notifyRefused,
  notifyReminder,
  notifyRescheduled,
  notifyValidated,
} from "@/lib/notifications"
import { sendDueReminders } from "@/lib/reminders"

const sendToMembers = vi.hoisted(() => vi.fn())
vi.mock("@/lib/push", () => ({ sendToMembers }))

describe.skipIf(!process.env.DATABASE_URL)("who is told what", () => {
  const familyNames: string[] = []

  // A family of two parents (Lina, Marc) and two children (Zoé, Léo).
  async function family() {
    const familyName = `Test notif ${crypto.randomUUID()}`
    familyNames.push(familyName)
    const { token } = await createFamilyWithParent({
      familyName,
      name: "Lina",
      color: "#3D6DF2",
    })
    const lina = (await memberFromToken(token))!
    const add = async (name: string, role: "parent" | "child") =>
      (await memberFromToken(
        await createMember(lina.familyId, {
          name,
          color: "#2FB67C",
          role,
          phone: null,
        })
      ))!
    return {
      lina,
      marc: await add("Marc", "parent"),
      zoe: await add("Zoé", "child"),
      leo: await add("Léo", "child"),
    }
  }

  const toldIds = () => sendToMembers.mock.calls.at(-1)![0] as string[]
  const payload = () => sendToMembers.mock.calls.at(-1)![1]

  beforeEach(() => {
    sendToMembers.mockReset()
    sendToMembers.mockResolvedValue({ sent: 1, failed: 0 })
  })

  afterAll(async () => {
    await db.family.deleteMany({ where: { name: { in: familyNames } } })
    await db.$disconnect()
  })

  it("tells everyone but the parent who published, and links to the event", async () => {
    const { lina, marc, zoe, leo } = await family()
    await notifyPublished(lina, { id: "e1", title: "Dîner" })
    expect(toldIds().sort()).toEqual([marc.id, zoe.id, leo.id].sort())
    expect(payload()).toMatchObject({ url: "/evenements/e1" })
    expect(payload().body).toContain("Lina a ajouté")
  })

  it("tells the parents, not the other children, when a child proposes", async () => {
    const { lina, marc, zoe } = await family()
    await notifyProposed(zoe, { id: "e2", title: "Piscine" })
    expect(toldIds().sort()).toEqual([lina.id, marc.id].sort())
  })

  it("tells everyone but the validating parent when a proposal is confirmed or its dates change", async () => {
    const { lina, marc, zoe, leo } = await family()
    await notifyValidated(marc, { id: "e3", title: "Cinéma" })
    expect(toldIds().sort()).toEqual([lina.id, zoe.id, leo.id].sort())
    await notifyRescheduled(marc, { id: "e3", title: "Cinéma" })
    expect(toldIds().sort()).toEqual([lina.id, zoe.id, leo.id].sort())
    expect(payload().body).toContain("Réponds à nouveau")
  })

  it("tells only the author when a proposal is refused", async () => {
    const { lina, zoe } = await family()
    await notifyRefused(lina, { title: "Piscine", createdById: zoe.id })
    expect(toldIds()).toEqual([zoe.id])
    expect(payload().url).toBe("/evenements")
    sendToMembers.mockClear()
    // Nobody to tell: the author is gone, or is the one who refused.
    expect(await notifyRefused(lina, { title: "x", createdById: null })).toBe(0)
    expect(
      await notifyRefused(lina, { title: "x", createdById: lina.id })
    ).toBe(0)
    expect(sendToMembers).not.toHaveBeenCalled()
  })

  it("returns how many devices were not reached", async () => {
    const { lina } = await family()
    sendToMembers.mockResolvedValue({ sent: 2, failed: 3 })
    expect(await notifyPublished(lina, { id: "e4", title: "Dîner" })).toBe(3)
  })

  it("reminds everyone except those who said they are not coming", async () => {
    const { lina, marc, zoe, leo } = await family()
    const at = new Date("2026-10-20T10:00:00Z")
    const event = await db.familyEvent.create({
      data: {
        familyId: lina.familyId,
        createdById: lina.id,
        status: "confirmed",
        title: "Dîner",
        startsAt: at,
        endsAt: at,
        rsvps: {
          create: [
            { memberId: leo.id, status: "no" },
            { memberId: marc.id, status: "yes" },
          ],
        },
      },
    })
    await notifyReminder(lina.familyId, event)
    expect(toldIds().sort()).toEqual([lina.id, marc.id, zoe.id].sort())
  })

  it("sends each reminder once, only for confirmed events starting in 12 to 36 hours", async () => {
    const { lina } = await family()
    const now = new Date("2026-10-20T16:00:00Z")
    const hours = (h: number) => new Date(now.getTime() + h * 3600_000)
    const make = (
      title: string,
      startsAt: Date,
      status: "confirmed" | "proposed" = "confirmed"
    ) =>
      db.familyEvent.create({
        data: {
          familyId: lina.familyId,
          createdById: lina.id,
          status,
          title,
          startsAt,
          endsAt: startsAt,
        },
      })
    const inWindow = await make("dans la fenêtre", hours(20))
    await make("trop tôt", hours(5))
    await make("trop tard", hours(40))
    await make("proposition", hours(20), "proposed")

    // The other tests' families may hold events in the window too: only this family is looked at.
    await sendDueReminders(now)
    const told = sendToMembers.mock.calls.filter(([, p]) =>
      p.body.includes("dans la fenêtre")
    )
    expect(told).toHaveLength(1)
    expect(
      (await db.familyEvent.findUnique({ where: { id: inWindow.id } }))!
        .reminderSentAt
    ).toEqual(now)

    sendToMembers.mockClear()
    await sendDueReminders(now)
    expect(
      sendToMembers.mock.calls.filter(([, p]) =>
        p.body.includes("dans la fenêtre")
      )
    ).toHaveLength(0)
  })
})
