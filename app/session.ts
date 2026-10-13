import { cookies } from "next/headers"
import { cache } from "react"

import { memberFromToken } from "@/lib/auth"
import { signSession, verifySession } from "@/lib/session"

const SESSION_COOKIE = "lini_session"

// The member behind the session cookie, or null (no cookie, forged, revoked or removed).
// Memoized per request: the layout (navigation) and the page both ask, the database is read once.
export const getSessionMember = cache(async () => {
  const token = verifySession((await cookies()).get(SESSION_COOKIE)?.value)
  return token ? memberFromToken(token) : null
})

// The session member when they are a parent, otherwise null. Gate for every family-management action.
export async function getSessionParent() {
  const member = await getSessionMember()
  return member?.role === "parent" ? member : null
}

// Only callable from a Server Function or Route Handler.
export async function setSession(token: string) {
  const store = await cookies()
  store.set(SESSION_COOKIE, signSession(token), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  })
}

export async function clearSession() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}
