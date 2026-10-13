import { Button } from "@/components/ui/button"

type ConfirmDeleteProps = {
  // The link that opens the confirmation, and the button that confirms (often the same words).
  label: string
  confirmLabel: string
  pendingLabel: string
  // What will be lost, in a sentence the person reads before confirming.
  children: React.ReactNode
  action: () => void
  pending: boolean
  message?: string
}

// Pure: two-step deletion with a native <details>, so no state is needed.
function ConfirmDelete({
  label,
  confirmLabel,
  pendingLabel,
  children,
  action,
  pending,
  message,
}: ConfirmDeleteProps) {
  return (
    <details>
      <summary className="inline-flex h-11 cursor-pointer items-center text-sm font-medium text-destructive underline-offset-4 hover:underline">
        {label}
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
        <p className="text-sm">{children}</p>
        <Button
          type="submit"
          variant="destructive"
          className="h-11 justify-start"
          disabled={pending}
        >
          {pending ? pendingLabel : confirmLabel}
        </Button>
      </form>
    </details>
  )
}

export { ConfirmDelete }
