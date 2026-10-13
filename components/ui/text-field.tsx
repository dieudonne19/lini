import { FieldError } from "@/components/ui/field-error"
import { Input } from "@/components/ui/input"

type TextFieldProps = Omit<
  React.ComponentProps<typeof Input>,
  "id" | "invalid" | "aria-describedby"
> & {
  id: string
  label: string
  hint?: string
  errors?: string[]
}

// Label + input + optional hint + linked error message.
function TextField({ id, label, hint, errors, ...inputProps }: TextFieldProps) {
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const hasError = !!errors?.length
  const describedBy =
    [hint && hintId, hasError && errorId].filter(Boolean).join(" ") || undefined
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <Input
        id={id}
        invalid={hasError}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {hint && (
        <p id={hintId} className="mt-1.5 text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      <FieldError id={errorId} errors={errors} />
    </div>
  )
}

export { TextField }
