import { FieldError } from "@/components/ui/field-error"

const ROLE_OPTIONS = [
  { value: "child", label: "Enfant" },
  { value: "parent", label: "Parent" },
] as const

type RoleFieldProps = {
  name: string
  defaultValue: string
  errors?: string[]
}

function RoleField({ name, defaultValue, errors }: RoleFieldProps) {
  const errorId = `${name}-error`
  return (
    <fieldset aria-describedby={errors?.length ? errorId : undefined}>
      <legend className="mb-1.5 text-sm font-medium">Rôle</legend>
      <div className="flex gap-6">
        {ROLE_OPTIONS.map(({ value, label }) => (
          <label
            key={value}
            className="flex min-h-11 cursor-pointer items-center gap-2"
          >
            <input
              type="radio"
              name={name}
              value={value}
              required
              defaultChecked={value === defaultValue}
              className="size-5"
            />
            {label}
          </label>
        ))}
      </div>
      <FieldError id={errorId} errors={errors} />
    </fieldset>
  )
}

export { RoleField }
