"use client"

import { updateEventAction } from "@/app/evenements/actions"
import { EventForm } from "@/components/event-form"
import { useEventForm } from "@/hooks/use-event-form"
import { useIsClient } from "@/hooks/use-is-client"
import { eventToFields, toEventFormValues } from "@/lib/event-form"

type EditEventPanelProps = {
  event: {
    id: string
    title: string
    place: string | null
    description: string | null
    startsAt: Date
    endsAt: Date
    allDay: boolean
  }
}

// Container: the event form filled with the stored event. The fields are shown in the device timezone,
// so the form waits for the browser.
export function EditEventPanel({ event }: EditEventPanelProps) {
  const isClient = useIsClient()
  const { state, action, pending } = useEventForm((payload) =>
    updateEventAction(event.id, payload)
  )

  if (!isClient)
    return (
      <div aria-hidden className="h-96 animate-pulse rounded-xl bg-muted" />
    )
  return (
    <EventForm
      action={action}
      pending={pending}
      state={state}
      initialValues={toEventFormValues(eventToFields(event))}
      intro="Si tu changes les dates, les réponses des membres repartent à « pas encore répondu »."
      submitLabel="Enregistrer"
      cancelHref={`/evenements/${event.id}`}
    />
  )
}
