"use client"

import { useActionState } from "react"
import { RotateCw } from "lucide-react"

import { retryNotificationAction } from "@/app/evenements/actions"
import { Button } from "@/components/ui/button"

// Shown after a change was saved but some members could not be told: a button to try again.
export function RetryNotification({ eventId }: { eventId: string }) {
  const [state, action, pending] = useActionState(
    () => retryNotificationAction(eventId),
    null
  )

  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-lg bg-warning p-4 text-warning-foreground"
    >
      <p className="text-sm font-medium">
        Enregistré, mais certains membres n&apos;ont pas été prévenus.
      </p>
      {state?.message && <p className="text-sm">{state.message}</p>}
      <form action={action}>
        <Button type="submit" variant="outline" disabled={pending}>
          <RotateCw aria-hidden />
          {pending ? "Envoi…" : "Réessayer"}
        </Button>
      </form>
    </div>
  )
}
