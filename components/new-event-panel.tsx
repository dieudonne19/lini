"use client"

import { createEventAction } from "@/app/evenements/actions"
import { EventEditor } from "@/components/event-editor"

// Container: a parent publishes the event, a child sends a proposal that a parent must validate: the wording
// follows, the server decides which one it is.
export function NewEventPanel({ canPublish }: { canPublish: boolean }) {
  return (
    <EventEditor
      save={createEventAction}
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
