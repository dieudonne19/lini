import { describe, expect, it } from "vitest"

import { generateToken, hashToken } from "@/lib/token"

describe("token", () => {
  it("carries at least 32 bytes", () => {
    expect(Buffer.from(generateToken(), "base64url").length).toBeGreaterThanOrEqual(32)
  })

  it("is different every time", () => {
    expect(generateToken()).not.toBe(generateToken())
  })

  it("hashes to the same value for the same token, never to the token itself", () => {
    const token = generateToken()
    expect(hashToken(token)).toBe(hashToken(token))
    expect(hashToken(token)).not.toBe(token)
    expect(hashToken(token)).toMatch(/^[0-9a-f]{64}$/)
  })
})
