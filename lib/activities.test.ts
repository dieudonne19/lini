import { afterAll, describe, expect, it } from "vitest"

import {
  createActivity,
  deleteActivity,
  getOwnActivity,
  listOwnActivities,
  updateActivity,
} from "@/lib/activities"
import { db } from "@/lib/db"
import { activitySchema } from "@/lib/schemas"

const parse = (overrides: object = {}) =>
  activitySchema.parse({
    title: "Cours de danse",
    startsAt: "2026-10-14T16:00:00.000Z",
    endsAt: "2026-10-14T17:00:00.000Z",
    allDay: false,
    isPrivate: false,
    repeat: "none",
    repeatUntil: null,
    ...overrides,
  })

describe.skipIf(!process.env.DATABASE_URL)("activities", () => {
  const familyIds: string[] = []

  async function setupMembers() {
    const family = await db.family.create({ data: { name: "Test" } })
    familyIds.push(family.id)
    const member = (name: string) =>
      db.member.create({
        data: {
          familyId: family.id,
          name,
          color: "#000000",
          role: "parent",
          tokenHash: crypto.randomUUID(),
        },
      })
    return { owner: await member("Owner"), other: await member("Other") }
  }

  afterAll(async () => {
    await db.family.deleteMany({ where: { id: { in: familyIds } } })
    await db.$disconnect()
  })

  it("creates an activity and lists it with the member's others, in start order", async () => {
    const { owner, other } = await setupMembers()
    await createActivity(
      owner.id,
      parse({
        title: "Plus tard",
        startsAt: "2026-10-15T08:00:00.000Z",
        endsAt: "2026-10-15T09:00:00.000Z",
      })
    )
    await createActivity(owner.id, parse({ title: "D'abord" }))
    await createActivity(other.id, parse({ title: "Pas à moi" }))

    const own = await listOwnActivities(owner.id)
    expect(own.map((a) => a.title)).toEqual(["D'abord", "Plus tard"])
  })

  it("stores every field, including a private weekly activity with an end", async () => {
    const { owner } = await setupMembers()
    const input = parse({
      isPrivate: true,
      repeat: "weekly",
      repeatUntil: "2026-12-31T22:59:59.000Z",
    })
    const created = await createActivity(owner.id, input)
    expect(created).toMatchObject({
      memberId: owner.id,
      isPrivate: true,
      repeat: "weekly",
      allDay: false,
    })
    expect(created.repeatUntil).toEqual(new Date("2026-12-31T22:59:59.000Z"))
  })

  it("updates the whole series of its own activity", async () => {
    const { owner } = await setupMembers()
    const { id } = await createActivity(owner.id, parse({ repeat: "weekly" }))
    expect(
      await updateActivity(
        owner.id,
        id,
        parse({ title: "Nouveau titre", repeat: "daily" })
      )
    ).toBe(true)
    expect(
      await db.activity.findUniqueOrThrow({ where: { id } })
    ).toMatchObject({ title: "Nouveau titre", repeat: "daily" })
  })

  it("refuses to update or delete another member's activity, and changes nothing", async () => {
    const { owner, other } = await setupMembers()
    const { id } = await createActivity(owner.id, parse())

    expect(await updateActivity(other.id, id, parse({ title: "Piraté" }))).toBe(
      false
    )
    expect(await deleteActivity(other.id, id)).toBe(false)
    expect(
      await db.activity.findUniqueOrThrow({ where: { id } })
    ).toMatchObject({ title: "Cours de danse", memberId: owner.id })
  })

  it("reads its own activity, and nobody else's", async () => {
    const { owner, other } = await setupMembers()
    const { id } = await createActivity(owner.id, parse())
    expect((await getOwnActivity(owner.id, id))?.title).toBe("Cours de danse")
    expect(await getOwnActivity(other.id, id)).toBeNull()
    expect(await getOwnActivity(owner.id, "does-not-exist")).toBeNull()
  })

  it("deletes its own activity", async () => {
    const { owner } = await setupMembers()
    const { id } = await createActivity(owner.id, parse())
    expect(await deleteActivity(owner.id, id)).toBe(true)
    expect(await db.activity.findUnique({ where: { id } })).toBeNull()
    expect(await deleteActivity(owner.id, id)).toBe(false)
  })

  it("loses its activities when the member is removed", async () => {
    const { owner } = await setupMembers()
    const { id } = await createActivity(owner.id, parse())
    await db.member.delete({ where: { id: owner.id } })
    expect(await db.activity.findUnique({ where: { id } })).toBeNull()
  })
})
