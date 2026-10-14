import type { NextConfig } from "next"

// Headers that do not change from one request to the next. The Content-Security-Policy needs a nonce per request, so it
// is set in proxy.ts.
const securityHeaders = [
  // Nobody may show Lini inside a frame (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // A personal link is a secret: it is never sent as a referrer to another site.
  { key: "Referrer-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
]

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
}

export default nextConfig
