"use client"

import { createEventAction } from "@/app/evenements/actions"
import { EventForm } from "@/components/event-form"
import { useEventForm } from "@/hooks/use-event-form"

// Container: wires the event form to the creation action. A parent publishes the event, a child sends a
// proposal that a parent must validate: the wording follows, the server decides which one it is.
export function NewEventPanel({ canPublish }: { canPublish: boolean }) {
  const { state, action, pending } = useEventForm(createEventAction)
  return (
    <EventForm
      action={action}
      pending={pending}
      state={state}
      intro={
        canPublish
          ? undefined
          : "Un parent doit valider ta proposition avant que les autres membres la voient."
      }
      submitLabel={canPublish ? "Créer l'événement" : "Envoyer la proposition"}
      cancelHref="/evenements"
    />
  )
}
