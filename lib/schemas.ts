import { z } from "zod"

// Fixed palette: a member's color is never free text. The label is the accessible name of the swatch.
export const MEMBER_COLORS = [
  { value: "#2563eb", label: "Bleu" },
  { value: "#dc2626", label: "Rouge" },
  { value: "#16a34a", label: "Vert" },
  { value: "#d97706", label: "Orange" },
  { value: "#9333ea", label: "Violet" },
  { value: "#0891b2", label: "Turquoise" },
  { value: "#db2777", label: "Rose" },
  { value: "#4b5563", label: "Gris" },
] as const

const name = z
  .string()
  .trim()
  .min(1, "Écris un prénom")
  .max(40, "40 caractères au maximum")

const color = z
  .string()
  .refine(
    (v) => MEMBER_COLORS.some((c) => c.value === v),
    "Choisis une couleur"
  )

export const familySchema = z.object({
  familyName: z
    .string()
    .trim()
    .min(1, "Écris le nom de la famille")
    .max(60, "60 caractères au maximum"),
  name,
  color,
})

export const memberSchema = z.object({
  name,
  color,
  role: z.enum(["parent", "child"]),
  // E.164; an empty field means "no number".
  // Spaces, dots, dashes and parentheses are ignored: "+261 34 12 345 67" is accepted.
  phone: z
    .string()
    .transform((v) => v.replace(/[\s.()-]/g, ""))
    .refine(
      (v) => v === "" || /^\+[1-9]\d{6,14}$/.test(v),
      "Format international, par exemple +261341234567"
    )
    .transform((v) => v || null),
})

export type FamilyInput = z.infer<typeof familySchema>
export type MemberInput = z.infer<typeof memberSchema>

const DAY_MS = 24 * 60 * 60 * 1000
// Bounds the number of occurrences a repeating activity can generate.
const MAX_REPEAT_MS = 2 * 365 * DAY_MS

// A UTC instant such as "2026-10-14T16:00:00.000Z". The browser converts local times before sending.
const instant = z.iso
  .datetime("Date ou heure invalide")
  .transform((v) => new Date(v))

// The activity as the server stores it. A timed activity lasts at most 24 hours (it may cross midnight).
// An all-day activity is one day: startsAt = endsAt = midnight UTC of that day.
// repeatUntil is the last instant an occurrence may start at (end of the last day for timed activities).
export const activitySchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Écris un titre")
      .max(80, "80 caractères au maximum"),
    startsAt: instant,
    endsAt: instant,
    allDay: z.boolean(),
    isPrivate: z.boolean(),
    repeat: z.enum(["none", "daily", "weekly"]),
    repeatUntil: instant.nullable(),
  })
  .superRefine((a, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message })
    // When a date failed to parse, Zod skips its transform but still runs this check on the raw string.
    // The date's own error is already reported: stop here.
    const dates = [a.startsAt, a.endsAt, a.repeatUntil ?? a.startsAt]
    if (!dates.every((d) => d instanceof Date)) return
    if (a.allDay) {
      if (
        a.startsAt.getTime() % DAY_MS !== 0 ||
        a.startsAt.getTime() !== a.endsAt.getTime()
      ) {
        issue("startsAt", "Une journée entière dure un seul jour")
      }
    } else if (a.endsAt <= a.startsAt) {
      issue("endsAt", "La fin doit être après le début")
    } else if (a.endsAt.getTime() - a.startsAt.getTime() > DAY_MS) {
      issue("endsAt", "Une activité dure 24 heures au maximum")
    }
    if (a.repeat !== "none" && a.repeatUntil) {
      if (a.repeatUntil < a.startsAt)
        issue("repeatUntil", "La fin de la répétition doit être après le début")
      else if (a.repeatUntil.getTime() - a.startsAt.getTime() > MAX_REPEAT_MS) {
        issue("repeatUntil", "La répétition dure 2 ans au maximum")
      }
    }
  })
  // A one-off activity has no end of repetition.
  .transform((a) => ({
    ...a,
    repeatUntil: a.repeat === "none" ? null : a.repeatUntil,
  }))

export type ActivityInput = z.infer<typeof activitySchema>
