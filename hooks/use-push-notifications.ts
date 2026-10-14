import { useEffect, useState } from "react"

import { subscribePush, unsubscribePush } from "@/app/notifications/actions"

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

// "hidden": nothing to offer (not supported, notifications refused, or not set up on the server).
export type PushStatus = "hidden" | "off" | "on"

// The browser wants the public key as bytes, not as text.
function keyToBytes(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4))
    .replace(/-/g, "+")
    .replace(/_/g, "/")
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))
}

function isSupported() {
  return (
    !!PUBLIC_KEY &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  )
}

// Notifications on this device: whether they are on, and how to turn them on or off. On iPhone the browser only offers
// them once Lini is installed on the home screen, so until then the status stays "hidden".
// `sync` (the default) sets up the service worker and tells the server about the device: this device may have been
// used by another member, and telling the server again makes it this member's. Pass `sync: false` where the state
// is only read (the menu), so the work is done once per page.
export function usePushNotifications({ sync = true } = {}) {
  const [status, setStatus] = useState<PushStatus>("hidden")
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()

  useEffect(() => {
    if (!isSupported()) return
    const registering = sync
      ? navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        })
      : navigator.serviceWorker.getRegistration()

    registering
      .then(async (registration) => {
        const subscription = await registration?.pushManager.getSubscription()
        if (subscription && Notification.permission === "granted") {
          if (sync) await subscribePush(subscription.toJSON())
          setStatus("on")
        } else if (sync) {
          setStatus(Notification.permission === "denied" ? "hidden" : "off")
        }
      })
      .catch(() => setStatus("hidden"))
  }, [sync])

  async function enable() {
    setPending(true)
    setMessage(undefined)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "hidden" : "off")
        return
      }
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyToBytes(PUBLIC_KEY!),
      })
      const result = await subscribePush(subscription.toJSON())
      if (result.ok) setStatus("on")
      else {
        await subscription.unsubscribe()
        setMessage(result.message)
      }
    } catch {
      setMessage("Impossible d'activer les notifications sur cet appareil.")
    } finally {
      setPending(false)
    }
  }

  async function disable() {
    setPending(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await unsubscribePush(subscription.endpoint)
        await subscription.unsubscribe()
      }
      setStatus("off")
    } finally {
      setPending(false)
    }
  }

  return { status, pending, message, enable, disable }
}
