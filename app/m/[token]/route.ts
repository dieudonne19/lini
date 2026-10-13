import { NextResponse } from "next/server"

import { setSession } from "@/app/session"
import { memberFromToken } from "@/lib/auth"

// Opening a personal link logs the member in. An unknown, revoked or removed link sets no cookie.
export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (!(await memberFromToken(token))) return NextResponse.redirect(new URL("/lien-invalide", request.url))

  await setSession(token)
  return NextResponse.redirect(new URL("/", request.url))
}
