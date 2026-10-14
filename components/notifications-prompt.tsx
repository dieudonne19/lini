"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"

import { subscribePush, unsubscribePush } from "@/app/notifications/actions"
import { Button } from "@/components/ui/button"

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

// "hidden": nothing to offer (not supported, notifications refused, or not set up on the server).
type Status = "hidden" | "off" | "on"

// The browser wants the public key as bytes, not as text.
function keyToBytes(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4))
    .replace(/-/g, "+")
    .replace(/_/g, "/")
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))
}

// Turns notifications on or off for this device. On iPhone the browser only offers them once Lini is installed on the
// home screen, so until then the card does not appear (the install prompt above it says what to do).
function NotificationsPrompt() {
  const [status, setStatus] = useState<Status>("hidden")
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()

  useEffect(() => {
    if (
      !PUBLIC_KEY ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    )
      return

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then(async (registration) => {
        const subscription = await registration.pushManager.getSubscription()
        if (subscription && Notification.permission === "granted") {
          // This device may have been used by another member: telling the server again makes it this member's.
          await subscribePush(subscription.toJSON())
          setStatus("on")
        } else {
          setStatus(Notification.permission === "denied" ? "hidden" : "off")
        }
      })
      .catch(() => setStatus("hidden"))
  }, [])

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

  if (status === "hidden") return null

  if (status === "on")
    return (
      <div className="mb-6 flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <Bell aria-hidden className="size-4" />
          Notifications activées sur cet appareil.
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={disable}
        >
          Désactiver
        </Button>
      </div>
    )

  return (
    <section
      aria-labelledby="notifications-title"
      className="mb-6 flex flex-col items-start gap-3 rounded-lg border border-border bg-muted p-4"
    >
      <div>
        <h2 id="notifications-title" className="text-sm font-semibold">
          Reçois les événements de ta famille
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Une notification quand un événement est ajouté, modifié ou confirmé,
          et un rappel avant qu&apos;il ait lieu.
        </p>
      </div>
      {message && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {message}
        </p>
      )}
      <Button type="button" size="sm" disabled={pending} onClick={enable}>
        <Bell aria-hidden />
        {pending ? "Activation…" : "Activer les notifications"}
      </Button>
    </section>
  )
}

export { NotificationsPrompt }
