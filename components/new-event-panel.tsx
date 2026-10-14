"use client"

import { createEventAction } from "@/app/evenements/actions"
import { ConflictNotice } from "@/components/conflict-notice"
import { EventForm } from "@/components/event-form"
import { useEventConflicts } from "@/hooks/use-event-conflicts"
import { useEventDraft } from "@/hooks/use-event-draft"
import { useEventForm } from "@/hooks/use-event-form"

// Container: wires the event form to the creation action, and shows who is busy at the chosen time.
// A parent publishes the event, a child sends a proposal that a parent must validate: the wording follows,
// the server decides which one it is.
export function NewEventPanel({ canPublish }: { canPublish: boolean }) {
  const { state, action, pending } = useEventForm(createEventAction)
  const draft = useEventDraft()
  const { status, conflicts, retry } = useEventConflicts(draft.times)
  return (
    <EventForm
      action={action}
      pending={pending}
      state={state}
      when={draft.when}
      onWhenChange={draft.change}
      whenExtras={
        <ConflictNotice status={status} conflicts={conflicts} onRetry={retry} />
      }
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
