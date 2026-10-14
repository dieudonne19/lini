import webpush from "web-push"
import { z } from "zod"

import { db } from "@/lib/db"

export type PushPayload = { title: string; body: string; url: string }

// The push services of the browsers. The server posts to the address the browser gave it, so an address pointing
// anywhere else (an internal service, say) is refused: it would turn Lini into a way to reach other servers (SSRF).
const PUSH_HOSTS = [
  /^fcm\.googleapis\.com$/, // Chrome, Edge, Brave, Opera, Samsung Internet
  /^updates\.push\.services\.mozilla\.com$/, // Firefox
  /(^|\.)push\.apple\.com$/, // Safari, iPhone
  /\.notify\.windows\.com$/, // Edge on Windows
]

export function isPushEndpoint(value: string) {
  try {
    const url = new URL(value)
    return (
      url.protocol === "https:" &&
      !url.port &&
      !url.username &&
      PUSH_HOSTS.some((host) => host.test(url.hostname))
    )
  } catch {
    return false
  }
}

// What the browser hands over when it subscribes (PushSubscription.toJSON()).
export const subscriptionSchema = z.object({
  endpoint: z.string().max(2000).refine(isPushEndpoint),
  keys: z.object({
    p256dh: z.string().min(1).max(200),
    auth: z.string().min(1).max(100),
  }),
})
export type SubscriptionInput = z.infer<typeof subscriptionSchema>

const MAX_DEVICES_PER_MEMBER = 10

// Saves a device for a member. The same device may come back after another member used it: it then belongs to
// the new one. Returns false when the member already has too many devices.
export async function saveSubscription(
  memberId: string,
  { endpoint, keys }: SubscriptionInput
) {
  const existing = await db.pushSubscription.findUnique({ where: { endpoint } })
  if (!existing) {
    const count = await db.pushSubscription.count({ where: { memberId } })
    if (count >= MAX_DEVICES_PER_MEMBER) return false
  }
  await db.pushSubscription.upsert({
    where: { endpoint },
    create: { memberId, endpoint, p256dh: keys.p256dh, auth: keys.auth },
    update: { memberId, p256dh: keys.p256dh, auth: keys.auth },
  })
  return true
}

// Only the member's own device: the endpoint of someone else's is never removed.
export async function removeSubscription(memberId: string, endpoint: string) {
  await db.pushSubscription.deleteMany({ where: { memberId, endpoint } })
}

// The members of a family who can receive notifications (at least one device).
export async function subscribedMemberIds(familyId: string) {
  const rows = await db.pushSubscription.findMany({
    where: { member: { familyId } },
    select: { memberId: true },
    distinct: ["memberId"],
  })
  return new Set(rows.map((row) => row.memberId))
}

// Notifications stay off (nothing is sent, nothing counts as failed) until the VAPID keys are set.
function configure() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT
  if (!publicKey || !privateKey || !subject) return false
  webpush.setVapidDetails(subject, publicKey, privateKey)
  return true
}

// Sends the notification to every device of these members. A device the push service says is gone (404, 410) is
// forgotten; any other error counts as a failure, so the person who acted can be told and try again.
export async function sendToMembers(memberIds: string[], payload: PushPayload) {
  const result = { sent: 0, failed: 0 }
  if (!memberIds.length || !configure()) return result

  const subscriptions = await db.pushSubscription.findMany({
    where: { memberId: { in: memberIds } },
  })
  const body = JSON.stringify(payload)
  await Promise.all(
    subscriptions.map(async ({ id, endpoint, p256dh, auth }) => {
      if (!isPushEndpoint(endpoint)) {
        await db.pushSubscription.deleteMany({ where: { id } })
        return
      }
      try {
        await webpush.sendNotification(
          { endpoint, keys: { p256dh, auth } },
          body,
          { TTL: 60 * 60 * 24, timeout: 5000 }
        )
        result.sent++
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode
        if (status === 404 || status === 410)
          await db.pushSubscription.deleteMany({ where: { id } })
        else result.failed++
      }
    })
  )
  return result
}
