import { createHash, timingSafeEqual } from "node:crypto"

import { sendDueReminders } from "@/lib/reminders"

const digest = (value: string) => createHash("sha256").update(value).digest()

// Called once a day by Vercel Cron (vercel.json), which sends "Authorization: Bearer <CRON_SECRET>". Nobody else may
// trigger it: without the secret set, or with another one, the answer is 401 and nothing is sent.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const given = request.headers.get("authorization") ?? ""
  if (!secret || !timingSafeEqual(digest(given), digest(`Bearer ${secret}`)))
    return new Response("Unauthorized", { status: 401 })

  return Response.json(await sendDueReminders())
}
