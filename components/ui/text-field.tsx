import { FieldError } from "@/components/ui/field-error"
import { Input } from "@/components/ui/input"

type TextFieldProps = Omit<React.ComponentProps<typeof Input>, "id" | "invalid" | "aria-describedby"> & {
  id: string
  label: string
  errors?: string[]
}

// Label + input + linked error message.
function TextField({ id, label, errors, ...inputProps }: TextFieldProps) {
  const errorId = `${id}-error`
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <Input id={id} invalid={!!errors?.length} aria-describedby={errors?.length ? errorId : undefined} {...inputProps} />
      <FieldError id={errorId} errors={errors} />
    </div>
  )
}

export { TextField }
