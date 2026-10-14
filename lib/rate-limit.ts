import { createHash } from "node:crypto"

import { headers } from "next/headers"

import { db } from "@/lib/db"

const MINUTE = 60 * 1000

// How many tries one address gets per window, for each endpoint open to anyone.
export const LIMITS = {
  createFamily: { limit: 5, windowMs: 60 * MINUTE },
  recoverAccess: { limit: 10, windowMs: 15 * MINUTE },
  openLink: { limit: 30, windowMs: 15 * MINUTE },
} as const

export type Limit = { limit: number; windowMs: number }

// The key of one visitor for one endpoint. Only a hash of the address is kept. On Vercel the platform sets
// x-forwarded-for itself, so a visitor cannot choose it; elsewhere (local) all visitors share the "unknown" bucket.
export async function visitorKey(action: keyof typeof LIMITS) {
  const h = await headers()
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  return `${action}:${createHash("sha256").update(ip).digest("hex").slice(0, 32)}`
}

// Counts one try for `key` and says whether it is still within the limit. The count lives in the database, shared by
// every instance: one atomic statement either starts a new window or adds to the current one.
export async function allow(key: string, { limit, windowMs }: Limit) {
  const now = new Date()
  const resetAt = new Date(now.getTime() + windowMs)
  const [row] = await db.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimit" ("key", "count", "resetAt")
    VALUES (${key}, 1, ${resetAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."resetAt" <= ${now} THEN 1 ELSE "RateLimit"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimit"."resetAt" <= ${now} THEN ${resetAt} ELSE "RateLimit"."resetAt" END
    RETURNING "count"`
  // A new window is a good moment to drop the rows whose window is over.
  if (row.count === 1)
    await db.rateLimit.deleteMany({ where: { resetAt: { lt: now } } })
  return row.count <= limit
}

// The check an endpoint makes: is this visitor within the limit for this action?
export async function allowVisitor(action: keyof typeof LIMITS) {
  return allow(await visitorKey(action), LIMITS[action])
}
