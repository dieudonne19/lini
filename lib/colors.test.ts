import { describe, expect, it } from "vitest"

import { contrastRatio, readableTextColor } from "@/lib/colors"
import { MEMBER_COLORS, memberSchema } from "@/lib/schemas"

describe("readableTextColor", () => {
  it("picks white on dark colors and the navy on light ones", () => {
    expect(readableTextColor("#1F2540")).toBe("#FFFFFF")
    expect(readableTextColor("#F2A93B")).toBe("#1F2540")
    expect(readableTextColor("#2FB67C")).toBe("#1F2540")
  })

  it("gives every palette color at least 3:1, the minimum for large text, including the old pre-logo ones", () => {
    const oldColors = [
      "#2563eb",
      "#dc2626",
      "#16a34a",
      "#d97706",
      "#9333ea",
      "#0891b2",
      "#db2777",
      "#4b5563",
    ]
    for (const { value } of [
      ...MEMBER_COLORS,
      ...oldColors.map((value) => ({ value })),
    ]) {
      expect(
        contrastRatio(value, readableTextColor(value)),
        value
      ).toBeGreaterThanOrEqual(3)
    }
  })
})

describe("member palette", () => {
  const base = { name: "Lina", role: "child", phone: "" }

  it("starts with the four colors of the logo dots", () => {
    expect(MEMBER_COLORS.slice(0, 4).map((c) => c.value)).toEqual([
      "#3D6DF2",
      "#F2A93B",
      "#2FB67C",
      "#B65CF0",
    ])
  })

  it("accepts a palette color and refuses any other", () => {
    expect(memberSchema.safeParse({ ...base, color: "#F2A93B" }).success).toBe(
      true
    )
    expect(memberSchema.safeParse({ ...base, color: "#2563eb" }).success).toBe(
      false
    )
    expect(memberSchema.safeParse({ ...base, color: "red" }).success).toBe(
      false
    )
  })

  it("has no duplicate color or label", () => {
    expect(new Set(MEMBER_COLORS.map((c) => c.value)).size).toBe(
      MEMBER_COLORS.length
    )
    expect(new Set(MEMBER_COLORS.map((c) => c.label)).size).toBe(
      MEMBER_COLORS.length
    )
  })
})
