import { FieldError } from "@/components/ui/field-error"
import { cn } from "@/lib/utils"

type SelectFieldProps = Omit<
  React.ComponentProps<"select">,
  "id" | "aria-describedby"
> & {
  id: string
  label: string
  options: readonly { value: string; label: string }[]
  errors?: string[]
}

// Native select with a visible label and a linked error message.
function SelectField({
  id,
  label,
  options,
  errors,
  className,
  ...selectProps
}: SelectFieldProps) {
  const errorId = `${id}-error`
  const hasError = !!errors?.length
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
        className={cn(
          "h-11 w-full rounded-xl border border-border bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive",
          className
        )}
        {...selectProps}
      >
        {options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <FieldError id={errorId} errors={errors} />
    </div>
  )
}

export { SelectField }
