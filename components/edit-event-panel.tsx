"use client"

import { updateEventAction } from "@/app/evenements/actions"
import { ConflictNotice } from "@/components/conflict-notice"
import { EventForm } from "@/components/event-form"
import { useEventConflicts } from "@/hooks/use-event-conflicts"
import { useEventDraft } from "@/hooks/use-event-draft"
import { useEventForm } from "@/hooks/use-event-form"
import { useIsClient } from "@/hooks/use-is-client"
import { eventToFields, toEventFormValues } from "@/lib/event-form"

type EventToEdit = {
  id: string
  title: string
  place: string | null
  description: string | null
  startsAt: Date
  endsAt: Date
  allDay: boolean
}

// The form itself: it starts from the stored event, shown in the device timezone, so it only exists once the
// browser is there (see EditEventPanel).
function EditEventForm({ event }: { event: EventToEdit }) {
  const fields = eventToFields(event)
  const { state, action, pending } = useEventForm((payload) =>
    updateEventAction(event.id, payload)
  )
  const draft = useEventDraft(fields)
  const { status, conflicts, retry } = useEventConflicts(draft.times)
  return (
    <EventForm
      action={action}
      pending={pending}
      state={state}
      initialValues={toEventFormValues(fields)}
      when={draft.when}
      onWhenChange={draft.change}
      whenExtras={
        <ConflictNotice status={status} conflicts={conflicts} onRetry={retry} />
      }
      intro="Si tu changes les dates, les réponses des membres repartent à « pas encore répondu »."
      submitLabel="Enregistrer"
      cancelHref={`/evenements/${event.id}`}
    />
  )
}

// Container: waits for the browser before building the form.
export function EditEventPanel({ event }: { event: EventToEdit }) {
  const isClient = useIsClient()
  if (!isClient)
    return (
      <div aria-hidden className="h-96 animate-pulse rounded-xl bg-muted" />
    )
  return <EditEventForm event={event} />
}
