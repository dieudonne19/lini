import { FieldError } from "@/components/ui/field-error"
import { MEMBER_COLORS } from "@/lib/schemas"

type ColorPickerProps = {
  legend: string
  name: string
  defaultValue: string
  errors?: string[]
}

// Radio group of swatches. The color name is the accessible name; a check mark shows the selection,
// so color is never the only signal.
function ColorPicker({ legend, name, defaultValue, errors }: ColorPickerProps) {
  const errorId = `${name}-error`
  return (
    <fieldset aria-describedby={errors?.length ? errorId : undefined}>
      <legend className="mb-1.5 text-sm font-medium">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {MEMBER_COLORS.map(({ value, label }) => (
          <label key={value} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={value}
              required
              defaultChecked={value === defaultValue}
              className="peer sr-only"
            />
            <span className="sr-only">{label}</span>
            <span
              aria-hidden
              style={{ backgroundColor: value }}
              className="flex size-11 items-center justify-center rounded-full text-lg font-semibold text-white ring-offset-2 ring-offset-background peer-checked:ring-2 peer-checked:ring-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-checked:after:content-['✓']"
            />
          </label>
        ))}
      </div>
      <FieldError id={errorId} errors={errors} />
    </fieldset>
  )
}

export { ColorPicker }
