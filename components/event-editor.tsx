"use client"

import { useState } from "react"

import { ConflictNotice } from "@/components/conflict-notice"
import { EventForm } from "@/components/event-form"
import { FreeSlotsPanel } from "@/components/free-slots-panel"
import { useEventConflicts } from "@/hooks/use-event-conflicts"
import { useEventDraft } from "@/hooks/use-event-draft"
import { useEventForm } from "@/hooks/use-event-form"
import { useFreeSlots } from "@/hooks/use-free-slots"
import {
  toEventFormValues,
  whenFromSlot,
  whenOf,
  type EventFields,
} from "@/lib/event-form"
import type { ActionResult } from "@/lib/form-state"
import type { FreeSlot } from "@/lib/free-slots"

type EventEditorProps = {
  // Sends the event: creation or update.
  save: (payload: FormData) => Promise<ActionResult>
  // The stored event, when editing (in the device timezone, so it must be built in the browser).
  fields?: EventFields
  intro?: string
  submitLabel: string
  cancelHref: string
}

// Container shared by creating, proposing and editing an event: the form, the dates being typed, who is
// busy then (conflicts) and the free slots that fill the dates.
export function EventEditor({
  save,
  fields,
  intro,
  submitLabel,
  cancelHref,
}: EventEditorProps) {
  const { state, action, pending } = useEventForm(save)
  const draft = useEventDraft(fields && whenOf(fields))
  const conflicts = useEventConflicts(draft.times)

  const [slotsOpen, setSlotsOpen] = useState(false)
  const [picked, setPicked] = useState<FreeSlot | null>(null)
  const free = useFreeSlots(slotsOpen)

  return (
    <EventForm
      action={action}
      pending={pending}
      state={state}
      initialValues={fields && toEventFormValues(fields)}
      when={draft.when}
      // Typing a date by hand cancels the slot that was chosen.
      onWhenChange={(patch) => {
        draft.change(patch)
        setPicked(null)
      }}
      whenHelp={
        <FreeSlotsPanel
          open={slotsOpen}
          onOpenChange={setSlotsOpen}
          status={free.status}
          slots={free.slots}
          today={free.today}
          picked={picked}
          onPick={(slot) => {
            draft.change(whenFromSlot(slot))
            setPicked(slot)
          }}
          onRetry={free.retry}
        />
      }
      whenExtras={
        <ConflictNotice
          status={conflicts.status}
          conflicts={conflicts.conflicts}
          onRetry={conflicts.retry}
        />
      }
      intro={intro}
      submitLabel={submitLabel}
      cancelHref={cancelHref}
    />
  )
}
