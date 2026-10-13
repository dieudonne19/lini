import { describe, expect, it } from "vitest"

import { signSession, verifySession } from "@/lib/session"
import { generateToken } from "@/lib/token"

describe("session cookie", () => {
  it("round-trips a signed token", () => {
    const token = generateToken()
    expect(verifySession(signSession(token))).toBe(token)
  })

  it("rejects missing, malformed and forged values", () => {
    const token = generateToken()
    const [, signature] = signSession(token).split(".")
    expect(verifySession(undefined)).toBeNull()
    expect(verifySession(token)).toBeNull()
    expect(verifySession(`${token}.`)).toBeNull()
    expect(verifySession(`${token}.${signature}.x`)).toBeNull()
    expect(verifySession(`${generateToken()}.${signature}`)).toBeNull()
    expect(verifySession(`${token}.${"a".repeat(signature.length)}`)).toBeNull()
  })
})
