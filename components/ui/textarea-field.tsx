import { FieldError } from "@/components/ui/field-error"
import { Textarea } from "@/components/ui/textarea"

type TextareaFieldProps = Omit<
  React.ComponentProps<typeof Textarea>,
  "id" | "aria-describedby"
> & {
  id: string
  label: string
  hint?: string
  errors?: string[]
}

// Label + multi-line field + optional hint + linked error message.
function TextareaField({
  id,
  label,
  hint,
  errors,
  ...textareaProps
}: TextareaFieldProps) {
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
      <Textarea
        id={id}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        {...textareaProps}
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

export { TextareaField }
