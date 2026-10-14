import { afterAll, describe, expect, it } from "vitest"

import { db } from "@/lib/db"
import { allow } from "@/lib/rate-limit"

const keys: string[] = []
const newKey = () => {
  const key = `test:${crypto.randomUUID()}`
  keys.push(key)
  return key
}

afterAll(async () => {
  await db.rateLimit.deleteMany({ where: { key: { in: keys } } })
})

describe("allow", () => {
  it("accepts tries up to the limit, then refuses", async () => {
    const key = newKey()
    const limit = { limit: 3, windowMs: 60_000 }
    expect(await allow(key, limit)).toBe(true)
    expect(await allow(key, limit)).toBe(true)
    expect(await allow(key, limit)).toBe(true)
    expect(await allow(key, limit)).toBe(false)
  })

  it("counts each key on its own", async () => {
    const limit = { limit: 1, windowMs: 60_000 }
    const a = newKey()
    expect(await allow(a, limit)).toBe(true)
    expect(await allow(a, limit)).toBe(false)
    expect(await allow(newKey(), limit)).toBe(true)
  })

  it("starts a new window once the previous one is over", async () => {
    const key = newKey()
    const limit = { limit: 1, windowMs: 3000 }
    expect(await allow(key, limit)).toBe(true)
    expect(await allow(key, limit)).toBe(false)
    await new Promise((r) => setTimeout(r, 3500))
    expect(await allow(key, limit)).toBe(true)
  })

  it("holds under simultaneous tries", async () => {
    const key = newKey()
    const limit = { limit: 4, windowMs: 60_000 }
    const results = await Promise.all(
      Array.from({ length: 10 }, () => allow(key, limit))
    )
    expect(results.filter(Boolean)).toHaveLength(4)
  })
})
