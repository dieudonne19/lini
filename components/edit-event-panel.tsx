"use client"

import { updateEventAction } from "@/app/evenements/actions"
import { EventEditor } from "@/components/event-editor"
import { useIsClient } from "@/hooks/use-is-client"
import { eventToFields } from "@/lib/event-form"

type EventToEdit = {
  id: string
  title: string
  place: string | null
  description: string | null
  startsAt: Date
  endsAt: Date
  allDay: boolean
}

// Container: the form starts from the stored event, shown in the device timezone, so it only exists once the
// browser is there.
export function EditEventPanel({ event }: { event: EventToEdit }) {
  const isClient = useIsClient()
  if (!isClient)
    return (
      <div aria-hidden className="h-96 animate-pulse rounded-xl bg-muted" />
    )
  return (
    <EventEditor
      save={(payload) => updateEventAction(event.id, payload)}
      fields={eventToFields(event)}
      intro="Si tu changes les dates, les réponses des membres repartent à « pas encore répondu »."
      submitLabel="Enregistrer"
      cancelHref={`/evenements/${event.id}`}
    />
  )
}
