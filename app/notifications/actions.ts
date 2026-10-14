"use server"

import { getSessionMember } from "@/app/session"
import {
  removeSubscription,
  saveSubscription,
  subscriptionSchema,
} from "@/lib/push"

export type SubscribeResult = { ok: true } | { ok: false; message: string }

// A device turns notifications on for the signed-in member. What the browser sends is untrusted: it is validated,
// and the endpoint must belong to a known push service (see lib/push.ts).
export async function subscribePush(input: unknown): Promise<SubscribeResult> {
  const member = await getSessionMember()
  if (!member)
    return {
      ok: false,
      message:
        "Ton lien ne fonctionne plus. Demande-en un nouveau à un parent.",
    }

  const parsed = subscriptionSchema.safeParse(input)
  if (!parsed.success)
    return {
      ok: false,
      message: "Ce navigateur ne permet pas d'activer les notifications.",
    }

  if (!(await saveSubscription(member.id, parsed.data)))
    return {
      ok: false,
      message:
        "Les notifications sont déjà activées sur 10 appareils. Désactive-les sur l'un d'eux.",
    }
  return { ok: true }
}

// Only the signed-in member's own device is removed.
export async function unsubscribePush(endpoint: string) {
  const member = await getSessionMember()
  if (member && typeof endpoint === "string")
    await removeSubscription(member.id, endpoint)
}
