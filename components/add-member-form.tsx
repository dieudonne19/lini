import { ColorPicker } from "@/components/color-picker"
import { RoleField } from "@/components/role-field"
import { Button } from "@/components/ui/button"
import { TextField } from "@/components/ui/text-field"
import type { FormState } from "@/lib/form-state"
import { MEMBER_COLORS } from "@/lib/schemas"

type Field = "name" | "color" | "role" | "phone"

type AddMemberFormProps = {
  action: (formData: FormData) => void
  pending: boolean
  state: FormState<Field>
}

// Pure presentation: everything comes from props.
function AddMemberForm({ action, pending, state }: AddMemberFormProps) {
  const { errors, values, message } = state ?? {}
  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      {message && (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
        >
          {message}
        </p>
      )}
      <TextField
        id="name"
        name="name"
        label="Prénom"
        required
        maxLength={40}
        autoComplete="off"
        defaultValue={values?.name}
        errors={errors?.name}
      />
      <RoleField
        name="role"
        defaultValue={values?.role || "child"}
        errors={errors?.role}
      />
      <ColorPicker
        legend="Couleur dans l'agenda"
        name="color"
        defaultValue={values?.color || MEMBER_COLORS[0].value}
        errors={errors?.color}
      />
      <TextField
        id="phone"
        name="phone"
        type="tel"
        label="Numéro de téléphone (facultatif)"
        hint="Format international, par exemple +261341234567. Seuls les parents le voient."
        autoComplete="off"
        defaultValue={values?.phone}
        errors={errors?.phone}
      />
      <Button type="submit" size="lg" className="h-11" disabled={pending}>
        {pending ? "Ajout en cours…" : "Ajouter le membre"}
      </Button>
    </form>
  )
}

export { AddMemberForm }
