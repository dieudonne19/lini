// Shows the first error of a field. Give it the id referenced by the field's aria-describedby.
function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  return errors?.length ? (
    <p id={id} className="mt-1.5 text-sm text-destructive">
      {errors[0]}
    </p>
  ) : null
}

export { FieldError }
