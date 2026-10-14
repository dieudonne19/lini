import { FieldError } from "@/components/ui/field-error"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SelectFieldProps = {
  id: string
  // Sent with the form (the select keeps a hidden field with this name).
  name: string
  label: string
  options: readonly { value: string; label: string }[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  errors?: string[]
}

// shadcn Select with a visible label and a linked error message.
function SelectField({
  id,
  name,
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  errors,
}: SelectFieldProps) {
  const errorId = `${id}-error`
  const hasError = !!errors?.length
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <Select
        name={name}
        items={options}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(next) => next && onValueChange?.(next)}
      >
        <SelectTrigger
          id={id}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          className="w-full border-input bg-card text-base data-[size=default]:h-11"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="min-h-10 text-base"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError id={errorId} errors={errors} />
    </div>
  )
}

export { SelectField }
