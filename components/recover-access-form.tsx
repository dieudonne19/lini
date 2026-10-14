import { Button } from "@/components/ui/button"
import { TextField } from "@/components/ui/text-field"

type RecoverAccessFormProps = {
  action: (formData: FormData) => void
  pending: boolean
  message?: string
  name?: string
}

// Pure presentation: everything comes from props. The code is never refilled after a failed try.
function RecoverAccessForm({
  action,
  pending,
  message,
  name,
}: RecoverAccessFormProps) {
  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Retrouve ton accès
        </h1>
        <p className="text-muted-foreground">
          Entre ton code de secours et ton prénom : tu reçois un nouveau lien.
          Seuls les parents ont un code de secours.
        </p>
      </div>

      {message && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          {message}
        </p>
      )}

      <TextField
        id="code"
        name="code"
        label="Code de secours"
        hint="Les majuscules et les tirets n'ont pas d'importance."
        required
        maxLength={64}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        placeholder="XXXX-XXXX-XXXX-XXXX"
        className="font-mono tracking-wider"
      />
      <TextField
        id="name"
        name="name"
        label="Ton prénom"
        required
        maxLength={40}
        autoComplete="off"
        defaultValue={name}
      />

      <Button type="submit" size="lg" className="h-11" disabled={pending}>
        {pending ? "Vérification…" : "Retrouver mon accès"}
      </Button>
    </form>
  )
}

export { RecoverAccessForm }
