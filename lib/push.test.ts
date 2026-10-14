import webpush from "web-push"
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest"

import { memberFromToken } from "@/lib/auth"
import { db } from "@/lib/db"
import { createFamilyWithParent } from "@/lib/families"
import {
  isPushEndpoint,
  removeSubscription,
  saveSubscription,
  sendToMembers,
  subscribedMemberIds,
  subscriptionSchema,
} from "@/lib/push"

vi.mock("web-push", () => ({
  default: { setVapidDetails: vi.fn(), sendNotification: vi.fn() },
}))
const send = vi.mocked(webpush.sendNotification)

describe("isPushEndpoint", () => {
  it("accepts the push services of the browsers", () => {
    for (const url of [
      "https://fcm.googleapis.com/fcm/send/abc",
      "https://updates.push.services.mozilla.com/wpush/v2/abc",
      "https://web.push.apple.com/abc",
      "https://wns2-par02p.notify.windows.com/?token=abc",
    ])
      expect(isPushEndpoint(url), url).toBe(true)
  })

  it("refuses everything else: other hosts, http, ports, credentials, lookalikes", () => {
    for (const url of [
      "http://fcm.googleapis.com/fcm/send/abc",
      "https://169.254.169.254/latest/meta-data",
      "https://localhost/x",
      "https://fcm.googleapis.com:8443/x",
      "https://user:pw@fcm.googleapis.com/x",
      "https://fcm.googleapis.com.evil.test/x",
      "https://evilpush.apple.com.evil.test/x",
      "not a url",
      "",
    ])
      expect(isPushEndpoint(url), url).toBe(false)
  })

  it("is what the subscription schema checks", () => {
    const keys = { p256dh: "k", auth: "a" }
    expect(
      subscriptionSchema.safeParse({
        endpoint: "https://fcm.googleapis.com/x",
        keys,
      }).success
    ).toBe(true)
    expect(
      subscriptionSchema.safeParse({ endpoint: "https://evil.test/x", keys })
        .success
    ).toBe(false)
  })
})

describe.skipIf(!process.env.DATABASE_URL)("subscriptions and sending", () => {
  const familyNames: string[] = []
  const endpoint = () =>
    `https://fcm.googleapis.com/fcm/send/${crypto.randomUUID()}`
  const keys = { p256dh: "p", auth: "a" }

  async function member(label: string) {
    const familyName = `Test push ${label} ${crypto.randomUUID()}`
    familyNames.push(familyName)
    const { token } = await createFamilyWithParent({
      familyName,
      name: "Lina",
      color: "#3D6DF2",
    })
    return (await memberFromToken(token))!
  }

  beforeEach(() => {
    send.mockReset()
    vi.stubEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY", "public")
    vi.stubEnv("VAPID_PRIVATE_KEY", "private")
    vi.stubEnv("VAPID_SUBJECT", "https://example.test")
  })

  afterAll(async () => {
    await db.family.deleteMany({ where: { name: { in: familyNames } } })
    await db.$disconnect()
  })

  it("saves a device, hands it to the next member who uses it, and removes only the member's own", async () => {
    const a = await member("a")
    const b = await member("b")
    const device = { endpoint: endpoint(), keys }

    expect(await saveSubscription(a.id, device)).toBe(true)
    expect([...(await subscribedMemberIds(a.familyId))]).toEqual([a.id])

    await saveSubscription(b.id, device)
    expect((await subscribedMemberIds(a.familyId)).size).toBe(0)
    expect((await subscribedMemberIds(b.familyId)).has(b.id)).toBe(true)

    await removeSubscription(a.id, device.endpoint)
    expect((await subscribedMemberIds(b.familyId)).has(b.id)).toBe(true)
    await removeSubscription(b.id, device.endpoint)
    expect((await subscribedMemberIds(b.familyId)).size).toBe(0)
  })

  it("keeps a member to 10 devices", async () => {
    const a = await member("cap")
    for (let i = 0; i < 10; i++)
      expect(await saveSubscription(a.id, { endpoint: endpoint(), keys })).toBe(
        true
      )
    expect(await saveSubscription(a.id, { endpoint: endpoint(), keys })).toBe(
      false
    )
  })

  it("counts what was sent, forgets a device that is gone, and counts other errors as failures", async () => {
    const a = await member("send")
    const ok = endpoint()
    const gone = endpoint()
    const down = endpoint()
    for (const e of [ok, gone, down])
      await saveSubscription(a.id, { endpoint: e, keys })
    send.mockImplementation(async (subscription) => {
      if (subscription.endpoint === gone)
        throw Object.assign(new Error("gone"), { statusCode: 410 })
      if (subscription.endpoint === down)
        throw Object.assign(new Error("down"), { statusCode: 500 })
      return {} as never
    })

    const result = await sendToMembers([a.id], {
      title: "t",
      body: "b",
      url: "/",
    })

    expect(result).toEqual({ sent: 1, failed: 1 })
    const left = await db.pushSubscription.findMany({
      where: { memberId: a.id },
    })
    expect(left.map((s) => s.endpoint).sort()).toEqual([down, ok].sort())
  })

  it("does nothing, and fails nothing, while the keys are not set", async () => {
    const a = await member("off")
    await saveSubscription(a.id, { endpoint: endpoint(), keys })
    vi.stubEnv("VAPID_PRIVATE_KEY", "")

    expect(
      await sendToMembers([a.id], { title: "t", body: "b", url: "/" })
    ).toEqual({
      sent: 0,
      failed: 0,
    })
    expect(send).not.toHaveBeenCalled()
  })
})
