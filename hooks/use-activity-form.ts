import { useActionState } from "react"

import type { ActivityActionState } from "@/app/agenda/actions"
import {
  missingFieldErrors,
  readActivityFields,
  toActivityPayload,
  toFormValues,
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

// Converts the typed local date and times to UTC in the browser, sends them with `save`
// (create or update), and keeps what was typed so the form is refilled when something is refused.
export function useActivityForm(
  save: (payload: FormData) => Promise<ActivityActionState>
) {
  const [state, action, pending] = useActionState(
    async (
      _prev: FormState<ActivityField>,
      formData: FormData
    ): Promise<FormState<ActivityField>> => {
      const fields = readActivityFields(formData)
      const missing = missingFieldErrors(fields)
      const hasMissing = Object.keys(missing).length > 0
      const result = hasMissing ? null : await save(toActivityPayload(fields))
      return {
        message: result?.message,
        errors: hasMissing ? missing : toFormErrors(result),
        values: toFormValues(fields),
      }
    },
    null
  )
  return { state, action, pending }
}
