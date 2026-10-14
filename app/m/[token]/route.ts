import { NextResponse } from "next/server"

import { setSession } from "@/app/session"
import { memberFromToken } from "@/lib/auth"
import { allowVisitor } from "@/lib/rate-limit"

// Opening a personal link logs the member in. An unknown, revoked or removed link sets no cookie.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  if (!(await allowVisitor("openLink")))
    return new NextResponse(
      "Trop de tentatives. Réessaie dans quelques minutes.",
      {
        status: 429,
        headers: { "Retry-After": "900" },
      }
    )
  if (!(await memberFromToken(token)))
    return NextResponse.redirect(new URL("/lien-invalide", request.url))

  await setSession(token)
  return NextResponse.redirect(new URL("/", request.url))
}
