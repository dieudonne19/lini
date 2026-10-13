import { createHmac, timingSafeEqual } from "node:crypto"

// The session cookie holds "<token>.<hmac>". The HMAC proves the cookie was issued by us;
// the token is then checked against Member.tokenHash, so a revoked link stops working at once.
function sign(token: string) {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters")
  return createHmac("sha256", secret).update(token).digest("base64url")
}

export function signSession(token: string) {
  return `${token}.${sign(token)}`
}

// Returns the token, or null when the cookie is missing, malformed or forged.
export function verifySession(value: string | undefined) {
  const [token, signature, ...rest] = value?.split(".") ?? []
  if (!token || !signature || rest.length) return null
  const expected = Buffer.from(sign(token))
  const given = Buffer.from(signature)
  return given.length === expected.length && timingSafeEqual(given, expected) ? token : null
}
