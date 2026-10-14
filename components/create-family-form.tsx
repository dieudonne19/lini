import { ColorPicker } from "@/components/color-picker"
import { Button } from "@/components/ui/button"
import { TextField } from "@/components/ui/text-field"
import type { FormState } from "@/lib/form-state"
import { MEMBER_COLORS } from "@/lib/schemas"

type Field = "familyName" | "name" | "color"

type CreateFamilyFormProps = {
  action: (formData: FormData) => void
  pending: boolean
  state: FormState<Field>
}

// Pure presentation: everything comes from props.
function CreateFamilyForm({ action, pending, state }: CreateFamilyFormProps) {
  const { errors, values, message } = state ?? {}
  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Bienvenue sur Lini</h1>
        <p className="text-muted-foreground">
          Qui fait quoi, et quand êtes-vous tous libres ? Commence par créer ta famille.
        </p>
      </div>

      {message && (
        <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {message}
        </p>
      )}

      <TextField
        id="familyName"
        name="familyName"
        label="Nom de la famille"
        required
        maxLength={60}
        autoComplete="off"
        defaultValue={values?.familyName}
        errors={errors?.familyName}
      />
      <TextField
        id="name"
        name="name"
        label="Ton prénom"
        required
        maxLength={40}
        autoComplete="given-name"
        defaultValue={values?.name}
        errors={errors?.name}
      />
      <ColorPicker
        legend="Ta couleur dans l'agenda"
        name="color"
        defaultValue={values?.color || MEMBER_COLORS[0].value}
        errors={errors?.color}
      />

      <Button type="submit" size="lg" className="h-11" disabled={pending}>
        {pending ? "Création en cours…" : "Créer la famille"}
      </Button>
    </form>
  )
}

export { CreateFamilyForm }
