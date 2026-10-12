import { db } from "../lib/db"
import { generateToken, hashToken } from "../lib/token"

// Dev data: one family, anchored on the current week so the week view is never empty.
// Re-running deletes and recreates only this family (found by name), nothing else.
const FAMILY_NAME = "Famille Test (seed)"

if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "production") {
  throw new Error(`Refusing to seed with NODE_ENV=${process.env.NODE_ENV}`)
}

const now = new Date()
const monday = new Date(
  Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - ((now.getUTCDay() + 6) % 7))
)
// Date at "day" days after Monday, UTC. Without hours: midnight UTC (all-day convention).
const at = (day: number, hour = 0, minute = 0) =>
  new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate() + day, hour, minute))

async function main() {
  await db.family.deleteMany({ where: { name: FAMILY_NAME } })
  const family = await db.family.create({ data: { name: FAMILY_NAME } })

  const people = [
    { key: "nirina", name: "Nirina", color: "#0f766e", role: "parent", phone: null },
    { key: "hery", name: "Hery", color: "#b45309", role: "parent", phone: null },
    { key: "lova", name: "Lova", color: "#7c3aed", role: "child", phone: "+261340000000" },
    { key: "mamy", name: "Mamy", color: "#be123c", role: "child", phone: null },
  ] as const

  const tokens: Record<string, string> = {}
  const members: Record<string, string> = {}
  for (const { key, ...person } of people) {
    tokens[key] = generateToken()
    const member = await db.member.create({
      data: { ...person, familyId: family.id, tokenHash: hashToken(tokens[key]) },
    })
    members[key] = member.id
  }

  const activity = (
    key: string,
    title: string,
    startsAt: Date,
    endsAt: Date,
    extra: { allDay?: boolean; isPrivate?: boolean; repeat?: "daily" | "weekly"; repeatUntil?: Date } = {}
  ) => ({ memberId: members[key], title, startsAt, endsAt, ...extra })

  await db.activity.createMany({
    data: [
      activity("nirina", "Travail", at(0, 8), at(0, 17), { repeat: "weekly", repeatUntil: at(56) }),
      activity("nirina", "Marché", at(5, 11), at(5, 13)),
      activity("hery", "Réunion", at(0, 9), at(0, 10), { repeat: "daily", repeatUntil: at(4) }),
      activity("lova", "Cours", at(1, 8), at(1, 12), { repeat: "weekly", repeatUntil: at(70) }),
      activity("lova", "Rendez-vous médecin", at(2, 14), at(2, 15), { isPrivate: true }),
      activity("lova", "Rendez-vous privé", at(5, 14), at(5, 15), { isPrivate: true }),
      activity("mamy", "Anniversaire d'un ami", at(5), at(5), { allDay: true }),
      activity("mamy", "Foot", at(2, 17), at(2, 19)),
    ],
  })

  const confirmed = {
    familyId: family.id,
    status: "confirmed",
    createdById: members.nirina,
    validatedById: members.nirina,
    validatedAt: now,
  } as const

  const lunch = await db.familyEvent.create({
    data: { ...confirmed, title: "Repas de famille", place: "Maison", startsAt: at(5, 12), endsAt: at(5, 15) },
  })
  const weekend = await db.familyEvent.create({
    data: { ...confirmed, title: "Week-end à la plage", startsAt: at(12), endsAt: at(13), allDay: true },
  })
  await db.familyEvent.create({
    data: {
      familyId: family.id,
      status: "proposed",
      createdById: members.mamy,
      title: "Soirée jeux",
      description: "Jeux de société après le dîner.",
      startsAt: at(4, 19),
      endsAt: at(4, 22),
    },
  })

  const answers = { nirina: "yes", hery: "maybe", lova: "no", mamy: "pending" } as const
  await db.rsvp.createMany({
    data: [
      ...Object.entries(answers).map(([key, status]) => ({ eventId: lunch.id, memberId: members[key], status })),
      ...Object.keys(answers).map((key) => ({ eventId: weekend.id, memberId: members[key] })),
    ],
  })

  console.log(`Seeded "${FAMILY_NAME}". Personal tokens (shown once, only hashes are stored):`)
  for (const { key, name, role } of people) console.log(`  ${name} (${role}): ${tokens[key]}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
