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
