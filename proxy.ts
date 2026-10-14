import { NextResponse, type NextRequest } from "next/server"

// Content-Security-Policy with a fresh nonce for every request: a script runs only if it carries that nonce, so a
// script injected into a page does not run. Next.js reads the nonce from this header and adds it to its own scripts.
// shortcut: styles may be inline ('unsafe-inline'), because the landing page sets style attributes. Scripts are the
// risk worth closing; tighten styles too if the inline ones are ever removed.
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")
  const dev = process.env.NODE_ENV === "development"

  const csp = [
    "default-src 'self'",
    // React uses eval in development only, to rebuild server error stacks in the browser.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    // The service worker of the notifications. Apart from script-src, whose 'strict-dynamic' ignores 'self'.
    "worker-src 'self'",
    `connect-src 'self'${dev ? " ws:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ")

  const headers = new Headers(request.headers)
  headers.set("x-nonce", nonce)
  headers.set("Content-Security-Policy", csp)

  const response = NextResponse.next({ request: { headers } })
  response.headers.set("Content-Security-Policy", csp)
  return response
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
}
