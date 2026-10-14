type CheckboxFieldProps = Omit<React.ComponentProps<"input">, "type" | "id"> & {
  id: string
  label: string
  hint?: string
}

// Native checkbox with its label (44 px tall target) and an optional hint.
function CheckboxField({ id, label, hint, ...inputProps }: CheckboxFieldProps) {
  const hintId = `${id}-hint`
  return (
    <div>
      <label
        htmlFor={id}
        className="flex min-h-11 cursor-pointer items-center gap-3"
      >
        <input
          id={id}
          type="checkbox"
          aria-describedby={hint ? hintId : undefined}
          className="size-5 accent-primary"
          {...inputProps}
        />
        <span className="font-medium">{label}</span>
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  )
}

export { CheckboxField }
