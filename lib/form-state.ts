// Shape returned by a form's Server Action: errors per field, the submitted values (to refill the form),
// and a form-level message. `null` means "not submitted yet".
export type FormState<Field extends string> = {
  message?: string
  errors?: Partial<Record<Field, string[]>>
  values?: Record<Field, string>
} | null

// What a Server Action returns when it did not redirect: a message for the whole form and/or errors per
// field of the stored data. `null` means "nothing to report".
export type ActionResult = {
  message?: string
  errors?: Partial<Record<string, string[]>>
} | null
