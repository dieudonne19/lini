import { createHash, randomBytes } from "node:crypto"

// The personal link token: 32 random bytes, URL-safe. Only its hash is stored.
export function generateToken() {
  return randomBytes(32).toString("base64url")
}

// SHA-256 is enough: the token has 256 bits of entropy, so it cannot be brute-forced.
export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}
