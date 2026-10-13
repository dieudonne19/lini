import { Button } from "@/components/ui/button"

type DeleteActivityProps = {
  title: string
  // True for a repeating activity: deleting it removes every occurrence.
  repeats: boolean
  action: () => void
  pending: boolean
  message?: string
}

// Pure: two-step deletion with a native <details>, so no state is needed.
function DeleteActivity({
  title,
  repeats,
  action,
  pending,
  message,
}: DeleteActivityProps) {
  return (
    <details>
      <summary className="inline-flex h-11 cursor-pointer items-center text-sm font-medium text-destructive underline-offset-4 hover:underline">
        Supprimer l&apos;activité
      </summary>
      <form
        action={action}
        className="mt-2 flex flex-col gap-3 rounded-xl bg-destructive/10 p-3"
      >
        {message && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {message}
          </p>
        )}
        <p className="text-sm">
          Supprimer « {title} »{" "}
          {repeats ? "supprime toutes ses répétitions. " : ""}
          Cette action est définitive.
        </p>
        <Button
          type="submit"
          variant="destructive"
          className="h-11 justify-start"
          disabled={pending}
        >
          {pending ? "Suppression…" : "Supprimer l'activité"}
        </Button>
      </form>
    </details>
  )
}

export { DeleteActivity }
