import { useActionState } from "react"

import {
  createActivityAction,
  type ActivityActionState,
} from "@/app/agenda/actions"
import {
  missingFieldErrors,
  readActivityFields,
  toActivityPayload,
} from "@/lib/activity-form"
import type { FormState } from "@/lib/form-state"

export type ActivityField =
  | "title"
  | "date"
  | "startTime"
  | "endTime"
  | "allDay"
  | "isPrivate"
  | "repeat"
  | "repeatUntil"

// The server reports errors on stored fields; the form shows them under the fields the person typed.
function toFormErrors(result: ActivityActionState) {
  const errors = result?.errors
  if (!errors) return undefined
  return {
    title: errors.title,
    date: errors.startsAt,
    endTime: errors.endsAt,
    repeat: errors.repeat,
    repeatUntil: errors.repeatUntil,
  }
}

// Converts the typed local date and times to UTC in the browser, sends them, and keeps what was typed
// so the form is refilled when the server finds an error.
export function useActivityForm() {
  const [state, action, pending] = useActionState(
    async (
      _prev: FormState<ActivityField>,
      formData: FormData
    ): Promise<FormState<ActivityField>> => {
      const fields = readActivityFields(formData)
      const missing = missingFieldErrors(fields)
      const hasMissing = Object.keys(missing).length > 0
      const result = hasMissing
        ? null
        : await createActivityAction(null, toActivityPayload(fields))
      return {
        message: result?.message,
        errors: hasMissing ? missing : toFormErrors(result),
        values: {
          title: fields.title,
          date: fields.date,
          startTime: fields.startTime,
          endTime: fields.endTime,
          allDay: String(fields.allDay),
          isPrivate: String(fields.isPrivate),
          repeat: fields.repeat,
          repeatUntil: fields.repeatUntil,
        },
      }
    },
    null
  )
  return { state, action, pending }
}
