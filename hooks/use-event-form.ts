import { useActionState } from "react"

import {
  missingEventFieldErrors,
  readEventFields,
  toEventFormValues,
  toEventPayload,
  type EventFields,
} from "@/lib/event-form"
import type { ActionResult, FormState } from "@/lib/form-state"

export type EventField = keyof EventFields

// The server reports errors on stored fields (startsAt, endsAt); the form shows them under the fields the
// person typed. An end that is not after the start is about the times when everything is on one day.
function toFormErrors(result: ActionResult, fields: EventFields) {
  const errors = result?.errors
  if (!errors) return undefined
  const sameDay = !fields.endDate || fields.endDate === fields.startDate
  const endField = fields.allDay || !sameDay ? "endDate" : "endTime"
  return {
    title: errors.title,
    place: errors.place,
    description: errors.description,
    startDate: errors.startsAt,
    [endField]: errors.endsAt,
  }
}

// Converts the typed local dates and times to UTC in the browser, sends them with `save` (create or
// update), and keeps what was typed so the form is refilled when something is refused.
export function useEventForm(
  save: (payload: FormData) => Promise<ActionResult>
) {
  const [state, action, pending] = useActionState(
    async (
      _previous: FormState<EventField>,
      formData: FormData
    ): Promise<FormState<EventField>> => {
      const fields = readEventFields(formData)
      const missing = missingEventFieldErrors(fields)
      const hasMissing = Object.keys(missing).length > 0
      const result = hasMissing ? null : await save(toEventPayload(fields))
      return {
        message: result?.message,
        errors: hasMissing ? missing : toFormErrors(result, fields),
        values: toEventFormValues(fields),
      }
    },
    null
  )
  return { state, action, pending }
}
