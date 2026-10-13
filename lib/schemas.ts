import { z } from "zod"

// Fixed palette: a member's color is never free text.
export const MEMBER_COLORS = ["#2563eb", "#dc2626", "#16a34a", "#d97706", "#9333ea", "#0891b2", "#db2777", "#4b5563"] as const

const name = z.string().trim().min(1, "Écris un prénom").max(40, "40 caractères au maximum")

export const familySchema = z.object({
  familyName: z.string().trim().min(1, "Écris le nom de la famille").max(60, "60 caractères au maximum"),
  name,
  color: z.enum(MEMBER_COLORS),
})

export const memberSchema = z.object({
  name,
  color: z.enum(MEMBER_COLORS),
  role: z.enum(["parent", "child"]),
  // E.164; an empty field means "no number".
  phone: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{6,14}$/, "Format international, par exemple +261341234567")
    .or(z.literal(""))
    .transform((v) => v || null),
})
