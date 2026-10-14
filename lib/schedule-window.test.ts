import { describe, expect, it } from "vitest"

import { covers, padRange } from "@/lib/schedule-window"

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`)
const range = (from: string, to: string) => ({ from: day(from), to: day(to) })

describe("covers", () => {
  const loaded = range("2026-10-10", "2026-10-30")

  it("is false when nothing is loaded", () => {
    expect(covers(null, range("2026-10-12", "2026-10-13"))).toBe(false)
  })

  it("is true for a period inside the loaded one, and for exactly the loaded one", () => {
    expect(covers(loaded, range("2026-10-12", "2026-10-13"))).toBe(true)
    expect(covers(loaded, range("2026-10-10", "2026-10-30"))).toBe(true)
  })

  it("is false as soon as the needed period starts before or ends after what is loaded", () => {
    expect(covers(loaded, range("2026-10-09", "2026-10-13"))).toBe(false)
    expect(covers(loaded, range("2026-10-12", "2026-10-31"))).toBe(false)
    expect(covers(loaded, range("2026-11-01", "2026-11-02"))).toBe(false)
  })
})

describe("padRange", () => {
  it("adds the margin on each side without changing the original", () => {
    const needed = range("2026-10-14", "2026-10-15")
    const padded = padRange(needed, 7)
    expect(padded.from.toISOString()).toBe("2026-10-07T00:00:00.000Z")
    expect(padded.to.toISOString()).toBe("2026-10-22T00:00:00.000Z")
    expect(needed.from.toISOString()).toBe("2026-10-14T00:00:00.000Z")
  })

  it("covers the period it was made from, so asking once is enough", () => {
    const needed = range("2026-10-14", "2026-10-15")
    expect(covers(padRange(needed, 7), needed)).toBe(true)
    // A small change of date stays inside the margin and does not ask again.
    expect(covers(padRange(needed, 7), range("2026-10-18", "2026-10-20"))).toBe(
      true
    )
    expect(covers(padRange(needed, 7), range("2026-10-30", "2026-10-31"))).toBe(
      false
    )
  })
})
